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
exports.ClientSocket = exports.ConnectorWs = void 0;
const crypto = __importStar(require("crypto"));
const events_1 = require("events");
const http = __importStar(require("http"));
const https = __importStar(require("https"));
const ws = __importStar(require("ws"));
const LogTS_1 = require("../LogTS");
const servers_1 = require("../serverConfig/servers");
const define = __importStar(require("../util/define"));
let maxLen = 0;
/**
 * connector  ws
 */
class ConnectorWs {
    constructor(info) {
        this.clientManager = null;
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
        this.heartbeatTime = (connectorConfig.heartbeat || 0) * 1000;
        if (connectorConfig.maxConnectionNum != null) {
            this.maxConnectionNum = connectorConfig.maxConnectionNum;
        }
        let interval = Number(connectorConfig.interval) || 0;
        if (interval >= 10) {
            this.sendCache = true;
            this.interval = interval;
        }
        wsServer(info.app.serverInfo.clientPort, connectorConfig, info.startCb, this.newClientCb.bind(this));
        // Handshake buffer
        let cipher = crypto.createHash("md5");
        this.md5 = cipher.update(JSON.stringify(servers_1.serversConfig)).digest("hex");
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
        if (this.nowConnectionNum < this.maxConnectionNum) {
            new ClientSocket(this, this.clientManager, socket);
        }
        else {
            (0, LogTS_1.warningLog)("socket num has reached the maxConnectionNum, close it");
            socket.close();
        }
    }
}
exports.ConnectorWs = ConnectorWs;
class ClientSocket {
    constructor(connector, clientManager, socket) {
        this.session = null; // Session
        this.remoteAddress = "";
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
        this.remoteAddress = socket.remoteAddress;
        this.socket.socket._receiver._maxPayload = 50; // Up to 50 byte of data when not registered
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
        this.socket.socket._receiver._maxPayload = maxLen;
        this.socket.on('data', this.onData.bind(this));
    }
    /**
     * Heartbeat
     */
    heartbeat() {
        if (this.connector.heartbeatTime === 0) {
            return;
        }
        if (this.heartbeatTimer) {
            this.heartbeatTimer.refresh();
        }
        else {
            this.heartbeatTimer = setTimeout(() => {
                this.close();
            }, this.connector.heartbeatTime * 2);
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
exports.ClientSocket = ClientSocket;
/**
 * websocket server
 */
function wsServer(port, config, startCb, newClientCb) {
    let httpServer = config["ssl"] ? https.createServer({ "cert": config["cert"], "key": config["key"] }) : http.createServer();
    let server = new ws.Server({ "server": httpServer });
    server.on("connection", function (socket, req) {
        (0, LogTS_1.logInfo)("链接");
        newClientCb(new WsSocket(socket, req.connection.remoteAddress));
    });
    server.on("error", (err) => {
        (0, LogTS_1.logInfo)("error", err);
        process.exit();
    });
    server.on("close", () => { });
    httpServer.listen(port, startCb);
}
class WsSocket extends events_1.EventEmitter {
    constructor(socket, remoteAddress) {
        super();
        this.die = false;
        this.remoteAddress = "";
        this.maxLen = 0;
        this.len = 0;
        this.buffer = null;
        this.headLen = 0;
        this.headBuf = Buffer.alloc(4);
        this.onDataFunc = null;
        this.socket = socket;
        this.remoteAddress = remoteAddress;
        socket.on("close", () => {
            this.onClose();
        });
        socket.on("error", (err) => {
            this.onClose(err);
        });
        this.onDataFunc = this.onData.bind(this);
        socket.on("message", this.onDataFunc);
    }
    onClose(err) {
        if (!this.die) {
            this.die = true;
            this.socket.off("message", this.onDataFunc);
            this.emit("close", err);
        }
    }
    onData(data) {
        let index = 0;
        while (index < data.length) {
            let msgLen = data.readUInt32BE(index);
            // logInfo("index==", data.length, index < data.length, msgLen, index + 4 + msgLen);
            this.emit("data", data.subarray(index + 4, index + 4 + msgLen));
            index += msgLen + 4;
        }
    }
    send(data) {
        this.socket.send(data);
    }
    close() {
        this.socket.close();
        this.socket.emit("close");
    }
}
//# sourceMappingURL=connectorProxyWs.js.map