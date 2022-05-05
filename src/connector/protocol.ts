
import Application from "../application";
import { gzaLog } from "../LogTS";
import { lanlu } from "../proto/protobuf/proto.js";
import * as define from "../util/define";
import { I_encodeDecodeConfig } from "../util/interfaceDefine";

let app: Application;
export function init(_app: Application) {
    app = _app;
}

//该代码是正在使用的解码编码工具
export let default_encodeDecode: Required<I_encodeDecodeConfig> = {
    "protoDecode": function (data: Buffer) {
        console.log("protoDecode", data.readUInt16BE(1), data.readUInt16BE(3));
        return {
            "mainKey": data.readUInt16BE(1),
            "sonKey": data.readUInt16BE(3),
            "msg": data.slice(5),
            "toS": true
        }
    },
    "msgDecode": function (mainKey: number, sonKey: number, msg: Buffer, toS: boolean): any {
        console.log("msgDecode", mainKey, sonKey, toS);
        let rlanlu = global["lanlu"];
        let r = lanlu;
        if (toS) {
            let name = 'Pt' + mainKey + '_' + sonKey + '_tos';
            let decodeData: any = rlanlu[name].decode(msg, msg.length);
            // gzaLog("msgDecode buff=", name, rlanlu[name], decodeData.buffer, decodeData.length);
            // if (decodeData.buffer) {
            //     let buff: Buffer = Buffer.from(decodeData.buffer);
            //     return buff;
            // } else {
            //     let buff: Buffer = Buffer.allocUnsafe(0);
            //     return buff;
            // }
            return decodeData;
        } else {
            let decodeData: any = rlanlu['Pt' + mainKey + '_' + sonKey + '_toc'].decode(msg);
            // if (decodeData.buffer) {
            //     let buff: Buffer = Buffer.from(decodeData.buffer);
            //     return buff;
            // } else {
            //     let buff: Buffer = Buffer.allocUnsafe(0);
            //     return buff;
            // }
            return decodeData;
        }

    },
    "protoEncode": function (mainKey: number, sonKey: number, msg: any, toS: boolean): Buffer {
        let msgUint8: Uint8Array = app.msgEncode(mainKey, sonKey, msg, toS);
        // let msgBuf = Buffer.from(msgUint8.buffer)
        console.log("protoEncode===", mainKey, sonKey, toS);
        let buf = Buffer.allocUnsafe(msgUint8.length + 9);
        buf.writeUInt32BE(msgUint8.length + 5, 0);              //头4位是 消息长度 加上 MainKey和Sonkey 4位，加上 defindServerToClient.msg 1位  总长度是msgBuf.length + 5 位，
        buf.writeUInt8(define.Server_To_Client.msg, 4); //标记这条消息是自定义消息
        buf.writeUInt16BE(mainKey, 5);
        buf.writeUInt16BE(sonKey, 7);
        Buffer.from(msgUint8.buffer).copy(buf, 9);  //buf总长度是 4 + 1 + 2 + 2 = 9位，偏移9
        // console.log("发送字节", buf.length);
        return buf;
    },
    "msgEncode": function (mainKey: number, sonKey: number, msg: any, toS: boolean): Uint8Array {
        console.log("msgEncode", mainKey, sonKey, toS);
        let rlanlu = global["lanlu"];
        let r = lanlu;
        if (toS) {
            let encodeData: Uint8Array = rlanlu['Pt' + mainKey + '_' + sonKey + '_tos'].encode(msg).finish();
            if (encodeData.buffer) {
                //     let buff: Buffer = Buffer.from(encodeData.buffer);
                //     return buff;
                return encodeData;
            } else {
                //     let buff: Buffer = Buffer.allocUnsafe(0);
                //     return buff;
                return new Uint8Array();
            }
        } else {
            let encodeData: Uint8Array = rlanlu['Pt' + mainKey + '_' + sonKey + '_toc'].encode(msg).finish();

            // let a: lanlu.IPt100_1_toc = rlanlu.Pt100_1_toc.decode(encodeData);
            // console.log("what the fuck", encodeData.length, encodeData.buffer.byteLength, a.serverId, a.serverTime, a.code, a.roleList);
            if (encodeData.buffer) {
                // console.log("msgEncode2", mainKey, sonKey, toS, encodeData.buffer.byteLength);
                // let buff: Buffer = Buffer.from(encodeData.buffer);
                // console.log("msgEncode2", mainKey, sonKey, toS, encodeData.buffer.byteLength, buff.length);
                // return buff;
                return encodeData;
            } else {
                // let buff: Buffer = Buffer.allocUnsafe(0);

                // return buff;
                return new Uint8Array();
            }
        }

    }
}
