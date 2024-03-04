"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RpcClientSocket = exports.removeSocket = exports.ifCreateRpcClient = void 0;
const tcpClient_1 = require("../components/tcpClient");
const FrameEvent_1 = require("../event/FrameEvent");
const appUtil = __importStar(require("../util/appUtil"));
const define = __importStar(require("../util/define"));
const TSEventCenter_1 = require("../utils/TSEventCenter");
const rpcService = __importStar(require("./rpcService"));
const BSON = require('bson');
const Long = BSON.Long;
/**
 * Whether to establish a socket connection
 */
function ifCreateRpcClient(app, server) {
    // Only one socket connection is established between the two servers
    if (app.serverName < server.serverName && !app.noRpcMatrix[appUtil.getNoRpcKey(app.serverType, server.serverType)]) {
        removeSocket(server.serverName);
        new RpcClientSocket(app, server);
    }
}
exports.ifCreateRpcClient = ifCreateRpcClient;
/**
 * Remove socket connection
 */
function removeSocket(id) {
    let socket = rpcClientSockets[id];
    if (socket) {
        socket.remove();
        delete rpcClientSockets[id];
    }
}
exports.removeSocket = removeSocket;
let rpcClientSockets = {};
class RpcClientSocket {
    // private nowLen = 0;
    // private maxLen = 128000;
    constructor(app, server) {
        this.socket = null;
        this.connectTimer = null;
        this.heartbeatTimer = null;
        this.heartbeatTimeoutTimer = null;
        this.sendCache = false;
        this.interval = 0;
        this.sendArr = [];
        this.sendTimer = null;
        this.die = false;
        this.serverToken = "";
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
            }
            else {
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
    doConnect(delay) {
        if (this.die) {
            return;
        }
        let self = this;
        this.connectTimer = setTimeout(() => {
            let connectCb = function () {
                self.app.logger("frame" /* loggerType.frame */, "info" /* loggerLevel.info */, `rpcClient -> connect to rpc server success: ${self.serverName}`);
                // register
                let registerBuf = BSON.serialize({
                    "serverName": self.app.serverName,
                    "serverType": self.app.serverType,
                    "serverToken": self.serverToken
                });
                let buf = Buffer.allocUnsafe(registerBuf.length + 5);
                buf.writeUInt32BE(registerBuf.length + 1, 0);
                buf.writeUInt8(1 /* define.Rpc_Msg.register */, 4);
                registerBuf.copy(buf, 5);
                self.socket.send(buf);
                if (self.sendCache) {
                    self.sendTimer = setInterval(self.sendInterval.bind(self), self.interval);
                }
            };
            self.connectTimer = null;
            let rpcConfig = self.app.someconfig.rpc || {};
            let noDelay = rpcConfig.noDelay === false ? false : true;
            self.socket = new tcpClient_1.TcpClient(self.port, self.host, rpcConfig.maxLen || define.some_config.SocketBufferMaxLen, noDelay, connectCb);
            self.socket.on("data", self.onData.bind(self));
            self.socket.on("close", self.onClose.bind(self));
            self.socket.on("error", this.onError.bind(this));
            self.app.logger("frame" /* loggerType.frame */, "info" /* loggerLevel.info */, `rpcClient -> try to connect to rpc server: ${self.serverName}`);
        }, delay);
    }
    onError(error, error2) {
        console.error("onError", error, error2);
    }
    onClose(error) {
        this.app.rpcPool.removeSocket(this.serverName);
        clearTimeout(this.heartbeatTimer);
        clearTimeout(this.heartbeatTimeoutTimer);
        clearInterval(this.sendTimer);
        this.sendArr = [];
        // this.nowLen = 0;
        this.heartbeatTimeoutTimer = null;
        this.socket = null;
        console.error(`${this.app.serverInfo.serverName}, rpcClient -> socket closed, reconnect the rpc server later: ${this.serverName}, error: ${error}`);
        let rpcConfig = this.app.someconfig.rpc || {};
        let delay = rpcConfig.reconnectDelay || define.some_config.Time.Rpc_Reconnect_Time;
        this.doConnect(delay * 1000);
    }
    /**
     * Send heartbeat at regular intervals
     */
    heartbeatSend() {
        let rpcConfig = this.app.someconfig.rpc || {};
        let heartbeat = rpcConfig.heartbeat || define.some_config.Time.Rpc_Heart_Beat_Time;
        let timeDelay = heartbeat * 1000 - 5000 + Math.floor(5000 * Math.random());
        if (timeDelay < 5000) {
            timeDelay = 5000;
        }
        this.heartbeatTimer = setTimeout(() => {
            let buf = Buffer.allocUnsafe(5);
            buf.writeUInt32BE(1, 0);
            buf.writeUInt8(2 /* define.Rpc_Msg.heartbeat */, 4);
            this.socket.send(buf);
            this.heartbeatTimeoutStart();
            this.heartbeatTimer.refresh();
        }, timeDelay);
    }
    /**
     * After sending a heartbeat, receive a response
     */
    heartbeatResponse() {
        clearTimeout(this.heartbeatTimeoutTimer);
        this.heartbeatTimeoutTimer = null;
    }
    /**
     * After sending the heartbeat, a response must be received within a certain period of time, otherwise the connection will be disconnected
     */
    heartbeatTimeoutStart() {
        if (this.heartbeatTimeoutTimer !== null) {
            return;
        }
        let self = this;
        this.heartbeatTimeoutTimer = setTimeout(function () {
            self.app.logger("frame" /* loggerType.frame */, "error" /* loggerLevel.error */, `rpcClient -> heartbeat timeout, close the rpc socket: ${self.serverName}`);
            self.socket.close();
        }, define.some_config.Time.Rpc_Heart_Beat_Timeout_Time * 1000);
    }
    onData(data) {
        try {
            let type = data.readUInt8(0);
            if (type === 4 /* define.Rpc_Msg.clientMsgIn */) {
                this.app.backendServer.handleMsg(this.serverName, data);
            }
            else if (type === 5 /* define.Rpc_Msg.clientMsgOut */) {
                this.app.frontendServer.sendMsgByUids(data);
            }
            else if (type === 6 /* define.Rpc_Msg.rpcMsg */) {
                rpcService.handleMsg(this.serverName, data);
            }
            else if (type === 7 /* define.Rpc_Msg.rpcMsgAwait */) {
                rpcService.handleMsgAwait(this.serverName, data);
            }
            else if (type === 3 /* define.Rpc_Msg.applySession */) {
                this.app.frontendServer.applySession(data);
            }
            else if (type === 1 /* define.Rpc_Msg.register */) {
                this.registerHandle();
            }
            else if (type === 2 /* define.Rpc_Msg.heartbeat */) {
                this.heartbeatResponse();
            }
        }
        catch (e) {
            this.app.logger("msg" /* loggerType.msg */, "error" /* loggerLevel.error */, e.stack);
        }
    }
    /**
     * registration success
     */
    registerHandle() {
        this.heartbeatSend();
        this.app.rpcPool.addSocket(this.serverName, this);
        TSEventCenter_1.TSEventCenter.Instance.event(FrameEvent_1.FrameEvent.onAddServer, this.serverName);
        let isAll = true;
        for (let stype in this.app.serversConfig) {
            let serverInfo = this.app.serversConfig[stype];
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
            TSEventCenter_1.TSEventCenter.Instance.event(FrameEvent_1.FrameEvent.OnStartAll);
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
        }
        else if (this.connectTimer !== null) {
            clearTimeout(this.connectTimer);
        }
    }
    send(data) {
        if (this.sendCache) {
            this.sendArr.push(data);
            // this.nowLen += data.length;
            // gzaLog("client Send length", data.length);
            // if (this.nowLen > this.maxLen) {
            //     logServer("client Send length outsize", this.nowLen);
            //     this.sendInterval();
            // }
        }
        else {
            this.socket.send(data);
        }
    }
    sendInterval() {
        if (this.sendArr.length > 0) {
            this.socket.send(Buffer.concat(this.sendArr));
            this.sendArr.length = 0;
            // this.nowLen = 0;
        }
    }
}
exports.RpcClientSocket = RpcClientSocket;
//# sourceMappingURL=rpcClient.js.map