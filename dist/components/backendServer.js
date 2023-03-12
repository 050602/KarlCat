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
exports.BackendServer = void 0;
const msgCoder_1 = require("./msgCoder");
const KalrEvent_1 = require("../event/KalrEvent");
const protocol = __importStar(require("../connector/protocol"));
const RegisterSigleton_1 = require("../register/RegisterSigleton");
const TSEventCenter_1 = require("../utils/TSEventCenter");
const session_1 = require("./session");
const LogTS_1 = require("../LogTS");
const BSON = require('bson');
const Long = BSON.Long;
class BackendServer {
    // private msgHandler: { [filename: string]: any } = {};
    constructor(app) {
        this.protoQueue = new Map();
        this.app = app;
    }
    init() {
        (0, session_1.initSessionApp)(this.app);
        protocol.init(this.app);
        let defaultEncodeDecode = protocol.default_encodeDecode;
        let encodeDecodeConfig = this.app.someconfig.encodeDecode || {};
        this.app.protoEncode = encodeDecodeConfig.protoEncode || defaultEncodeDecode.protoEncode;
        this.app.msgEncode = encodeDecodeConfig.msgEncode || defaultEncodeDecode.msgEncode;
        this.app.protoDecode = encodeDecodeConfig.protoDecode || defaultEncodeDecode.protoDecode;
        this.app.msgDecode = encodeDecodeConfig.msgDecode || defaultEncodeDecode.msgDecode;
        this.loadHandler();
    }
    /**
     * Back-end server load routing processing
     */
    loadHandler() {
        RegisterSigleton_1.RegisterSigleton.initBack(this);
        // TSEventCenter.Instance.bind(RpcEvent.OnRoleAcitveOutLine, this, this.clearQueue);
        // TSEventCenter.Instance.bind(RpcEvent.OnRoleNetDisconnection, this, this.clearQueue);
    }
    initMsgHandler(sigleton) {
        sigleton["ServerType"] = this.app.serverType;
    }
    /**
     * The back-end server receives the client message forwarded by the front-end server
     */
    handleMsg(id, msg) {
        let sessionLen = msg.readUInt16BE(1);
        // logInfo("msgLen", msg.length);
        let sessionBuf = msg.subarray(3, 3 + sessionLen); //截取了3-41位的数据
        let session = new session_1.Session();
        session.setAll(BSON.deserialize(sessionBuf));
        let mainKey = msg.readUInt16BE(3 + sessionLen);
        let sonKey = msg.readUInt16BE(5 + sessionLen);
        //此处返回的是Protobuf的结构体，而不是Buffer
        let data = this.app.msgDecode(mainKey, sonKey, msg.subarray(7 + sessionLen), true);
        (0, LogTS_1.logProto)(">>>>>>>>>>>>>>>" + this.app.serverName + " 收到消息", mainKey + "-" + sonKey, id, data);
        let queue = this.protoQueue.get(session.uid);
        if (!queue) {
            queue = [];
            this.protoQueue.set(session.uid, queue);
        }
        queue.push([mainKey, sonKey, data, session, id]);
        if (queue.length == 1) {
            this.doQueue(session.uid);
        }
        // TSEventCenter.Instance.event(KalrEvent.BackendServerDoFuntion + mainKey + "_" + sonKey, data, session, this.callback(id, mainKey, sonKey, session.uid));
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
            await TSEventCenter_1.TSEventCenter.Instance.eventAsync(KalrEvent_1.KalrEvent.BackendServerDoFuntion + arr[0] + "_" + arr[1], arr[2], arr[3], this.callback(arr[4], arr[0], arr[1], uid));
        }
    }
    callback(id, mainKey, sonKey, uid) {
        let self = this;
        return function (msg) {
            if (msg === undefined) {
                msg = null;
            }
            // logInfo("back callback", mainKey, sonKey);
            let msgBuf = self.app.protoEncode(mainKey, sonKey, msg, false);
            (0, LogTS_1.logProto)("<<<<<<<<<<<<<<< 发送消息", mainKey + "-" + sonKey, id, msg);
            let buf = (0, msgCoder_1.encodeRemoteData)([uid], msgBuf);
            self.app.rpcPool.sendMsg(id, buf);
        };
    }
    /**
     * Synchronize back-end session to front-end
     */
    sendSession(sid, sessionBuf) {
        let buf = Buffer.allocUnsafe(5 + sessionBuf.length);
        buf.writeUInt32BE(1 + sessionBuf.length, 0);
        buf.writeUInt8(3 /* define.Rpc_Msg.applySession */, 4);
        sessionBuf.copy(buf, 5);
        this.app.rpcPool.sendMsg(sid, buf);
    }
    /**
     * The back-end server sends a message to the client
     */
    sendMsgByUidSid(mainKey, sonKey, msg, uidsid) {
        let groups = {};
        let group;
        let one;
        for (one of uidsid) {
            if (!one.sid || !one.uid) {
                continue;
            }
            group = groups[one.sid];
            if (!group) {
                group = [];
                groups[one.sid] = group;
            }
            group.push(one.uid);
        }
        let app = this.app;
        // if (isStressTesting) {
        //     TSEventCenter.Instance.event(KalrEvent.OnUnitTestProto + mainKey + "_" + sonKey, msg);
        // }
        // logInfo("back2 callback", mainKey, sonKey);
        let msgBuf = app.protoEncode(mainKey, sonKey, msg, false);
        (0, LogTS_1.logProto)("<<<<<<<<<<<<<<< 发送消息", mainKey + "-" + sonKey, groups, msg);
        let sid;
        let buf;
        for (sid in groups) {
            buf = (0, msgCoder_1.encodeRemoteData)(groups[sid], msgBuf);
            app.rpcPool.sendMsg(sid, buf);
        }
    }
    /**
     * The back-end server sends a message to the client
     */
    sendMsgByGroup(mainKey, sonKey, msg, group) {
        let app = this.app;
        // logInfo("back3 callback", mainKey, sonKey);
        let msgBuf = app.protoEncode(mainKey, sonKey, msg, true);
        let sid;
        let buf;
        for (sid in group) {
            if (group[sid].length === 0) {
                continue;
            }
            buf = (0, msgCoder_1.encodeRemoteData)(group[sid], msgBuf);
            app.rpcPool.sendMsg(sid, buf);
        }
    }
}
exports.BackendServer = BackendServer;
//# sourceMappingURL=backendServer.js.map