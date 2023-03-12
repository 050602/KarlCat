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
const protocol = __importStar(require("../connector/protocol"));
const RegisterSigleton_1 = require("../register/RegisterSigleton");
const route_1 = require("../serverConfig/route");
const KalrEvent_1 = require("../event/KalrEvent");
const TSEventCenter_1 = require("../utils/TSEventCenter");
const session_1 = require("./session");
const LogTS_1 = require("../LogTS");
const BSON = require('bson');
const Long = BSON.Long;
class FrontendServer {
    constructor(app) {
        this.app = app;
        (0, session_1.initSessionApp)(this.app);
        let defaultEncodeDecode = protocol.default_encodeDecode;
        protocol.init(this.app);
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
            (0, LogTS_1.logInfo)(str);
            self.app.logger("frame" /* loggerType.frame */, "info" /* loggerLevel.info */, str);
            cb && cb();
        };
        let mydog = require("../mydog");
        let connectorConfig = this.app.someconfig.connector || {};
        let connectorConstructor = connectorConfig.connector || mydog.connector.Tcp;
        // new connectorConstructor({
        //     "app": this.app as any,
        //     "clientManager": new ClientManager(this.app),
        //     "config": this.app.someconfig.connector,
        //     "startCb": startCb
        // });
        new connectorConstructor({
            "app": this.app,
            "clientManager": this.clientManager,
            "config": this.app.someconfig.connector,
            "startCb": startCb
        });
    }
    // start(cb: Function) {
    //     initSessionApp(this.app);
    //     let self = this;
    //     let startCb = function () {
    //         let str = `listening at [${self.app.serverInfo.host}:${self.app.serverInfo.clientPort}]  ${self.app.serverId} (clientPort)`;
    //         logInfo(str);
    //         self.app.logger(loggerType.frame, loggerLevel.info, str);
    //         cb && cb();
    //     };
    //     let defaultEncodeDecode: Required<I_encodeDecodeConfig>;
    //     if (this.app.serverType == ServerName.background) {
    //         protocolBG.init(this.app);
    //         defaultEncodeDecode = protocolBG.bg_encodeDecode;
    //     } else {
    //         protocol.init(this.app);
    //         defaultEncodeDecode = protocol.default_encodeDecode;
    //     }
    //     let mydog = require("../mydog");
    //     let connectorConfig = this.app.someconfig.connector || {};
    //     let connectorConstructor: I_connectorConstructor = connectorConfig.connector as any || mydog.connector.Tcp;
    //     let encodeDecodeConfig = this.app.someconfig.encodeDecode || {};
    //     this.app.protoEncode = encodeDecodeConfig.protoEncode || defaultEncodeDecode.protoEncode;
    //     this.app.msgEncode = encodeDecodeConfig.msgEncode || defaultEncodeDecode.msgEncode;
    //     this.app.protoDecode = encodeDecodeConfig.protoDecode || defaultEncodeDecode.protoDecode;
    //     this.app.msgDecode = encodeDecodeConfig.msgDecode || defaultEncodeDecode.msgDecode;
    //     new connectorConstructor({
    //         "app": this.app as any,
    //         "clientManager": new ClientManager(this.app),
    //         "config": this.app.someconfig.connector,
    //         "startCb": startCb
    //     });
    // }
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
        let msgBuf = data.subarray(3 + uidsLen * 4);
        let clients = this.app.clients;
        let client;
        let i;
        // console.log("sendMsgByUids", uidsLen, this.app.serverId);
        for (i = 0; i < uidsLen; i++) {
            let idddd = data.readUInt32BE(3 + i * 4);
            client = clients[idddd];
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
        1;
        this.router = this.app.router;
        this.protoTime = new Map();
        this.protoCount = new Map();
        this.proto100Time = new Map();
        this.proto100Count = new Map();
        let connectorConfig = this.app.someconfig.connector || {};
        this.clientOnCb = connectorConfig.clientOnCb || clientOnOffCb;
        this.clientOffCb = connectorConfig.clientOffCb || clientOnOffCb;
        this.cmdFilter = connectorConfig.cmdFilter || null;
        this.loadHandler();
    }
    /**
     * Front-end server load routing processing
     */
    loadHandler() {
        RegisterSigleton_1.RegisterSigleton.initForntend(this);
    }
    initMsgHandler(sigleton) {
        sigleton["ServerType"] = this.serverType;
    }
    addClient(client) {
        if (client.session) {
            this.app.logger("frame" /* loggerType.frame */, "warn" /* loggerLevel.warn */, "frontendServer -> the I_client has already been added, close it");
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
        if (!session) {
            return;
        }
        delete this.app.clients[session.uid];
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
            // logProto(">>>>>>>>>>>>>>>" + this.app.serverId + " 收到消息", data.mainKey + "-" + data.sonKey);
            //目前没有在使用过滤，因此直接屏蔽相关代码
            // if (this.cmdFilter && this.cmdFilter(client.session, data.mainKey, data.sonKey)) {
            //     return;
            // }
            //  如果该协议是发给前端服的，就前端自己处理
            //TODO 校验token合法性
            if ((0, route_1.isFrontend)(data.mainKey)) {
                //此处返回的是Protobuf的结构体，而不是Buffer
                //同IP防DDOS
                let ip = client.session.getIp();
                let time = this.proto100Time.get(ip);
                let time2 = Date.now();
                if (time) {
                    let cha = time2 - time;
                    if (cha > 10000) {
                        this.proto100Time.set(ip, time2);
                        this.proto100Count.set(ip, 1);
                    }
                    else {
                        let count = this.proto100Count.get(ip);
                        if (count > 15) {
                            (0, LogTS_1.warningLog)("理论上十秒内，不应该超过请求15次协议 ip:", ip, data.mainKey, data.sonKey);
                            return;
                        }
                        this.proto100Count.set(ip, count + 1);
                    }
                }
                else {
                    this.proto100Time.set(ip, time2);
                    this.proto100Count.set(ip, 1);
                }
                let msg = this.app.msgDecode(data.mainKey, data.sonKey, data.msg, true);
                (0, LogTS_1.logProto)(">>>>>>>>>>>>>>>" + this.app.serverName + " 收到消息", data.mainKey + "-" + data.sonKey, client.session.uid, msg);
                if (client.session.uid) {
                    let queue = this.protoQueue.get(client.session.uid);
                    if (!queue) {
                        queue = [];
                        this.protoQueue.set(client.session.uid, queue);
                    }
                    queue.push([data.mainKey, data.sonKey, msg, client]);
                    if (queue.length == 1) {
                        this.doQueue(client.session.uid);
                    }
                }
                else {
                    TSEventCenter_1.TSEventCenter.Instance.event(KalrEvent_1.KalrEvent.FrontendServerDoFuntion + data.mainKey + "_" + data.sonKey, msg, client.session, this.callBack(client, data.mainKey, data.sonKey), this.otherCallBack(client));
                }
                // TSEventCenter.Instance.event(KalrEvent.FrontendServerDoFuntion + data.mainKey + "_" + data.sonKey, msg, client.session, this.callBack(client, data.mainKey, data.sonKey), this.otherCallBack(client));
            }
            else {
                let uid = client.session.uid;
                let time = this.protoTime.get(uid);
                let time2 = Date.now();
                if (time) {
                    let cha = time2 - time;
                    if (cha > 10000) {
                        this.protoTime.set(uid, time2);
                        this.protoCount.set(uid, 1);
                    }
                    else {
                        let count = this.protoCount.get(uid);
                        if (count > 100) {
                            (0, LogTS_1.warningLog)("理论上十秒内，不应该超过请求100次协议 Uid,ip", uid, client.session.getIp(), data.mainKey, data.sonKey);
                            return;
                        }
                        this.protoCount.set(uid, count + 1);
                    }
                }
                else {
                    this.protoTime.set(uid, time2);
                    this.protoCount.set(uid, 1);
                }
                //  如果该协议是发给后端服的，就抛出到对应路由 如下面注释，当协议不属于前端服时，消息会根据route函数，转发给对应的服务器
                this.doRemote(data, client.session);
                let msg = this.app.msgDecode(data.mainKey, data.sonKey, data.msg, true);
                (0, LogTS_1.logProto)(">>>>>>>>>>>>>>>" + this.app.serverName + " 收到消息", data.mainKey + "-" + data.sonKey, client.session.uid, msg);
                // 当客户端给后端服务器发消息时，需要提供路由函数以决定该消息发到哪个服务器
                // app.route(ServerName.connector, (session: Session) => {
                // return ServerName.connector + "-" + session.get("serverId");
                // });
            }
        }
        catch (e) {
            this.app.logger("msg" /* loggerType.msg */, "error" /* loggerLevel.error */, e.stack);
        }
    }
    clearQueue(uid) {
        let queue = this.protoQueue.get(uid);
        if (queue) {
            queue = [];
            this.protoQueue.delete(uid);
        }
    }
    async doQueue(uid) {
        let queue = this.protoQueue.get(uid);
        let count = 0;
        while (queue.length > 0) {
            count++;
            if (count > 30) {
                (0, LogTS_1.warningLog)("执行消息队列超过了30次尚未跳出");
                break;
            }
            let arr = queue.shift();
            await TSEventCenter_1.TSEventCenter.Instance.eventAsync(KalrEvent_1.KalrEvent.FrontendServerDoFuntion + arr[0] + "_" + arr[1], arr[2], arr[3].session, this.callBack(arr[3], arr[0], arr[1]), this.otherCallBack(arr[3]));
            // await TSEventCenter.Instance.eventAsync(KalrEvent.BackendServerDoFuntion + arr[0] + "_" + arr[1], arr[2], arr[3], this.callBack(arr[4], arr[0], arr[1], uid));
        }
    }
    /**
     * Callback
     */
    callBack(client, mainKey, sonKey) {
        let self = this;
        return function (msg) {
            // logInfo("frone  callback", mainKey, sonKey, msg);
            if (msg === undefined) {
                msg = null;
            }
            //callback都是给前端的，因此直接TOS = False
            (0, LogTS_1.logProto)("<<<<<<<<<<<<<<< 发送消息", mainKey + "-" + sonKey, client.session && client.session.uid, msg);
            let buf = self.app.protoEncode(mainKey, sonKey, msg, false);
            client.send(buf);
        };
    }
    /**
    * otherCallBack  类似next的用法，实现了 sendMsgByUidSid
    */
    otherCallBack(client) {
        let self = this;
        return function (msg, mainKey, sonKey) {
            // logInfo("frone  callback", mainKey, sonKey, msg);
            if (msg === undefined) {
                msg = null;
            }
            //callback都是给前端的，因此直接TOS = False
            (0, LogTS_1.logProto)("<<<<<<<<<<<<<<< 发送消息", mainKey + "-" + sonKey, msg);
            let buf = self.app.protoEncode(mainKey, sonKey, msg, false);
            client.send(buf);
        };
    }
    /**
     * 处理Gate转发到后端服逻辑
     * Forward client messages to the backend server
     */
    doRemote(msg, session) {
        let name = (0, route_1.getNameByMainKey)(msg.mainKey);
        // logInfo("doRemote", msg.mainKey, name, this.router);
        let id = this.router[name](session);
        let socket = this.app.rpcPool.getSocket(id);
        (0, LogTS_1.logInfo)("客户端发送协议从前端服转发到后端服", msg.mainKey, name, id, socket == null);
        if (!socket) {
            return;
        }
        let svr = this.app.serversNameMap[id];
        if (svr.serverType !== name || svr.frontend) {
            this.app.logger("msg" /* loggerType.msg */, "warn" /* loggerLevel.warn */, "frontendServer -> illegal remote");
            return;
        }
        let sessionBuf = session.sessionBuf;
        let buf = Buffer.allocUnsafe(11 + sessionBuf.length + msg.msg.length);
        buf.writeUInt32BE(7 + sessionBuf.length + msg.msg.length, 0); //消息总长度
        buf.writeUInt8(4 /* define.Rpc_Msg.clientMsgIn */, 4);
        buf.writeUInt16BE(sessionBuf.length, 5);
        sessionBuf.copy(buf, 7);
        buf.writeUInt16BE(msg.mainKey, 7 + sessionBuf.length); //38+7 =  45
        buf.writeUInt16BE(msg.sonKey, 9 + sessionBuf.length); //38+9 = 47
        msg.msg.copy(buf, 11 + sessionBuf.length); //38+11 = 49 从49位开始复制
        socket.send(buf);
    }
}
//# sourceMappingURL=frontendServer.js.map