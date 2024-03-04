"use strict";
//该代码没有被使用，查找解码的时候，请查看 protocol.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEncodeDecodeFunc = void 0;
/** 配置编解码 */
function getEncodeDecodeFunc() {
    return { "msgEncode": msgEncode, "msgDecode": msgDecode };
}
exports.getEncodeDecodeFunc = getEncodeDecodeFunc;
function msgDecode(mainKey, sonKey, msgBuf, toS) {
    // let msg = msgCoder[cmdId].c2s?.decode(msgBuf);
    // logInfo("--->>>", app.routeConfig[cmdId], JSON.stringify(msg));
    // return msg;
    let rlanlu = global["lanlu"];
    let ptName = 'Pt' + mainKey.toString() + '_' + sonKey + '_tos';
    console.log("--->>>", mainKey, sonKey, ptName, msgBuf);
    let jsonData = rlanlu[ptName].decode(msgBuf);
    return jsonData;
}
function msgEncode(mainKey, sonKey, data, toS) {
    let rlanlu = global["lanlu"];
    let encodeData = rlanlu['Pt' + mainKey + '_' + sonKey + '_toc'].encode(data).finish();
    console.log("<<<---", mainKey, sonKey);
    // return msgCoder[cmdId].s2c?.encode(data).finish() as Buffer;
    return Buffer.from(encodeData);
}
// // 编码时直接中转Buffer
// let encode_buffer = {
//     "encode": function (data: Buffer) {
//         return {
//             "finish": function () {
//                 return data;
//             }
//         }
//     }
// }
// // 解码时直接中转Buffer
// let decode_buffer = {
//     "decode": function (data: Buffer) {
//         return data;
//     }
// }
// interface I_msg_con {
//     c2s?: { decode: (msg: Buffer) => any };
//     s2c?: { encode: (msg: any) => { finish: () => Uint8Array } };
// }
// let msgCoder: { [cmd: string]: I_msg_con } = {};
// msgCoder[cmd.connector_main_ping] = { "c2s": cs_msg.c2s_connector_main_ping, "s2c": cs_msg.s2c_connector_main_ping };
// msgCoder[cmd.onHello] = { "s2c": cs_msg.s2c_onHello };
//# sourceMappingURL=encode_decode.js.map