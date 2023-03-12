"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCheckStruct = exports.default_encodeDecode = exports.init = void 0;
const app_1 = require("../app");
const LogTS_1 = require("../LogTS");
const proto_js_1 = require("../proto/protobuf/proto.js");
let app;
function init(_app) {
    app = _app;
}
exports.init = init;
//该代码是正在使用的解码编码工具
exports.default_encodeDecode = {
    "protoDecode": function (data) {
        // logInfo("protoDecode", data.readUInt16BE(1), data.readUInt16BE(3));
        return {
            "mainKey": data.readUInt16BE(1),
            "sonKey": data.readUInt16BE(3),
            "msg": data.subarray(5),
            "toS": true
        };
    },
    "msgDecode": function (mainKey, sonKey, msg, toS) {
        let rlanlu = global["lanlu"];
        let r = proto_js_1.lanlu;
        if (toS) {
            let name = 'Pt' + mainKey + '_' + sonKey + '_tos';
            let obj = rlanlu[name];
            if (!obj) {
                (0, LogTS_1.errLog)("msgDecode 不存在协议：", mainKey + "_" + sonKey + "_tos");
                return null;
            }
            let decodeData = obj.decode(msg);
            return decodeData;
        }
        else {
            let decodeData = rlanlu['Pt' + mainKey + '_' + sonKey + '_toc'].decode(msg);
            return decodeData;
        }
    },
    "protoEncode": function (mainKey, sonKey, msg, toS) {
        let msgUint8 = app.msgEncode(mainKey, sonKey, msg, toS);
        // let msgBuf = Buffer.from(msgUint8.buffer)
        // logInfo("protoEncode===", mainKey, sonKey, toS);
        let buf = Buffer.allocUnsafe(msgUint8.length + 9);
        buf.writeUInt32BE(msgUint8.length + 5, 0); //头4位是 消息长度 加上 MainKey和Sonkey 4位，加上 defindServerToClient.msg 1位  总长度是msgBuf.length + 5 位，
        buf.writeUInt8(1 /* define.Server_To_Client.msg */, 4); //标记这条消息是自定义消息
        buf.writeUInt16BE(mainKey, 5);
        buf.writeUInt16BE(sonKey, 7);
        Buffer.from(msgUint8).copy(buf, 9); //buf总长度是 4 + 1 + 2 + 2 = 9位，偏移9
        // logInfo("发送字节", buf.length);
        return buf;
    },
    "msgEncode": function (mainKey, sonKey, msg, toS) {
        // logInfo("msgEncode", mainKey, sonKey, toS);
        let rlanlu = global["lanlu"];
        let r = proto_js_1.lanlu;
        if (toS) {
            let obj = rlanlu['Pt' + mainKey + '_' + sonKey + '_tos'];
            if (!obj) {
                (0, LogTS_1.errLog)("msgDecode 不存在协议：", mainKey + "_" + sonKey + "_tos");
                return null;
            }
            if (app_1.isDebug)
                checkPorto(obj.prototype, msg);
            let encodeData = obj.encode(msg).finish();
            if (encodeData.buffer) {
                return encodeData;
            }
            else {
                return null;
            }
        }
        else {
            let obj = rlanlu['Pt' + mainKey + '_' + sonKey + '_toc'];
            if (!obj) {
                (0, LogTS_1.errLog)("msgDecode 不存在协议：", mainKey + "_" + sonKey + "_toc");
                return null;
            }
            if (app_1.isDebug)
                checkPorto(obj.prototype, msg);
            let encodeData = obj.encode(msg).finish();
            if (encodeData.buffer) {
                return encodeData;
            }
            else {
                return null;
            }
        }
    }
};
let initCheckStruct = () => {
    if (!app_1.isDebug) {
        return;
    }
    lanstruct = [];
    let rlanlu = global["lanlu"];
    for (let key in rlanlu) {
        if (key.startsWith("Pt")) {
            continue;
        }
        lanstruct.push(key);
    }
};
exports.initCheckStruct = initCheckStruct;
let lanstruct;
let checkPorto = (proto, msg) => {
    //检测Proto
    try {
        for (let key in proto) {
            if (key.trim() == "toJSON") {
                continue;
            }
            for (let key2 in msg) {
                if (key == key2) {
                    if (msg[key] instanceof Array) {
                        let rlanlu = global["lanlu"];
                        let msgarr = msg[key];
                        for (let i = 0; i < msgarr.length; i++) {
                            for (let k = 0; k < lanstruct.length; k++) {
                                checkPorto(rlanlu[lanstruct[k]].prototype, msgarr[i]);
                            }
                        }
                    }
                    if (msg[key2] instanceof Object) {
                        let rlanlu = global["lanlu"];
                        for (let k = 0; k < lanstruct.length; k++) {
                            checkPorto(rlanlu[lanstruct[k]].prototype, msg[key2]);
                        }
                    }
                }
                let precent = strSimilarity2Percent(key, key2);
                if (precent > 80 && precent != 100) {
                    let str = "致命错误：协议的字符串可能存在拼写错误：" + key + "---" + key2 + "  字符串相似度：" + precent;
                    throw str;
                }
            }
        }
    }
    catch (error) {
        (0, LogTS_1.errLog)("致命错误，协议检测", error);
    }
};
let strSimilarity2Number = (s, t) => {
    var n = s.length, m = t.length, d = [];
    var i, j, s_i, t_j, cost;
    if (n == 0)
        return m;
    if (m == 0)
        return n;
    for (i = 0; i <= n; i++) {
        d[i] = [];
        d[i][0] = i;
    }
    for (j = 0; j <= m; j++) {
        d[0][j] = j;
    }
    for (i = 1; i <= n; i++) {
        s_i = s.charAt(i - 1);
        for (j = 1; j <= m; j++) {
            t_j = t.charAt(j - 1);
            if (s_i == t_j) {
                cost = 0;
            }
            else {
                cost = 1;
            }
            d[i][j] = Minimum(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
        }
    }
    return d[n][m];
};
//两个字符串的相似程度，并返回相似度百分比
let strSimilarity2Percent = (s, t) => {
    var l = s.length > t.length ? s.length : t.length;
    var d = strSimilarity2Number(s, t);
    return Math.floor((1 - d / l) * 100);
};
let Minimum = (a, b, c) => {
    return a < b ? (a < c ? a : c) : (b < c ? b : c);
};
//# sourceMappingURL=protocol.js.map