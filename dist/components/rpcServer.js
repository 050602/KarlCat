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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.start = void 0;
const tcpServer_1 = __importDefault(require("../components/tcpServer"));
const define = __importStar(require("../util/define"));
const rpcService = __importStar(require("./rpcService"));
const TSEventCenter_1 = require("../utils/TSEventCenter");
const FrameEvent_1 = require("../event/FrameEvent");
const LogTS_1 = require("../LogTS");
// import BSON from "bson";
const BSON = require('bson');
const Long = BSON.Long;
let serverToken = "";
let maxLen = 0;
function start(app, cb) {
    let rpcConfig = app.someconfig.rpc || {};
    maxLen = rpcConfig.maxLen || define.some_config.SocketBufferMaxLen;
    let noDelay = rpcConfig.noDelay === false ? false : true;
    (0, tcpServer_1.default)(app.serverInfo.port, noDelay, startCb, newClientCb);
    function startCb() {
        let str = `listening at [${app.serverInfo.host}:${app.serverInfo.port}]  ${app.serverName}`;
        (0, LogTS_1.logInfo)(str);
        app.logger("frame" /* loggerType.frame */, "info" /* loggerLevel.info */, str);
        cb();
    }
    function newClientCb(socket) {
        new RpcServerSocket(app, socket);
    }
    let tokenConfig = app.someconfig.recognizeToken || {};
    serverToken = tokenConfig["serverToken"] || define.some_config.Server_Token;
}
exports.start = start;
class RpcServerSocket {
    constructor(app, socket) {
        this.id = "";
        this.registered = false;
        this.registerTimer = null;
        this.heartbeatTimer = null;
        this.sendCache = false;
        this.sendArr = [];
        this.sendTimer = null;
        this.app = app;
        this.socket = socket;
        socket.once("data", this.onRegisterData.bind(this));
        socket.on("close", this.onClose.bind(this));
        this.registerTimer = setTimeout(function () {
            app.logger("frame" /* loggerType.frame */, "error" /* loggerLevel.error */, `rpcServer -> register timeout, close the rpc socket: ${socket.remoteAddress}`);
            socket.close();
        }, 5000);
    }
    // The first message is registration
    onRegisterData(data) {
        try {
            let type = data.readUInt8(0);
            if (type === 1 /* define.Rpc_Msg.register */) {
                this.registerHandle(data);
            }
            else {
                this.app.logger("frame" /* loggerType.frame */, "error" /* loggerLevel.error */, `rpcServer -> illegal rpc register, close the rpc socket: ${this.socket.remoteAddress}`);
                this.socket.close();
            }
        }
        catch (e) {
            this.socket.close();
            this.app.logger("frame" /* loggerType.frame */, "error" /* loggerLevel.error */, e.stack);
        }
    }
    /**
     * socket received data
     * @param data
     */
    onData(data) {
        try {
            let type = data.readUInt8(0);
            if (type === 4 /* define.Rpc_Msg.clientMsgIn */) {
                this.app.backendServer.handleMsg(this.id, data);
            }
            else if (type === 5 /* define.Rpc_Msg.clientMsgOut */) {
                this.app.frontendServer.sendMsgByUids(data);
            }
            else if (type === 6 /* define.Rpc_Msg.rpcMsg */) {
                rpcService.handleMsg(this.id, data);
            }
            else if (type === 7 /* define.Rpc_Msg.rpcMsgAwait */) {
                rpcService.handleMsgAwait(this.id, data);
            }
            else if (type === 3 /* define.Rpc_Msg.applySession */) {
                this.app.frontendServer.applySession(data);
            }
            else if (type === 2 /* define.Rpc_Msg.heartbeat */) {
                this.heartbeatHandle();
                this.heartbeatResponse();
            }
            else {
                this.app.logger("frame" /* loggerType.frame */, "error" /* loggerLevel.error */, `rpcServer -> illegal data type, close rpc client named: ${this.id}`);
                this.socket.close();
            }
        }
        catch (e) {
            this.app.logger("msg" /* loggerType.msg */, "error" /* loggerLevel.error */, e.stack);
        }
    }
    /**
     * The socket connection is closed
     */
    onClose() {
        clearTimeout(this.registerTimer);
        clearTimeout(this.heartbeatTimer);
        this.heartbeatTimer = null;
        clearInterval(this.sendTimer);
        this.sendArr = [];
        if (this.registered) {
            this.app.rpcPool.removeSocket(this.id);
        }
        this.app.logger("frame" /* loggerType.frame */, "error" /* loggerLevel.error */, `rpcServer -> a rpc client disconnected: ${this.id}, ${this.socket.remoteAddress}`);
    }
    /**
     * register
     */
    registerHandle(msg) {
        clearTimeout(this.registerTimer);
        let data;
        try {
            data = BSON.deserialize(msg.subarray(1));
        }
        catch (err) {
            this.app.logger("frame" /* loggerType.frame */, "error" /* loggerLevel.error */, `rpcServer -> JSON parse error，close the rpc socket: ${this.socket.remoteAddress}`);
            this.socket.close();
            return;
        }
        // logInfo("注册handel",data);
        if (data.serverToken !== serverToken) {
            this.app.logger("frame" /* loggerType.frame */, "error" /* loggerLevel.error */, `rpcServer -> illegal serverToken, close the rpc socket: ${this.socket.remoteAddress}`);
            this.socket.close();
            return;
        }
        if (this.app.rpcPool.getSocket(data.serverName)) {
            this.app.logger("frame" /* loggerType.frame */, "error" /* loggerLevel.error */, `rpcServer -> already has a rpc client named: ${data.serverName}, close it, ${this.socket.remoteAddress}`);
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
        this.id = data.serverName;
        this.app.logger("frame" /* loggerType.frame */, "info" /* loggerLevel.info */, `rpcServer -> get new rpc client named: ${this.id}`);
        // Determine whether to send messages regularly
        let rpcConfig = this.app.someconfig.rpc || {};
        let interval = 0;
        if (rpcConfig.interval) {
            if (typeof rpcConfig.interval === "number") {
                interval = rpcConfig.interval;
            }
            else {
                interval = rpcConfig.interval[data.serverType] || rpcConfig.interval.default || 0;
            }
        }
        if (interval >= 10) {
            this.sendCache = true;
            this.sendTimer = setInterval(this.sendInterval.bind(this), interval);
        }
        // Registration is successful, respond
        let buffer = Buffer.allocUnsafe(5);
        buffer.writeUInt32BE(1, 0);
        buffer.writeUInt8(1 /* define.Rpc_Msg.register */, 4);
        this.socket.send(buffer);
        this.heartbeatHandle();
        this.app.rpcPool.addSocket(this.id, this);
        (0, LogTS_1.logInfo)("addSocket", this.id);
        TSEventCenter_1.TSEventCenter.Instance.event(FrameEvent_1.FrameEvent.onAddServer, this.id);
    }
    /**
     * Heartbeat
     */
    heartbeatHandle() {
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
            this.app.logger("frame" /* loggerType.frame */, "warn" /* loggerLevel.warn */, `rpcServer -> heartBeat time out, close it: ${this.id}`);
            this.socket.close();
        }, heartbeat * 1000 * 2);
    }
    /**
     * Heartbeat response
     */
    heartbeatResponse() {
        let buffer = Buffer.allocUnsafe(5);
        buffer.writeUInt32BE(1, 0);
        buffer.writeUInt8(2 /* define.Rpc_Msg.heartbeat */, 4);
        this.socket.send(buffer);
    }
    send(data) {
        if (this.sendCache) {
            this.sendArr.push(data);
        }
        else {
            this.socket.send(data);
        }
    }
    sendInterval() {
        if (this.sendArr.length > 0) {
            this.socket.send(Buffer.concat(this.sendArr));
            this.sendArr.length = 0;
        }
    }
}
//# sourceMappingURL=rpcServer.js.map