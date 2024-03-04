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
exports.FrontendServer = void 0;
const app_1 = require("../app");
const protocol = __importStar(require("../connector/protocol"));
const route_1 = require("../register/route");
const session_1 = require("./session");
const BSON = require('bson');
const Long = BSON.Long;
class FrontendServer {
    constructor(app) {
        this.app = app;
        (0, session_1.initSessionApp)(this.app);
        let defaultEncodeDecode = protocol.default_encodeDecode;
        // protocol.init(this.app);
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
            // let socketId2 = Number(socketId);
            client = clients[Number(socketId)];
            // if (isStressTesting) {
            //     let data = this.app.protoDecode(msgBuf);
            //     TSEventCenter.Instance.event(KarlCatEvent.OnUnitTestProto + data.mainKey + "_" + data.sonKey, data.msg);
            // }
            if (client) {
                client.send(msgBuf);
            }
        }
    }
}
exports.FrontendServer = FrontendServer;
function clientOnOffCb() {
}
class ClientManager {
    constructor(app) {
        this.serverType = "";
        this.clientOnCb = null;
        this.clientOffCb = null;
        this.cmdFilter = null;
        this.protoQueue = new Map();
        this.app = app;
        this.serverType = app.serverType;
        this.router = this.app.router;
        this.protoTime = new Map();
        this.protoCount = new Map();
        this.proto100Time = new Map();
        this.proto100Count = new Map();
        let connectorConfig = this.app.someconfig.connector || {};
        this.clientOnCb = connectorConfig.clientOnCb || clientOnOffCb;
        this.clientOffCb = connectorConfig.clientOffCb || clientOnOffCb;
        this.cmdFilter = connectorConfig.cmdFilter || null;
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
        // logTest("removeClient2", session.uid, this.app.clients);
        this.app.clientNum--;
        client.session = null;
        session.socket = null;
        this.clearQueue(session.uid);
        this.clientOffCb(session);
    }
    handleMsg(client, msgBuf) {
        try {
            if (!client.session) {
                this.app.logger("frame" /* loggerType.frame */, "warn" /* loggerLevel.warn */, "frontendServer -> cannot handle msg before added, close it");
                client.close();
                return;
            }
            let data = this.app.protoDecode(msgBuf);
            //  如果该协议是发给后端服的，就抛出到对应路由 如下面注释，当协议不属于前端服时，消息会根据route函数，转发给对应的服务器
            this.doRemote(data, client.session);
        }
        catch (e) {
            let error = this.app.serverName + "-----" + e.stack;
            this.app.logger("msg" /* loggerType.msg */, "error" /* loggerLevel.error */, error);
        }
    }
    clearQueue(uid) {
        let queue = this.protoQueue.get(uid);
        if (queue) {
            queue = [];
            this.protoQueue.delete(uid);
        }
    }
    // private async doQueue(uid: number) {
    //     let queue = this.protoQueue.get(uid);
    //     let count = 0;
    //     while (queue.length > 0) {
    //         count++;
    //         if (count > 30) {
    //             warningLog("执行消息队列超过了30次尚未跳出");
    //             break;
    //         }
    //         let arr = queue.shift();
    //         await TSEventCenter.Instance.eventAsync(KarlCatEvent.FrontendServerDoFuntion + arr[0] + "_" + arr[1], arr[2], arr[3].session, this.callBack(arr[3], arr[0], arr[1]), this.otherCallBack(arr[3]));
    //     }
    // }
    /**
     * Callback
     */
    // private callBack(client: I_clientSocket, cmd: number) {
    //     let self = this;
    //     return function (msg: any) {
    //         // logInfo("frone  callback", mainKey, sonKey, msg);
    //         if (msg === undefined) {
    //             msg = null;
    //         }
    //         //callback都是给前端的，因此直接TOS = False
    //         // if (cmd != 302)
    //         //     logProto("<<<<<<<<<<<<<<< 发送消息", cmd + "-" + sonKey, client.session && client.session.uid, msg);
    //         // if (isStressTesting) {
    //         //     TSEventCenter.Instance.event(KarlCatEvent.OnUnitTestProto + mainKey + "_" + sonKey, msg);
    //         // }
    //         let buf = self.app.protoEncode(cmd, msg);
    //         client.send(buf);
    //     }
    // }
    // /**
    // * otherCallBack  类似next的用法，实现了 sendMsgByUidSid
    // */
    // private otherCallBack(client: I_clientSocket) {
    //     let self = this;
    //     return function (msg: any, cmd: number) {
    //         // logInfo("frone  callback", mainKey, sonKey, msg);
    //         if (msg === undefined) {
    //             msg = null;
    //         }
    //         //callback都是给前端的，因此直接TOS = False
    //         // if (cmd != 302)
    //         // logProto("<<<<<<<<<<<<<<< 发送消息", cmd + "-" + sonKey, msg);
    //         let buf = self.app.protoEncode(cmd, msg);
    //         // if (isStressTesting) {
    //         //     TSEventCenter.Instance.event(KarlCatEvent.OnUnitTestProto + mainKey + "_" + sonKey, msg);
    //         // }
    //         client.send(buf);
    //     }
    // }
    /**
     * 处理Gate转发到后端服逻辑
     * Forward client messages to the backend server
     */
    doRemote(msg, session) {
        let name = (0, route_1.getServerTypeByMainKey)(msg.cmd);
        // logInfo("doRemote", msg.mainKey, name, this.router);
        if (app_1.isDebug) {
            if (typeof (this.router[name]) != "function") {
                console.log("非方法", name, this.app.serverName, msg.cmd);
                console.log("what the fuck", name, this.app.serverName, msg.cmd);
            }
        }
        let id = this.router[name](session);
        let socket = this.app.rpcPool.getSocket(id);
        // logInfo("客户端发送协议从前端服转发到后端服", msg.mainKey, name, id, socket == null);
        if (!socket) {
            return;
        }
        let svr = this.app.serversNameMap[id];
        if (svr.serverType !== name || svr.frontend) {
            this.app.logger("msg" /* loggerType.msg */, "warn" /* loggerLevel.warn */, "frontendServer -> illegal remote");
            return;
        }
        // this.app.logger(loggerType.msg, loggerLevel.info, this.app.serverName + "send msg to " + name);
        let sessionBuf = session.sessionBuf;
        let buf = Buffer.allocUnsafe(9 + sessionBuf.length + msg.msg.length);
        buf.writeUInt32BE(5 + sessionBuf.length + msg.msg.length, 0); //消息总长度
        buf.writeUInt8(4 /* define.Rpc_Msg.clientMsgIn */, 4);
        buf.writeUInt16BE(sessionBuf.length, 5);
        sessionBuf.copy(buf, 7);
        buf.writeUInt16BE(msg.cmd, 7 + sessionBuf.length); //38+7 =  45
        // buf.writeUInt16BE(msg.sonKey, 9 + sessionBuf.length);//38+9 = 47
        msg.msg.copy(buf, 9 + sessionBuf.length); //38+11 = 49 从49位开始复制
        socket.send(buf);
    }
}
//# sourceMappingURL=frontendServer.js.map