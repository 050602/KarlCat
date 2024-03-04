import { Application } from "../application";
import { TcpClient } from "../components/tcpClient";
import { FrameEvent } from "../event/FrameEvent";
import * as appUtil from "../util/appUtil";
import * as define from "../util/define";
import { loggerLevel, loggerType, ServerInfo, SocketProxy } from "../util/interfaceDefine";
import { TSEventCenter } from "../utils/TSEventCenter";
import * as rpcService from "./rpcService";
const BSON = require('bson');
const Long = BSON.Long;


/**
 * Whether to establish a socket connection
 */
export function ifCreateRpcClient(app: Application, server: ServerInfo) {
    // Only one socket connection is established between the two servers
    if (app.serverName < server.serverName && !app.noRpcMatrix[appUtil.getNoRpcKey(app.serverType, server.serverType)]) {
        removeSocket(server.serverName);
        new RpcClientSocket(app, server);
    }
}

/**
 * Remove socket connection
 */
export function removeSocket(id: string) {
    let socket = rpcClientSockets[id];
    if (socket) {
        socket.remove();
        delete rpcClientSockets[id];
    }
}

let rpcClientSockets: { [id: string]: RpcClientSocket } = {};

export class RpcClientSocket {
    private app: Application;
    public serverName: string;
    private host: string;
    private port: number;
    private socket: SocketProxy = null as any;
    private connectTimer: NodeJS.Timer = null as any;
    private heartbeatTimer: NodeJS.Timer = null as any;
    private heartbeatTimeoutTimer: NodeJS.Timer = null as any;
    private sendCache: boolean = false;
    private interval: number = 0;
    private sendArr: Buffer[] = [];
    private sendTimer: NodeJS.Timer = null as any;
    private die: boolean = false;
    private serverToken: string = "";
    // private nowLen = 0;
    // private maxLen = 128000;

    constructor(app: Application, server: ServerInfo) {
        this.app = app;
        this.serverName = server.serverName;
        this.host = server.host;
        this.port = server.port;
        rpcClientSockets[this.serverName] = this;
        let rpcConfig = app.someconfig.rpc || {};
        let interval = 0;
        if (rpcConfig.interval) {
            if (typeof rpcConfig.interval === "number") {
                interval = rpcConfig.interval;
            } else {
                interval = rpcConfig.interval[server.serverType] || rpcConfig.interval.default || 0;
            }
        }

        if (interval >= 10) {
            this.sendCache = true;
            this.interval = interval;
            // let tmpMaxLen = parseInt(rpcConfig.intervalCacheLen as any) || 0;
            // if (tmpMaxLen > 0) {
            //     this.maxLen = tmpMaxLen;
            // }
        }
        let tokenConfig = app.someconfig.recognizeToken || {};
        this.serverToken = tokenConfig["serverToken"] || define.some_config.Server_Token;
        this.doConnect(0);
    }

    private doConnect(delay: number) {
        if (this.die) {
            return;
        }
        let self = this;
        this.connectTimer = setTimeout(() => {
            let connectCb = function () {
                self.app.logger(loggerType.frame, loggerLevel.info, `rpcClient -> connect to rpc server success: ${self.serverName}`);

                // register
                let registerBuf = BSON.serialize({
                    "serverName": self.app.serverName,
                    "serverType": self.app.serverType,
                    "serverToken": self.serverToken
                });
                let buf = Buffer.allocUnsafe(registerBuf.length + 5);
                buf.writeUInt32BE(registerBuf.length + 1, 0);
                buf.writeUInt8(define.Rpc_Msg.register, 4);
                registerBuf.copy(buf, 5);
                self.socket.send(buf);
                if (self.sendCache) {
                    self.sendTimer = setInterval(self.sendInterval.bind(self), self.interval);
                }
            };
            self.connectTimer = null as any;
            let rpcConfig = self.app.someconfig.rpc || {};
            let noDelay = rpcConfig.noDelay === false ? false : true;
            self.socket = new TcpClient(self.port, self.host, rpcConfig.maxLen || define.some_config.SocketBufferMaxLen, noDelay, connectCb);
            self.socket.on("data", self.onData.bind(self));
            self.socket.on("close", self.onClose.bind(self));
            self.socket.on("error", this.onError.bind(this));
            self.app.logger(loggerType.frame, loggerLevel.info, `rpcClient -> try to connect to rpc server: ${self.serverName}`);
        }, delay);
    }


    private onError(error, error2) {
        console.error("onError", error, error2);
    }


    private onClose(error) {
        this.app.rpcPool.removeSocket(this.serverName);
        clearTimeout(this.heartbeatTimer);
        clearTimeout(this.heartbeatTimeoutTimer);
        clearInterval(this.sendTimer);
        this.sendArr = [];
        // this.nowLen = 0;
        this.heartbeatTimeoutTimer = null as any;
        this.socket = null as any;
        console.error(`${this.app.serverInfo.serverName}, rpcClient -> socket closed, reconnect the rpc server later: ${this.serverName}, error: ${error}`);
        let rpcConfig = this.app.someconfig.rpc || {};
        let delay = rpcConfig.reconnectDelay || define.some_config.Time.Rpc_Reconnect_Time;
        this.doConnect(delay * 1000);
    }

    /**
     * Send heartbeat at regular intervals
     */
    private heartbeatSend() {

        let rpcConfig = this.app.someconfig.rpc || {};
        let heartbeat = rpcConfig.heartbeat || define.some_config.Time.Rpc_Heart_Beat_Time;
        let timeDelay = heartbeat * 1000 - 5000 + Math.floor(5000 * Math.random());
        if (timeDelay < 5000) {
            timeDelay = 5000;
        }
        this.heartbeatTimer = setTimeout(() => {
            let buf = Buffer.allocUnsafe(5);
            buf.writeUInt32BE(1, 0);
            buf.writeUInt8(define.Rpc_Msg.heartbeat, 4);
            this.socket.send(buf);
            this.heartbeatTimeoutStart();
            this.heartbeatTimer.refresh();
        }, timeDelay);
    }

    /**
     * After sending a heartbeat, receive a response
     */
    private heartbeatResponse() {
        clearTimeout(this.heartbeatTimeoutTimer);
        this.heartbeatTimeoutTimer = null as any;
    }

    /**
     * After sending the heartbeat, a response must be received within a certain period of time, otherwise the connection will be disconnected
     */
    private heartbeatTimeoutStart() {
        if (this.heartbeatTimeoutTimer !== null) {
            return;
        }
        let self = this;
        this.heartbeatTimeoutTimer = setTimeout(function () {
            self.app.logger(loggerType.frame, loggerLevel.error, `rpcClient -> heartbeat timeout, close the rpc socket: ${self.serverName}`);
            self.socket.close();
        }, define.some_config.Time.Rpc_Heart_Beat_Timeout_Time * 1000);

    }

    private onData(data: Buffer) {
        try {
            let type = data.readUInt8(0);
            if (type === define.Rpc_Msg.clientMsgIn) {
                this.app.backendServer.handleMsg(this.serverName, data);
            }
            else if (type === define.Rpc_Msg.clientMsgOut) {
                this.app.frontendServer.sendMsgByUids(data);
            }
            else if (type === define.Rpc_Msg.rpcMsg) {
                rpcService.handleMsg(this.serverName, data);
            }
            else if (type === define.Rpc_Msg.rpcMsgAwait) {
                rpcService.handleMsgAwait(this.serverName, data);
            }
            else if (type === define.Rpc_Msg.applySession) {
                this.app.frontendServer.applySession(data);
            }
            else if (type === define.Rpc_Msg.register) {
                this.registerHandle();
            }
            else if (type === define.Rpc_Msg.heartbeat) {
                this.heartbeatResponse();
            }
        } catch (e: any) {
            this.app.logger(loggerType.msg, loggerLevel.error, e.stack);
        }
    }

    /**
     * registration success
     */
    private registerHandle() {
        this.heartbeatSend();
        this.app.rpcPool.addSocket(this.serverName, this);
        TSEventCenter.Instance.event(FrameEvent.onAddServer, this.serverName);

        let isAll = true;
        for (let stype in this.app.serversConfig) {
            let serverInfo: ServerInfo[] = this.app.serversConfig[stype];
            for (let sname of serverInfo) {
                if (sname.serverName != this.app.serverName && this.app.rpcPool.getSocket(sname.serverName) == null) {
                    isAll = false;
                    break;
                }
            }
            if (!isAll) {
                break;
            }
        }

        if (isAll) {
            TSEventCenter.Instance.event(FrameEvent.OnStartAll);
            console.log("OnStartAll");
        }

    }

    /**
     * Remove the socket
     */
    remove() {
        this.die = true;
        if (this.socket) {
            this.socket.close();
        } else if (this.connectTimer !== null) {
            clearTimeout(this.connectTimer);
        }
    }

    send(data: Buffer) {
        if (this.sendCache) {
            this.sendArr.push(data);
            // this.nowLen += data.length;
            // gzaLog("client Send length", data.length);
            // if (this.nowLen > this.maxLen) {
            //     logServer("client Send length outsize", this.nowLen);
            //     this.sendInterval();
            // }
        } else {
            this.socket.send(data);
        }
    }

    private sendInterval() {
        if (this.sendArr.length > 0) {
            this.socket.send(Buffer.concat(this.sendArr));
            this.sendArr.length = 0;
            // this.nowLen = 0;
        }
    }
} 