import { logInfo } from "../LogTS";


//该代码没有被使用，查找解码的时候，请查看 protocol.ts

/** 配置编解码 */
export function getEncodeDecodeFunc(): { "msgEncode": (mainKey: number, sonKey: number, data: any, toS: boolean) => Buffer, "msgDecode": (mainKey: number, sonKey: number, msg: Buffer, toS: boolean) => any } {
    return { "msgEncode": msgEncode, "msgDecode": msgDecode };
}

function msgDecode(mainKey: number, sonKey: number, msgBuf: Buffer, toS: boolean): any {
    // let msg = msgCoder[cmdId].c2s?.decode(msgBuf);
    // logInfo("--->>>", app.routeConfig[cmdId], JSON.stringify(msg));
    // return msg;
    let rlanlu = global["lanlu"];
    let ptName = 'Pt' + mainKey.toString() + '_' + sonKey + '_tos';
    logInfo("--->>>", mainKey, sonKey, ptName, msgBuf);
    let jsonData: any = rlanlu[ptName].decode(msgBuf);
    return jsonData;
}

function msgEncode(mainKey: number, sonKey: number, data: any, toS: boolean): Buffer {
    let rlanlu = global["lanlu"];
    let encodeData: Uint8Array = rlanlu['Pt' + mainKey + '_' + sonKey + '_toc'].encode(data).finish();
    logInfo("<<<---", mainKey, sonKey);
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


