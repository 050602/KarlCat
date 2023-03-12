
const BSON = require('bson');
const Long = BSON.Long;

import { Application } from "../application";
import define = require("../util/define");
import { loggerLevel, loggerType, SocketProxy } from "../util/interfaceDefine";

let app: Application = null as any;
export function msgCoderSetApp(_app: Application) {
    app = _app;
}

/**
 * Unpack
 */
export function decode(socket: SocketProxy, msg: Buffer) {
    let readLen = 0;
    while (readLen < msg.length) {
        if (socket.len === 0) // data length is unknown
        {
            socket.headBuf[socket.headLen] = msg[readLen];
            socket.headLen++;
            readLen++;
            if (socket.headLen === 4) {
                socket.len = socket.headBuf.readUInt32BE(0);
                if (socket.len > socket.maxLen || socket.len === 0) {
                    app.logger(loggerType.frame, loggerLevel.error, "socket data length is longer then " + socket.maxLen + " , nowlen : " + socket.len + ", close it, " + socket.remoteAddress);
                    socket.close();
                    return;
                }
                if (msg.length - readLen >= socket.len) { // data coming all
                    socket.emit("data", msg.subarray(readLen, readLen + socket.len));
                    readLen += socket.len;
                    socket.len = 0;
                    socket.headLen = 0;
                } else {
                    socket.buffer = Buffer.allocUnsafe(socket.len);
                }
            }
        }
        else if (msg.length - readLen < socket.len)	// data not coming all
        {
            msg.copy(socket.buffer, socket.buffer.length - socket.len, readLen);
            socket.len -= (msg.length - readLen);
            readLen = msg.length;
        }
        else { // data coming all
            msg.copy(socket.buffer, socket.buffer.length - socket.len, readLen, readLen + socket.len);
            socket.emit("data", socket.buffer);
            readLen += socket.len;
            socket.len = 0;
            socket.headLen = 0;
            socket.buffer = null as any;
        }
    }
}


/**
 * Part of the internal communication message format
 */
export function encodeInnerData(data: any) {
    // console.log("encodeInnerData data", data);
    let dataBuf: Buffer = BSON.serialize(data);
    // console.log("encoode", dataBuf);
    let data2 = BSON.deserialize(dataBuf);
    // console.log("decoode", data2);
    let buffer = Buffer.allocUnsafe(dataBuf.length + 4);
    buffer.writeUInt32BE(dataBuf.length, 0);
    dataBuf.copy(buffer, 4);
    return buffer;
};


/**
 *  Back-end server, the message format sent to the front-end server
 *
 *     [4]        [1]      [2]       [...]    [...]
 *  allMsgLen   msgType  uidBufLen   uids   clientMsgBuf
 *
 *  The clientMsgBuf is sent directly to the client by the front-end server
 */

export function encodeRemoteData(uids: number[], dataBuf: Buffer) {
    // console.log("encode远程消息", uids, dataBuf.length);
    let uidsLen = uids.length * 4;
    let buf = Buffer.allocUnsafe(7 + uidsLen + dataBuf.length);
    buf.writeUInt32BE(3 + uidsLen + dataBuf.length, 0);
    buf.writeUInt8(define.Rpc_Msg.clientMsgOut, 4);
    buf.writeUInt16BE(uids.length, 5);
    for (let i = 0; i < uids.length; i++) {
        buf.writeUInt32BE(uids[i], 7 + i * 4);
    }
    dataBuf.copy(buf, 7 + uidsLen);
    return buf;
}