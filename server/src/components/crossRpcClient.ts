import { Application } from "../application";
import { TcpClient } from "./tcpClient";
import * as define from "../util/define";
import { loggerLevel, loggerType, ServerInfo, SocketProxy } from "../util/interfaceDefine";
import * as rpcService from "./rpcService";
const BSON = require("bson");

/**
 * Remove cross-rpc socket connection
 */
export function removeCrossRPCSocket(id: string) {
    let socket = crossRpcClientSockets[id];
    if (socket) {
        socket.remove();
        delete crossRpcClientSockets[id];
    }
}

let crossRpcClientSockets: { [id: string]: CrossRpcClientSocket } = {};

/**
 * Dedicated client socket from local cross to realCross.
 * Register name uses CrossNet-<zoneId> to avoid multi-zone name collision.
 */
export class CrossRpcClientSocket {
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
    private registerName: string;

    constructor(app: Application, server: ServerInfo) {
        this.app = app;
        this.serverName = server.serverName;
        this.host = server.host;
        this.port = server.port;
        this.registerName = "CrossNet-" + app.zoneConfig.zoneid;
        crossRpcClientSockets[this.serverName] = this;

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
        }

        let tokenConfig = app.someconfig.recognizeToken || {};
        this.serverToken = tokenConfig["serverToken"] || define.some_config.Server_Token;
        this.doConnect(0);
    }

    /**
     * 按重连策略连接 realCross，并发送 CrossNet 注册信息。
     */
    private doConnect(delay: number) {
        if (this.die) {
            return;
        }
        this.connectTimer = setTimeout(() => {
            this.connectTimer = null as any;
            let rpcConfig = this.app.someconfig.rpc || {};
            let noDelay = rpcConfig.noDelay === false ? false : true;
            let connectCb = () => {
                this.app.logger(loggerType.frame, loggerLevel.info, `crossRpcClient -> connect success: ${this.serverName}`);
                let registerBuf = BSON.serialize({
                    serverName: this.registerName,
                    serverType: this.app.serverType,
                    serverToken: this.serverToken,
                });
                let buf = Buffer.allocUnsafe(registerBuf.length + 5);
                buf.writeUInt32BE(registerBuf.length + 1, 0);
                buf.writeUInt8(define.Rpc_Msg.register, 4);
                registerBuf.copy(buf, 5);
                this.socket.send(buf);
                if (this.sendCache) {
                    this.sendTimer = setInterval(this.sendInterval.bind(this), this.interval);
                }
            };

            this.socket = new TcpClient(this.port, this.host, rpcConfig.maxLen || define.some_config.SocketBufferMaxLen, noDelay, connectCb);
            this.socket.on("data", this.onData.bind(this));
            this.socket.on("close", this.onClose.bind(this));
            this.socket.on("error", this.onError.bind(this));
            this.app.logger(loggerType.frame, loggerLevel.info, `crossRpcClient -> try connect: ${this.serverName}`);
        }, delay);
    }

    private onError(error, error2) {
        console.error("crossRpcClient onError", error, error2);
    }

    private onClose(error) {
        this.app.rpcPool.removeSocket(this.serverName);
        clearTimeout(this.heartbeatTimer);
        clearTimeout(this.heartbeatTimeoutTimer);
        clearInterval(this.sendTimer);
        this.sendArr = [];
        this.heartbeatTimeoutTimer = null as any;
        this.socket = null as any;
        let rpcConfig = this.app.someconfig.rpc || {};
        let delay = rpcConfig.reconnectDelay || define.some_config.Time.Rpc_Reconnect_Time;
        console.error(`${this.app.serverInfo.serverName}, crossRpcClient closed: ${this.serverName}, error: ${error}`);
        this.doConnect(delay * 1000);
    }

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

    private heartbeatResponse() {
        clearTimeout(this.heartbeatTimeoutTimer);
        this.heartbeatTimeoutTimer = null as any;
    }

    private heartbeatTimeoutStart() {
        if (this.heartbeatTimeoutTimer !== null) {
            return;
        }
        this.heartbeatTimeoutTimer = setTimeout(() => {
            this.app.logger(loggerType.frame, loggerLevel.error, `crossRpcClient -> heartbeat timeout: ${this.serverName}`);
            this.socket.close();
        }, define.some_config.Time.Rpc_Heart_Beat_Timeout_Time * 1000);
    }

    /**
     * 接收 realCross 回包：
     * - 标准 rpc 流量
     * - realCross->cross 反向透传包
     */
    private onData(data: Buffer) {
        try {
            let type = data.readUInt8(0);
            if (type === define.Rpc_Msg.clientMsgIn) {
                this.app.backendServer.handleMsg(this.serverName, data);
            } else if (type === define.Rpc_Msg.clientMsgOut) {
                if (this.app.frontendServer) {
                    this.app.frontendServer.sendMsgByUids(data);
                } else {
                    this.app.backendServer.onForwardRealCross2cross_inCrossZone(this.serverName, data);
                }
            } else if (type === define.Rpc_Msg.rpcMsg) {
                rpcService.handleMsg(this.serverName, data);
            } else if (type === define.Rpc_Msg.rpcMsgAwait) {
                rpcService.handleMsgAwait(this.serverName, data);
            } else if (type === define.Rpc_Msg.applySession) {
                if (this.app.frontendServer) {
                    this.app.frontendServer.applySession(data);
                } else {
                    this.app.backendServer.onForwardRealCross2cross_inCrossZone(this.serverName, data);
                }
            } else if (type === define.Rpc_Msg.register) {
                this.registerHandle();
            } else if (type === define.Rpc_Msg.heartbeat) {
                this.heartbeatResponse();
            } else if (type === define.Rpc_Msg.forward_realCross2cross_inCrossZone) {
                this.app.backendServer.onForwardRealCross2cross_inCrossZone(this.serverName, data);
            }
        } catch (e: any) {
            this.app.logger(loggerType.msg, loggerLevel.error, e.stack);
        }
    }

    private registerHandle() {
        this.heartbeatSend();
        this.app.rpcPool.addSocket(this.serverName, this);
    }

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
        } else {
            this.socket.send(data);
        }
    }

    private sendInterval() {
        if (this.sendArr.length > 0) {
            this.socket.send(Buffer.concat(this.sendArr));
            this.sendArr.length = 0;
        }
    }
}
