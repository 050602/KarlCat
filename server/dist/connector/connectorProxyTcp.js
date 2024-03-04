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
exports.ConnectorTcp = void 0;
const crypto = __importStar(require("crypto"));
const app_1 = require("../app");
const tcpServer_1 = __importDefault(require("../components/tcpServer"));
const SocketState_1 = require("../const/SocketState");
const define = __importStar(require("../util/define"));
let maxLen = 0;
/**
 * connector  tcp
 */
class ConnectorTcp {
    constructor(info) {
        this.clientManager = null;
        this.handshakeBuf = null; // Handshake buffer
        this.handshakeBufAll = null; // Handshake buffer all
        this.heartbeatTime = 0; // Heartbeat time
        this.maxConnectionNum = Number.POSITIVE_INFINITY;
        this.nowConnectionNum = 0;
        this.sendCache = false;
        this.interval = 0;
        this.md5 = ""; // route array md5
        this.app = info.app;
        this.clientManager = info.clientManager;
        let connectorConfig = info.config || {};
        maxLen = connectorConfig.maxLen || define.some_config.SocketBufferMaxLen;
        let noDelay = connectorConfig.noDelay === false ? false : true;
        this.heartbeatTime = (connectorConfig.heartbeat || 0) * 1000;
        if (connectorConfig.maxConnectionNum != null) {
            this.maxConnectionNum = connectorConfig.maxConnectionNum;
        }
        let interval = Number(connectorConfig.interval) || 0;
        if (interval >= 10) {
            this.sendCache = true;
            this.interval = interval;
        }
        (0, tcpServer_1.default)(info.app.serverInfo.clientPort, noDelay, info.startCb, this.newClientCb.bind(this));
        // Handshake buffer
        let cipher = crypto.createHash("md5");
        this.md5 = cipher.update(JSON.stringify(app_1.app.serversConfig)).digest("hex");
        let routeBuf = Buffer.from(JSON.stringify({ "md5": this.md5, "heartbeat": this.heartbeatTime * 0.001 }));
        this.handshakeBuf = Buffer.alloc(routeBuf.length + 5);
        this.handshakeBuf.writeUInt32BE(routeBuf.length + 1, 0);
        this.handshakeBuf.writeUInt8(2 /* define.Server_To_Client.handshake */, 4);
        routeBuf.copy(this.handshakeBuf, 5);
        let routeBufAll = Buffer.from(JSON.stringify({ "md5": this.md5, "route": "", "heartbeat": this.heartbeatTime * 0.001 }));
        this.handshakeBufAll = Buffer.alloc(routeBufAll.length + 5);
        this.handshakeBufAll.writeUInt32BE(routeBufAll.length + 1, 0);
        this.handshakeBufAll.writeUInt8(2 /* define.Server_To_Client.handshake */, 4);
        routeBufAll.copy(this.handshakeBufAll, 5);
        // Heartbeat response buffer
        this.heartbeatBuf = Buffer.alloc(5);
        this.heartbeatBuf.writeUInt32BE(1, 0);
        this.heartbeatBuf.writeUInt8(3 /* define.Server_To_Client.heartbeatResponse */, 4);
    }
    newClientCb(socket) {
        if (!SocketState_1.SocketState.Instance.openClientSocket) {
            socket.close();
            return;
        }
        if (this.nowConnectionNum < this.maxConnectionNum) {
            new ClientSocket(this, this.clientManager, socket);
        }
        else {
            console.warn("socket num has reached the maxConnectionNum, close it");
            socket.close();
        }
    }
}
exports.ConnectorTcp = ConnectorTcp;
class ClientSocket {
    constructor(connector, clientManager, socket) {
        this.session = null; // Session
        this.remoteAddress = "";
        this.remotePort = 0;
        this.registerTimer = null; // Handshake timeout timer
        this.heartbeatTimer = null; // Heartbeat timeout timer
        this.sendCache = false;
        this.interval = 0;
        this.sendTimer = null;
        this.sendArr = [];
        this.connector = connector;
        this.connector.nowConnectionNum++;
        this.sendCache = connector.sendCache;
        this.interval = connector.interval;
        this.clientManager = clientManager;
        this.socket = socket;
        this.remoteAddress = socket.remoteAddress.replace("::ffff:", "");
        this.remotePort = socket.remotePort;
        this.socket.maxLen = 50; // Up to 50 byte of data when not registered
        socket.once('data', this.onRegister.bind(this));
        socket.on('close', this.onClose.bind(this));
        this.registerTimer = setTimeout(() => {
            this.close();
        }, 10000);
    }
    onRegister(data) {
        let type = data.readUInt8(0);
        if (type === 2 /* define.Client_To_Server.handshake */) { // shake hands
            this.handshake(data);
        }
        else {
            this.close();
        }
    }
    /**
     * Received data
     */
    onData(data) {
        // logInfo("ondata", data);
        let type = data.readUInt8(0);
        if (type === 1 /* define.Client_To_Server.msg */) { // Ordinary custom message
            this.clientManager.handleMsg(this, data);
        }
        else if (type === 3 /* define.Client_To_Server.heartbeat */) { // Heartbeat
            this.heartbeat();
            this.heartbeatResponse();
        }
        else {
            this.close();
        }
    }
    /**
     * closed
     */
    onClose() {
        console.log("OnSocket OnClose");
        this.connector.nowConnectionNum--;
        clearTimeout(this.registerTimer);
        clearTimeout(this.heartbeatTimer);
        this.heartbeatTimer = null;
        clearInterval(this.sendTimer);
        this.sendArr = [];
        this.clientManager.removeClient(this);
    }
    /**
     * shake hands
     */
    handshake(data) {
        let msg = null;
        try {
            msg = JSON.parse(data.subarray(1).toString());
        }
        catch (e) {
        }
        if (!msg) {
            this.close();
            return;
        }
        if (msg.md5 === this.connector.md5) {
            this.send(this.connector.handshakeBuf);
        }
        else {
            this.send(this.connector.handshakeBufAll);
        }
        clearTimeout(this.registerTimer);
        this.heartbeat();
        this.clientManager.addClient(this);
        if (this.sendCache) {
            this.sendTimer = setInterval(this.sendInterval.bind(this), this.interval);
        }
        this.socket.maxLen = maxLen;
        this.socket.on('data', this.onData.bind(this));
    }
    /**
     * Heartbeat
     */
    heartbeat() {
        if (this.connector.heartbeatTime === 0) {
            return;
        }
        // logInfo("heartbeat");
        if (this.heartbeatTimer) {
            this.heartbeatTimer.refresh();
        }
        else {
            this.heartbeatTimer = setTimeout(() => {
                if (this.session.uid > 0) {
                    console.warn(this.connector.app.serverInfo, "心跳超时断开", this.session.uid, this.connector.heartbeatTime * 4);
                }
                this.close();
                // logInfo("heartbeat Time out");
            }, this.connector.heartbeatTime * 4);
        }
    }
    /**
     * Heartbeat response
     */
    heartbeatResponse() {
        this.send(this.connector.heartbeatBuf);
    }
    /**
     * send data
     */
    send(msg) {
        // gzaLog("send", msg.length);
        if (this.sendCache) {
            this.sendArr.push(msg);
        }
        else {
            this.socket.send(msg);
        }
    }
    sendInterval() {
        if (this.sendArr.length > 0) {
            this.socket.send(Buffer.concat(this.sendArr));
            this.sendArr.length = 0;
        }
    }
    /**
     * close
     */
    close() {
        this.sendInterval();
        this.socket.close();
    }
}
//# sourceMappingURL=connectorProxyTcp.js.map