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
exports.RouterServer = void 0;
const protocol = __importStar(require("../connector/protocol"));
const session_1 = require("./session");
const BSON = require('bson');
const Long = BSON.Long;
class RouterServer {
    constructor(app) {
        this.app = app;
        (0, session_1.initSessionApp)(this.app);
        let defaultEncodeDecode = protocol.default_encodeDecode;
        defaultEncodeDecode = protocol.default_encodeDecode;
        let encodeDecodeConfig = this.app.someconfig.encodeDecode || {};
        this.app.protoEncode = encodeDecodeConfig.protoEncode || defaultEncodeDecode.protoEncode;
        this.app.msgEncode = encodeDecodeConfig.msgEncode || defaultEncodeDecode.msgEncode;
        this.app.protoDecode = encodeDecodeConfig.protoDecode || defaultEncodeDecode.protoDecode;
        this.app.msgDecode = encodeDecodeConfig.msgDecode || defaultEncodeDecode.msgDecode;
        this.clientManager = new ClientManager(app);
    }
    start(cb) {
        let self = this;
        let startCb = function () {
            let str = `listening at [${self.app.serverInfo.host}:${self.app.serverInfo.clientPort}]  ${self.app.serverName} (clientPort)`;
            console.log(str);
            self.app.logger("frame" /* loggerType.frame */, "info" /* loggerLevel.info */, str);
            cb && cb();
        };
        let mydog = require("../mydog");
        let connectorConfig = this.app.someconfig.connector || {};
        let connectorConstructor = connectorConfig.connector || mydog.connector.Tcp;
        new connectorConstructor({
            "app": this.app,
            "clientManager": this.clientManager,
            "config": this.app.someconfig.connector,
            "startCb": startCb
        });
    }
    /**
     * Sync session
     */
    applySession(data) {
        let session = BSON.deserialize(data.subarray(1));
        let client = this.app.clients[session.uid];
        if (client) {
            client.session.applySession(session.settings);
        }
    }
    /**
     * The front-end server forwards the message of the back-end server to the client
     */
    sendMsgByUids(data) {
        let uidsLen = data.readUInt16BE(1);
        let msgBuf = data.subarray(3 + uidsLen * 8);
        let clients = this.app.clients;
        let client;
        let i;
        // gzaLog("sendMsgByUids", uidsLen, this.app.clientNum, clients, this.app.serverName);
        for (i = 0; i < uidsLen; i++) {
            let socketId = data.readBigUint64BE(3 + i * 8);
            client = clients[Number(socketId)];
            if (client) {
                client.send(msgBuf);
            }
        }
    }
}
exports.RouterServer = RouterServer;
function clientOnOffCb() {
}
class ClientManager {
    constructor(app) {
        this.clientOnCb = null;
        this.clientOffCb = null;
        this.app = app;
        this.router = this.app.router;
        let connectorConfig = this.app.someconfig.connector || {};
        this.clientOnCb = connectorConfig.clientOnCb || clientOnOffCb;
        this.clientOffCb = connectorConfig.clientOffCb || clientOnOffCb;
        this.toGate = app.serverInfo.toGate;
    }
    addClient(client) {
        if (client.session) {
            this.app.logger("frame" /* loggerType.frame */, "warn" /* loggerLevel.warn */, "frontendServer -> 这个新的客户端Socket已有建立, close it");
            client.close();
            return;
        }
        this.app.clientNum++;
        let session = new session_1.Session(this.app.serverName);
        session.socket = client;
        client.session = session;
        this.clientOnCb(session);
    }
    removeClient(client) {
        let session = client.session;
        // logTest("removeClient", session.uid, this.app.clients);
        if (!session) {
            return;
        }
        delete this.app.clients[session.uid];
        this.app.clientNum--;
        client.session = null;
        session.socket = null;
        this.clientOffCb(session);
    }
    handleMsg(client, msgBuf) {
        try {
            let id = this.router[this.toGate](client.session);
            let socket = this.app.rpcPool.getSocket(id);
            if (!socket) {
                return;
            }
            let svr = this.app.serversNameMap[id];
            if (svr.serverType !== this.toGate || svr.frontend) {
                this.app.logger("msg" /* loggerType.msg */, "warn" /* loggerLevel.warn */, "frontendServer -> illegal remote");
                return;
            }
            socket.send(msgBuf);
        }
        catch (e) {
            let error = this.app.serverName + "-----" + e.stack;
            this.app.logger("msg" /* loggerType.msg */, "error" /* loggerLevel.error */, error);
        }
    }
}
//# sourceMappingURL=routerServer.js.map