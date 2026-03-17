import { Application } from "../application";
import { ServerType } from "../register/route";
import * as define from "../util/define";
import { loggerLevel, loggerType, SocketProxy } from "../util/interfaceDefine";
import * as rpcService from "./rpcService";
const BSON = require("bson");

let serverToken: string = "";
let maxLen = 0;

/**
 * realCross 专用跨区 rpc 接入入口。
 * 仅在 realCross 进程监听端使用，不影响普通 rpcServer 逻辑。
 */
export function startCross(app: Application, socket: SocketProxy) {
    let tokenConfig = app.someconfig.recognizeToken || {};
    serverToken = tokenConfig["serverToken"] || define.some_config.Server_Token;
    let rpcConfig = app.someconfig.rpc || {};
    maxLen = rpcConfig.maxLen || define.some_config.SocketBufferMaxLen;
    new CrossRpcServerSocket(app, socket);
}

class CrossRpcServerSocket {
    private app: Application;
    private socket: SocketProxy;
    private serverName: string = "";
    private registered: boolean = false;
    private registerTimer: NodeJS.Timeout = null as any;
    private heartbeatTimer: NodeJS.Timeout = null as any;
    private sendCache: boolean = false;
    private sendArr: Buffer[] = [];
    private sendTimer: NodeJS.Timer = null as any;

    constructor(app: Application, socket: SocketProxy) {
        this.app = app;
        this.socket = socket;
        socket.once("data", this.onRegisterData.bind(this));
        socket.on("close", this.onClose.bind(this));
        socket.on("error", this.onError.bind(this));
        this.registerTimer = setTimeout(() => {
            this.app.logger(loggerType.frame, loggerLevel.error, `crossRpcServer -> register timeout: ${socket.remoteAddress}`);
            socket.close();
        }, 5000);
    }

    private onError(error, error2) {
        console.error("crossRpcServer onError", error, error2);
    }

    /**
     * 首包必须是 register，非 register 直接断开。
     */
    private onRegisterData(data: Buffer) {
        try {
            let type = data.readUInt8(0);
            if (type === define.Rpc_Msg.register) {
                this.registerHandle(data);
            } else {
                this.app.logger(loggerType.frame, loggerLevel.error, `crossRpcServer -> illegal register packet: ${this.socket.remoteAddress}`);
                this.socket.close();
            }
        } catch (e: any) {
            this.socket.close();
            this.app.logger(loggerType.frame, loggerLevel.error, e.stack);
        }
    }

    /**
     * realCross 侧处理跨区消息：
     * 1. 标准 rpc 消息（rpcMsg/rpcMsgAwait）
     * 2. cross 代理来的客户端协议透传（forward_cross2RealCross_inSubZone）
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
            } else if (type === define.Rpc_Msg.heartbeat) {
                this.heartbeatHandle();
                this.heartbeatResponse();
            } else if (type === define.Rpc_Msg.forward_cross2RealCross_inSubZone) {
                this.app.backendServer.onForwardCross2RealCross_inSubZone(this.serverName, data);
            } else {
                this.app.logger(loggerType.frame, loggerLevel.error, `crossRpcServer -> illegal data type: ${this.serverName}`);
                this.socket.close();
            }
        } catch (e: any) {
            this.app.logger(loggerType.msg, loggerLevel.error, `${this.app.serverName} crossRpcServer onData ${e.stack}`);
        }
    }

    private onClose(error) {
        clearTimeout(this.registerTimer);
        clearTimeout(this.heartbeatTimer);
        this.heartbeatTimer = null as any;
        clearInterval(this.sendTimer);
        this.sendArr = [];
        if (this.registered) {
            this.app.rpcPool.removeSocket(this.serverName);
        }
        console.error(`${this.app.serverInfo.serverName} crossRpcServer disconnected: ${this.serverName}, ${this.socket.remoteAddress}, ${error}`);
    }

    private registerHandle(msg: Buffer) {
        clearTimeout(this.registerTimer);
        let data: { serverName: string, serverType: string, serverToken: string };
        try {
            data = BSON.deserialize(msg.subarray(1)) as any;
        } catch (err) {
            this.app.logger(loggerType.frame, loggerLevel.error, `crossRpcServer -> bson parse error: ${this.socket.remoteAddress}`);
            this.socket.close();
            return;
        }

        if (data.serverToken !== serverToken) {
            this.app.logger(loggerType.frame, loggerLevel.error, `crossRpcServer -> illegal token: ${this.socket.remoteAddress}`);
            this.socket.close();
            return;
        }
        if (data.serverType !== ServerType.cross) {
            this.app.logger(loggerType.frame, loggerLevel.error, `crossRpcServer -> only cross may connect: ${data.serverType}`);
            this.socket.close();
            return;
        }
        // 仅接受 CrossNet-<zoneId> 命名，避免普通 serverName 误接入跨区链路。
        if (!data.serverName || !data.serverName.startsWith("CrossNet-")) {
            this.app.logger(loggerType.frame, loggerLevel.error, `crossRpcServer -> illegal serverName: ${data.serverName}`);
            this.socket.close();
            return;
        }
        if (this.app.rpcPool.getSocket(data.serverName)) {
            this.app.logger(loggerType.frame, loggerLevel.error, `crossRpcServer -> duplicate serverName: ${data.serverName}`);
            this.socket.close();
            return;
        }

        this.registered = true;
        this.serverName = data.serverName;
        this.socket.maxLen = maxLen;
        this.socket.on("data", this.onData.bind(this));

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
        }

        let buffer = Buffer.allocUnsafe(5);
        buffer.writeUInt32BE(1, 0);
        buffer.writeUInt8(define.Rpc_Msg.register, 4);
        this.socket.send(buffer);
        this.heartbeatHandle();
        this.app.rpcPool.addSocket(this.serverName, this);
        this.app.logger(loggerType.frame, loggerLevel.info, `crossRpcServer -> connected: ${this.serverName}`);
    }

    /**
     * 与普通 rpcServer 一致的心跳保活机制。
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
            this.app.logger(loggerType.frame, loggerLevel.warn, `crossRpcServer -> heartbeat timeout: ${this.serverName}`);
            this.socket.close();
        }, heartbeat * 1000 * 2);
    }

    private heartbeatResponse() {
        let buffer = Buffer.allocUnsafe(5);
        buffer.writeUInt32BE(1, 0);
        buffer.writeUInt8(define.Rpc_Msg.heartbeat, 4);
        this.socket.send(buffer);
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
