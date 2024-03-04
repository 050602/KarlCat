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
exports.kcp_encodeDecode = void 0;
const proto_js_1 = require("../proto/protobuf/proto.js");
const ProtoCenter_1 = require("../proto/ProtoCenter");
const define = __importStar(require("../util/define"));
//该代码是正在使用的解码编码工具
exports.kcp_encodeDecode = {
    "protoDecode": function (data) {
        // logInfo("protoDecode", data.readUInt16BE(1), data.readUInt16BE(3));
        return {
            "cmd": data.readUInt16BE(1),
            "msg": data.subarray(3),
            "toS": true
        };
    },
    "msgDecode": function (cmd, msg) {
        let rlanlu = ProtoCenter_1.ProtoCenter.Instance.lanlu;
        let r = proto_js_1.lanlu;
        // if (toS) {
        let name = 'Pt' + cmd;
        let obj = rlanlu[name];
        if (!obj) {
            console.error("msgDecode 不存在协议：", cmd);
            return null;
        }
        let decodeData = obj.decode(msg);
        return decodeData;
        // } else {
        //     let decodeData: any = rlanlu['Pt' + cmd + '_' + sonKey + '_toc'].decode(msg);
        //     return decodeData;
        // }
    },
    "protoEncode": function (cmd, msg) {
        let msgUint8 = exports.kcp_encodeDecode.msgEncode(cmd, msg);
        // let msgBuf = Buffer.from(msgUint8.buffer)
        // logInfo("protoEncode===", mainKey, sonKey, toS);
        let buf = Buffer.allocUnsafe(msgUint8.length + 3);
        // buf.writeUInt8(msgUint8.length + 1, 0);              //头4位是 消息长度 加上 MainKey和Sonkey 4位，加上 defindServerToClient.msg 1位  总长度是msgBuf.length + 5 位，
        buf.writeUInt8(1 /* define.Server_To_Client.msg */, 0); //标记这条消息是自定义消息
        buf.writeUInt16BE(cmd, 1);
        // buf.writeUInt16BE(sonKey, 3);
        Buffer.from(msgUint8).copy(buf, 3); //buf总长度是 4 + 1 + 2 + 2 = 9位，偏移9
        // logInfo("发送字节", buf.length);
        if (buf.length > define.some_config.SocketBufferMaxLen) {
            console.error(" protoEncode 超长度了啊啊啊啊 " + define.some_config.SocketBufferMaxLen + " , nowlen : " + buf.length);
        }
        return buf;
    },
    "msgEncode": function (cmd, msg) {
        // logInfo("msgEncode", mainKey, sonKey, toS);
        // let rlanlu = global["lanlu"];
        let rlanlu = ProtoCenter_1.ProtoCenter.Instance.lanlu;
        let r = proto_js_1.lanlu;
        // if (toS) {
        let obj = rlanlu['Pt' + cmd];
        if (!obj) {
            console.error("msgEecode 不存在协议：", cmd);
            return null;
        }
        // if (isDebug)
        //     checkPorto(obj.prototype, msg);
        let encodeData = obj.encode(msg).finish();
        if (encodeData.buffer) {
            return encodeData;
        }
        else {
            return null;
        }
    }
};
//# sourceMappingURL=kcpProtocol.js.map