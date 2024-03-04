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
const protocol = __importStar(require("../connector/protocol"));
const TSEventCenter_1 = require("../utils/TSEventCenter");
const msgCoder_1 = require("./msgCoder");
const session_1 = require("./session");
const BSON = require('bson');
const Long = BSON.Long;
class BackendServer {
    constructor(app) {
        this.protoQueue = new Map();
        this.app = app;
    }
    init() {
        (0, session_1.initSessionApp)(this.app);
        // protocol.init(this.app);
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
        let cmd = msg.readUInt16BE(3 + sessionLen);
        //此处返回的是Protobuf的结构体，而不是Buffer
        let data = this.app.msgDecode(cmd, msg.subarray(3 + sessionLen));
        if (!data) {
            console.error("异常的调用协议，可能是在扫描协议", session.uid, session.getIp(), session.getPort());
            return;
        }
        console.log(">>>>>>>>>>>>>>>" + this.app.serverName + " 收到消息", cmd, id, "\n", session, "\n", data);
        TSEventCenter_1.TSEventCenter.Instance.eventCMDAsync(session.uid, cmd, data, session, this.callback(id, session.uid));
    }
    callback(id, uid) {
        let self = this;
        return function (cmd, msg) {
            if (msg === undefined) {
                msg = null;
            }
            let msgBuf = self.app.protoEncode(cmd, msg);
            console.log("<<<<<<<<<<<<<<< 发送消息", cmd, id, msg);
            let buf = (0, msgCoder_1.encodeRemoteData)([uid], msgBuf);
            self.app.rpcPool.sendMsg(id, buf);
        };
    }
    /**
     * 把后端服的session设置同步到前端服
     */
    sendSession(sid, sessionBuf) {
        let buf = Buffer.allocUnsafe(5 + sessionBuf.length);
        buf.writeUInt32BE(1 + sessionBuf.length, 0);
        buf.writeUInt8(3 /* define.Rpc_Msg.applySession */, 4);
        sessionBuf.copy(buf, 5);
        this.app.rpcPool.sendMsg(sid, buf);
    }
    /**
     * 后端服发送消息给客户端
     */
    sendMsgByUidSid(cmd, msg, uidsid) {
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
        let msgBuf = app.protoEncode(cmd, msg);
        console.log("<<<<<<<<<<<<<<< 发送消息", cmd, groups, msg);
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
    sendMsgByGroup(cmd, msg, group) {
        let app = this.app;
        let msgBuf = app.protoEncode(cmd, msg);
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