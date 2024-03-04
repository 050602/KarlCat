import { Application } from "..//application";
import tcpServer from "../components/tcpServer";
import { FrameEvent } from "../event/FrameEvent";
import * as define from "../util/define";
import { loggerLevel, loggerType, ServerInfo, SocketProxy } from "../util/interfaceDefine";
import { TSEventCenter } from "../utils/TSEventCenter";
import * as rpcService from "./rpcService";
const BSON = require('bson');
const Long = BSON.Long;


let serverToken: string = "";
let maxLen = 0;

export function start(app: Application, cb: () => void) {
    let rpcConfig = app.someconfig.rpc || {};
    maxLen = rpcConfig.maxLen || define.some_config.SocketBufferMaxLen
    let noDelay = rpcConfig.noDelay === false ? false : true;
    tcpServer(app.serverInfo.port, noDelay, startCb, newClientCb);

    function startCb() {
        let str = `listening at [${app.serverInfo.host}:${app.serverInfo.port}]  ${app.serverName}`;
        console.log(str);
        app.logger(loggerType.frame, loggerLevel.info, str);
        cb();
    }

    function newClientCb(socket: SocketProxy) {
        new RpcServerSocket(app, socket);
    }

    let tokenConfig = app.someconfig.recognizeToken || {};
    serverToken = tokenConfig["serverToken"] || define.some_config.Server_Token;
}

class RpcServerSocket {
    private app: Application;
    private socket: SocketProxy;
    private serverName: string = "";
    private registered: boolean = false;
    private registerTimer: NodeJS.Timeout = null as any;
    private heartbeatTimer: NodeJS.Timeout = null as any;
    private sendCache: boolean = false;
    private sendArr: Buffer[] = [];
    private sendTimer: NodeJS.Timer = null as any;
    // private nowLen = 0;
    // private maxLen = 128000;
    constructor(app: Application, socket: SocketProxy) {
        this.app = app;
        this.socket = socket;
        socket.once("data", this.onRegisterData.bind(this));
        socket.on("close", this.onClose.bind(this));
        socket.on("error", this.onError.bind(this));
        let app2 = app;
        this.registerTimer = setTimeout(function () {
            for (let stype in app2.serversConfig) {
                let serverInfo: ServerInfo[] = app2.serversConfig[stype];
                for (let sname of serverInfo) {
                    if (sname.serverName != app2.serverInfo.serverName && app2.rpcPool.getSocket(sname.serverName) == null) {
                        console.log("两个服务器间没有建立链接：", sname.serverName, app2.serverName);
                        break;
                    }
                }
            }
            console.error(`${app2.serverInfo.serverName}, rpcServer -> register timeout, close the rpc socket: ${socket.remoteAddress}`);
            socket.close();
        }, 5000);
    }


    private onError(error, error2) {
        console.error("onError", error, error2);
    }


    // The first message is registration
    private onRegisterData(data: Buffer) {
        try {
            let type = data.readUInt8(0);
            if (type === define.Rpc_Msg.register) {
                this.registerHandle(data);
            } else {
                console.error(`${this.app.serverInfo.serverName}, rpcServer -> illegal rpc register, close the rpc socket: ${this.socket.remoteAddress}`);
                this.socket.close();
            }
        } catch (e: any) {
            this.socket.close();
            this.app.logger(loggerType.frame, loggerLevel.error, e.stack);
        }
    }

    /**
     * socket received data
     * @param data
     */
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
            else if (type === define.Rpc_Msg.heartbeat) {
                this.heartbeatHandle();
                this.heartbeatResponse();
            }
            else {
                this.app.logger(loggerType.frame, loggerLevel.error, `rpcServer -> 非法数据类型, 关闭的 rpc client 名称: ${this.serverName}`);
                this.socket.close();
            }
        } catch (e: any) {
            let error: string = this.app.serverName + "---rpc onData error---" + e.stack;
            this.app.logger(loggerType.msg, loggerLevel.error, error);
        }
    }

    /**
     * The socket connection is closed
     */
    private onClose(error) {
        clearTimeout(this.registerTimer);
        clearTimeout(this.heartbeatTimer);
        this.heartbeatTimer = null as any;
        clearInterval(this.sendTimer);
        this.sendArr = [];
        // this.nowLen = 0;
        if (this.registered) {
            this.app.rpcPool.removeSocket(this.serverName);
        }
        console.error(`${this.app.serverInfo.serverName}  rpcServer -> 一个 rpc client 断开链接 名称: ${this.serverName}, ${this.socket.remoteAddress},${error}`);
    }

    /**
     * register
     */
    private registerHandle(msg: Buffer) {
        clearTimeout(this.registerTimer);
        let data: { "serverName": string, "serverType": string, "serverToken": string };
        try {
            data = BSON.deserialize(msg.subarray(1)) as any;
        } catch (err) {
            this.app.logger(loggerType.frame, loggerLevel.error, `rpcServer -> BSON 解析错误，关闭这个 rpc socket: ${this.socket.remoteAddress}`);
            this.socket.close();
            return;
        }

        // logInfo("注册handel",data);
        if (data.serverToken !== serverToken) {
            this.app.logger(loggerType.frame, loggerLevel.error, `rpcServer ->无效的服务端令牌, 关闭这个 rpc socket: ${this.socket.remoteAddress}`);
            this.socket.close();
            return;
        }
        if (this.app.rpcPool.getSocket(data.serverName)) {
            this.app.logger(loggerType.frame, loggerLevel.error, `rpcServer ->已经有这个rpc client 了，名字: ${data.serverName}, close it, ${this.socket.remoteAddress}`);
            this.socket.close();
            return;
        }
        if (this.app.serverName <= data.serverName) {
            this.socket.close();
            return;
        }
        this.registered = true;
        this.socket.maxLen = maxLen;
        this.socket.on("data", this.onData.bind(this));

        this.serverName = data.serverName;
        this.app.logger(loggerType.frame, loggerLevel.info, `rpcServer -> 获得一个新的 rpc client named: ${this.serverName}`);

        // Determine whether to send messages regularly
        let rpcConfig = this.app.someconfig.rpc || {};
        let interval = 0;
        if (rpcConfig.interval) {
            if (typeof rpcConfig.interval === "number") {
                interval = rpcConfig.interval;
            } else {
                interval = rpcConfig.interval[data.serverType] || rpcConfig.interval.default || 0;
            }
        }
        if (interval >= 10) {
            this.sendCache = true;
            this.sendTimer = setInterval(this.sendInterval.bind(this), interval);
            // let tmpMaxLen = parseInt(rpcConfig.intervalCacheLen as any) || 0;
            // if (tmpMaxLen > 0) {
            //     this.maxLen = tmpMaxLen;
            // }
        }

        // Registration is successful, respond
        let buffer = Buffer.allocUnsafe(5);
        buffer.writeUInt32BE(1, 0);
        buffer.writeUInt8(define.Rpc_Msg.register, 4);
        this.socket.send(buffer);
        this.heartbeatHandle();

        this.app.rpcPool.addSocket(this.serverName, this);

        TSEventCenter.Instance.event(FrameEvent.onAddServer, this.serverName,);
        let isAll = true;
        for (let stype in this.app.serversConfig) {
            let serverInfo: ServerInfo[] = this.app.serversConfig[stype];
            for (let sname of serverInfo) {

                if (sname.serverName != this.app.serverInfo.serverName && this.app.rpcPool.getSocket(sname.serverName) == null) {
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
     * Heartbeat
     */
    private heartbeatHandle() {
        if (this.heartbeatTimer) {
            this.heartbeatTimer.refresh();
            return;
        }

        let rpcConfig = this.app.someconfig.rpc || {};
        let heartbeat = rpcConfig.heartbeat || define.some_config.Time.Rpc_Heart_Beat_Time;
        if (heartbeat < 5) {
            heartbeat = 5;
        }
        this.heartbeatTimer = setTimeout(() => {
            this.app.logger(loggerType.frame, loggerLevel.warn, `rpcServer ->心跳超时,关闭这个RPC链接: ${this.serverName}`);
            this.socket.close();
        }, heartbeat * 1000 * 2);
    }

    /**
     * Heartbeat response
     */
    private heartbeatResponse() {
        let buffer = Buffer.allocUnsafe(5);
        buffer.writeUInt32BE(1, 0);
        buffer.writeUInt8(define.Rpc_Msg.heartbeat, 4);
        this.socket.send(buffer);
    }

    send(data: Buffer) {
        if (this.sendCache) {
            this.sendArr.push(data);
            // this.nowLen += data.length;
            // gzaLog("client Send length",data.length);
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