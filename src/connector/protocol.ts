
import Application from "../application";
import { gzaLog } from "../LogTS";
import { lanlu } from "../proto/protobuf/proto.js";
import * as define from "../util/define";
import { I_encodeDecodeConfig } from "../util/interfaceDefine";

let app: Application;
export function init(_app: Application) {
    app = _app;
}

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
    "msgDecode": function (mainKey: number, sonKey: number, msg: Buffer, toS: boolean): Buffer {
        console.log("msgDecode", mainKey, sonKey, toS);
        let rlanlu = global["lanlu"];
        let r = lanlu;
        if (toS) {
            let name = 'Pt' + mainKey + '_' + sonKey + '_tos';
            let encodeData: Uint8Array = rlanlu[name].decode(msg);
            // gzaLog("msgDecode buff=", name, rlanlu[name], encodeData.buffer, encodeData.length);
            if (encodeData.buffer) {
                let buff: Buffer = Buffer.from(encodeData.buffer);
                return buff;
            } else {
                let buff: Buffer = Buffer.allocUnsafe(0);
                return buff;
            }
        } else {
            let encodeData: Uint8Array = rlanlu['Pt' + mainKey + '_' + sonKey + '_toc'].decode(msg);
            if (encodeData.buffer) {
                let buff: Buffer = Buffer.from(encodeData.buffer);
                return buff;
            } else {
                let buff: Buffer = Buffer.allocUnsafe(0);
                return buff;
            }

        }

    },
    "protoEncode": function (mainKey: number, sonKey: number, msg: any, toS: boolean): Buffer {
        let msgBuf: Buffer = app.msgEncode(mainKey, sonKey, msg, toS);
        console.log("protoEncode===", mainKey, sonKey, toS);
        let buf = Buffer.allocUnsafe(msgBuf.length + 9);
        buf.writeUInt32BE(msgBuf.length + 5, 0);
        buf.writeUInt8(define.Server_To_Client.msg, 4);
        buf.writeUInt16BE(mainKey, 5);
        buf.writeUInt16BE(sonKey, 7);
        msgBuf.copy(buf, 9);
        return buf;
    },
    "msgEncode": function (mainKey: number, sonKey: number, msg: any, toS: boolean): Buffer {
        console.log("msgEncode", mainKey, sonKey, toS);
        let rlanlu = global["lanlu"];
        let r = lanlu;
        if (toS) {
            let encodeData: Uint8Array = rlanlu['Pt' + mainKey + '_' + sonKey + '_tos'].encode(msg).finish();
            if (encodeData.buffer) {
                let buff: Buffer = Buffer.from(encodeData.buffer);
                return buff;
            } else {
                let buff: Buffer = Buffer.allocUnsafe(0);
                return buff;
            }
        } else {
            let encodeData: Uint8Array = rlanlu['Pt' + mainKey + '_' + sonKey + '_toc'].encode(msg).finish();
            if (encodeData.buffer) {
                let buff: Buffer = Buffer.from(encodeData.buffer);
                return buff;
            } else {
                let buff: Buffer = Buffer.allocUnsafe(0);
                return buff;
            }
        }

    }
}
