"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bg_encodeDecode = exports.newbg_encodeDecode = exports.init = void 0;
const LogTS_1 = require("../LogTS");
const bgproto_js_1 = require("../proto/protobuf/bgproto.js");
let app;
function init(_app) {
    app = _app;
}
exports.init = init;
//该代码是正在使用的解码编码工具
exports.newbg_encodeDecode = {
    "protoDecode": function (data) {
        return {
            "cmd": data.readUInt16BE(1),
            "msg": data.subarray(3)
        };
    },
    "msgDecode": function (cmd, msg) {
        return JSON.parse(msg.toString());
    },
    "protoEncode": function (cmd, msg) {
        let msgBuf = exports.newbg_encodeDecode.msgEncode(cmd, msg);
        let buf = Buffer.allocUnsafe(msgBuf.length + 7);
        buf.writeUInt32BE(msgBuf.length + 3, 0);
        buf.writeUInt8(1 /* define.Server_To_Client.msg */, 4);
        buf.writeUInt16BE(cmd, 5);
        msgBuf.copy(buf, 7);
        return buf;
    },
    "msgEncode": function (cmd, msg) {
        return Buffer.from(JSON.stringify(msg));
    }
};
exports.bg_encodeDecode = {
    "protoDecode": function (data) {
        // logInfo("protoDecode", data.readUInt16BE(1), data.readUInt16BE(3));
        return {
            "cmd": data.readUInt16BE(1),
            "msg": data.subarray(3),
            "toS": true
        };
    },
    "msgDecode": function (cmd, msg) {
        // logInfo("msgDecode", mainKey, sonKey, toS);
        // gzaLog("解析长度", msg.length);
        let rlanlu = global["lanlubg"];
        let r = bgproto_js_1.lanlubg;
        // if (toS) {
        let name = 'Pt' + cmd;
        let obj = rlanlu[name];
        if (!obj) {
            (0, LogTS_1.logInfo)("msgDecode 不存在协议：", cmd);
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
        let msgUint8 = app.msgEncode(cmd, msg);
        // let msgBuf = Buffer.from(msgUint8.buffer)
        // logInfo("protoEncode===", mainKey, sonKey, toS);
        let buf = Buffer.allocUnsafe(msgUint8.length + 7);
        buf.writeUInt32BE(msgUint8.length + 2, 0); //头4位是 消息长度 加上 MainKey和Sonkey 4位，加上 defindServerToClient.msg 1位  总长度是msgBuf.length + 5 位，
        buf.writeUInt8(1 /* define.Server_To_Client.msg */, 4); //标记这条消息是自定义消息
        buf.writeUInt16BE(cmd, 5);
        // buf.writeUInt16BE(sonKey, 7);
        Buffer.from(msgUint8).copy(buf, 7); //buf总长度是 4 + 1 + 2 + 2 = 9位，偏移9
        // logInfo("发送字节", buf.length);
        return buf;
    },
    "msgEncode": function (cmd, msg) {
        // logInfo("msgEncode", mainKey, sonKey, toS);
        let rlanlu = global["lanlubg"];
        let r = bgproto_js_1.lanlubg;
        // if (toS) {
        let obj = rlanlu['Pt' + cmd];
        if (!obj) {
            (0, LogTS_1.logInfo)("msgDecode 不存在协议：", cmd);
            return null;
        }
        let encodeData = obj.encode(msg).finish();
        if (encodeData.buffer) {
            return encodeData;
        }
        else {
            return null;
        }
        // } else {
        //     let obj = rlanlu['Pt' + cmd + '_' + sonKey + '_toc'];
        //     if (!obj) {
        //         logInfo("msgDecode 不存在协议：", cmd + "_" + sonKey + "_toc");
        //         return null;
        //     }
        //     let encodeData: Uint8Array = obj.encode(msg).finish();
        //     if (encodeData.buffer) {
        //         return encodeData;
        //     } else {
        //         return null;
        //     }
        // }
    }
};
//# sourceMappingURL=protocolBG.js.map