"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeRemoteData = exports.encodeInnerData = exports.decode = exports.msgCoderSetApp = void 0;
const BSON = require('bson');
const Long = BSON.Long;
const define = require("../util/define");
let app = null;
function msgCoderSetApp(_app) {
    app = _app;
}
exports.msgCoderSetApp = msgCoderSetApp;
/**
 * Unpack
 */
function decode(socket, msg) {
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
                    //容错，避免自己杀自己
                    if (socket.remoteAddress == "127.0.0.1") {
                        console.error(app.serverName + " decode is longer then " + socket.maxLen + " , nowlen : " + socket.len + ", from " + socket.remoteAddress + " not close it");
                        return;
                    }
                    // errLog(app.serverName + " decode is longer then " + socket.maxLen + " , nowlen : " + socket.len + ", close it, " + socket.remoteAddress);
                    // socket.close();
                    return;
                }
                if (msg.length - readLen >= socket.len) { // data coming all
                    socket.emit("data", msg.subarray(readLen, readLen + socket.len));
                    readLen += socket.len;
                    socket.len = 0;
                    socket.headLen = 0;
                }
                else {
                    socket.buffer = Buffer.allocUnsafe(socket.len);
                }
            }
        }
        else if (msg.length - readLen < socket.len) // data not coming all
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
            socket.buffer = null;
        }
    }
}
exports.decode = decode;
/**
 * Part of the internal communication message format
 */
function encodeInnerData(data) {
    // console.log("encodeInnerData data", data);
    let dataBuf = BSON.serialize(data);
    // console.log("encoode", dataBuf);
    // let data2 = BSON.deserialize(dataBuf);
    // console.log("decoode", data2);
    let buffer = Buffer.allocUnsafe(dataBuf.length + 4);
    buffer.writeUInt32BE(dataBuf.length, 0);
    dataBuf.copy(buffer, 4);
    if (buffer.length > define.some_config.SocketBufferMaxLen) {
        console.error(app.serverName + "encodeInnerData is longer then " + define.some_config.SocketBufferMaxLen + " , nowlen : " + buffer.length + ", close it, ");
    }
    return buffer;
}
exports.encodeInnerData = encodeInnerData;
;
/**
 *  Back-end server, the message format sent to the front-end server
 *
 *     [4]        [1]      [2]       [...]    [...]
 *  allMsgLen   msgType  uidBufLen   uids   clientMsgBuf
 *
 *  The clientMsgBuf is sent directly to the client by the front-end server
 */
function encodeRemoteData(uids, dataBuf) {
    // console.log("encode远程消息", uids, dataBuf.length);
    let uidsLen = uids.length * 8;
    let buf = Buffer.allocUnsafe(7 + uidsLen + dataBuf.length);
    buf.writeUInt32BE(3 + uidsLen + dataBuf.length, 0);
    buf.writeUInt8(5 /* define.Rpc_Msg.clientMsgOut */, 4);
    buf.writeUInt16BE(uids.length, 5);
    for (let i = 0; i < uids.length; i++) {
        buf.writeBigInt64BE(BigInt(uids[i]), 7 + i * 8);
    }
    dataBuf.copy(buf, 7 + uidsLen);
    if (buf.length > define.some_config.SocketBufferMaxLen) {
        console.error(app.serverName + "encodeRemoteData is longer then " + define.some_config.SocketBufferMaxLen + " , nowlen : " + buf.length + ", close it, ");
    }
    return buf;
}
exports.encodeRemoteData = encodeRemoteData;
//# sourceMappingURL=msgCoder.js.map