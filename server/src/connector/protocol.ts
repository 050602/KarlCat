
import { lanlu } from "../proto/protobuf/proto.js";
import { ProtoCenter } from "../proto/ProtoCenter";
import * as define from "../util/define";
import { I_encodeDecodeConfig } from "../util/interfaceDefine";

//该代码是正在使用的解码编码工具
export let default_encodeDecode: Required<I_encodeDecodeConfig> = {
    "protoDecode": function (data: Buffer) {
        let mainKey: number = data.readUInt16BE(1);
        let subBuf: Buffer = data.subarray(3);
        return {
            "cmd": mainKey,
            "msg": subBuf,
            "toS": true
        }
    },
    "msgDecode": function (cmd: number, msg: Buffer): any {
        let rlanlu = ProtoCenter.Instance.lanlu;
        let r = lanlu;
        let name = 'Pt' + cmd;
        let obj = rlanlu[name];
        if (!obj) {
            console.error("msgDecode 不存在协议：", cmd);
            return null;
        }
        let decodeData: any = obj.decode(msg);

        return decodeData;
    },
    "protoEncode": function (cmd: number, msg: any): Buffer {
        let msgUint8: Uint8Array = default_encodeDecode.msgEncode(cmd, msg);
        let buf = Buffer.allocUnsafe(msgUint8.length + 7);
        buf.writeUInt32BE(msgUint8.length + 3, 0);              //头4位是 消息长度 加上 MainKey和Sonkey 4位，加上 defindServerToClient.msg 1位  总长度是msgBuf.length + 5 位，
        buf.writeUInt8(define.Server_To_Client.msg, 4); //标记这条消息是自定义消息
        buf.writeUInt16BE(cmd, 5);
        // buf.writeUInt16BE(sonKey, 7);
        Buffer.from(msgUint8).copy(buf, 7);  //buf总长度是 4 + 1 + 2 + 2 = 9位，偏移9
        // logInfo("发送字节", buf.length);

        if (buf.length > define.some_config.SocketBufferMaxLen) {
            console.error(" protoEncode 超长度了啊啊啊啊 " + define.some_config.SocketBufferMaxLen + " , nowlen : " + buf.length);
        }
        return buf;
    },
    "msgEncode": function (cmd: number, msg: any): Uint8Array {
        let rlanlu = ProtoCenter.Instance.lanlu;
        let r = lanlu;
        let obj = rlanlu['Pt' + cmd];
        if (!obj) {
            console.error("msgEecode 不存在协议：", cmd);
            return null;
        }
        let encodeData: Uint8Array = obj.encode(msg).finish();
        if (encodeData.buffer) {
            return encodeData;
        } else {
            return null;
        }
    }
}
