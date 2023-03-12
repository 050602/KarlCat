"use strict";
/**
 * rpc connection management, sending rpc messages
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMsgAwait = exports.handleMsg = exports.rpcOnNewSocket = exports.init = void 0;
const LogTS_1 = require("../LogTS");
const TSEventCenter_1 = require("../utils/TSEventCenter");
// import BSON from "bson";
const BSON = require('bson');
const Long = BSON.Long;
let app;
// let msgHandler: { [filename: string]: any } = {};
let rpcId = 1; // Must start from 1, not 0
let rpcRequest = {};
let rpcTimeMax = 10 * 1000; //overtime time
let outTime = 0; // Current time + timeout
let msgQueueDic = {};
let msgCacheLength = 5000;
let rpc;
/**
 * init
 * @param _app
 */
function init(_app) {
    app = _app;
    let rpcConfig = app.someconfig.rpc || {};
    let cacheLen = parseInt(rpcConfig.msgCacheLength);
    if (cacheLen >= 0) {
        msgCacheLength = cacheLen;
    }
    let timeout = Number(rpcConfig.timeout) || 0;
    if (timeout >= 5) {
        rpcTimeMax = timeout * 1000;
    }
    outTime = Date.now() + rpcTimeMax;
    setInterval(() => {
        outTime = Date.now() + rpcTimeMax;
    }, 100);
    setInterval(checkTimeout, 2000);
    rpc = new rpc_create();
}
exports.init = init;
function rpcOnNewSocket(sid) {
    let queue = msgQueueDic[sid];
    if (!queue) {
        return;
    }
    for (let one of queue) {
        sendTo(sid, one.rpcTimeout, one.buf);
    }
    queue.length = 0;
}
exports.rpcOnNewSocket = rpcOnNewSocket;
/**
 * Process rpc messages
 *
 *     [1]         [1]      [...]    [...]      [...]
 *   msgType    rpcBufLen   rpcBuf   msgBuf    bufLast
 */
function handleMsg(sid, bufAll) {
    let rpcBufLen = bufAll.readUInt8(1);
    // logInfo("RPC handleMsg>>>>>", app.serverId, bufAll.slice(2, 2 + rpcBufLen).toString(), "<<<<< End");
    let rpcMsg = BSON.deserialize(bufAll.subarray(2, 2 + rpcBufLen));
    let msg;
    // console.log("收到RPC", sid, rpcMsg);
    if (rpcMsg.len === undefined) {
        msg = BSON.deserialize(bufAll.subarray(2 + rpcBufLen));
        msg = Object.values(msg);
    }
    else {
        msg = BSON.deserialize(bufAll.subarray(2 + rpcBufLen, bufAll.length - rpcMsg.len));
        msg = Object.values(msg);
        msg.push(bufAll.subarray(bufAll.length - rpcMsg.len));
    }
    if (!rpcMsg.cmd) {
        let timeout = rpcRequest[rpcMsg.id];
        if (timeout) {
            delete rpcRequest[rpcMsg.id];
            timeout.cb(...msg);
        }
    }
    else {
        (0, LogTS_1.logRPC)("收到RPC", app.serverName, sid, rpcMsg.cmd);
        let cmd = rpcMsg.cmd;
        if (rpcMsg.id) {
            msg.push(getCallBackFunc(sid, rpcMsg.id));
        }
        // msgHandler[cmd[0]][cmd[1]](...msg);
        TSEventCenter_1.TSEventCenter.Instance.event(cmd, ...msg);
    }
}
exports.handleMsg = handleMsg;
async function handleMsgAwait(sid, bufAll) {
    let rpcBufLen = bufAll.readUInt8(1);
    let rpcMsg = BSON.deserialize(bufAll.subarray(2, 2 + rpcBufLen));
    let msg;
    if (rpcMsg.len === undefined) {
        msg = BSON.deserialize(bufAll.subarray(2 + rpcBufLen));
        msg = Object.values(msg);
    }
    else {
        msg = BSON.deserialize(bufAll.subarray(2 + rpcBufLen, bufAll.length - rpcMsg.len));
        msg = Object.values(msg);
        msg.push(bufAll.subarray(bufAll.length - rpcMsg.len));
    }
    if (!rpcMsg.cmd) {
        let timeout = rpcRequest[rpcMsg.id];
        if (timeout) {
            delete rpcRequest[rpcMsg.id];
            timeout.cb(msg);
        }
    }
    else {
        let data = await TSEventCenter_1.TSEventCenter.Instance.eventAsync(rpcMsg.cmd, ...msg);
        let socket = app.rpcPool.getSocket(sid);
        if (!socket) {
            return;
        }
        if (data === undefined) {
            data = null;
        }
        if (data === undefined) {
            data = null;
        }
        // let bufEnd: Buffer;
        // if (data instanceof Buffer) {
        //     bufEnd = getRpcMsg({ "id": rpcMsg.id }, Buffer.allocUnsafe(0), data, define.Rpc_Msg.rpcMsgAwait);
        // } else if (data instanceof Array && data[data.length - 1] instanceof Buffer) {
        //     let tmpRes = [...data];
        //     let buf: Buffer = tmpRes.pop();
        //     bufEnd = getRpcMsg({ "id": rpcMsg.id }, Buffer.from(JSON.stringify(tmpRes)), buf, define.Rpc_Msg.rpcMsgAwait);
        // } else {
        //     bufEnd = getRpcMsg({ "id": rpcMsg.id }, Buffer.from(JSON.stringify(data)), null as any, define.Rpc_Msg.rpcMsgAwait);
        // }
        // sendTo(sid, null, bufEnd);
        // if (data instanceof Buffer) {
        //     socket.send(getRpcMsg({ "id": rpcMsg.id }, Buffer.allocUnsafe(0), data, define.Rpc_Msg.rpcMsgAwait));
        // } else if (data instanceof Array && data[data.length - 1] instanceof Buffer) {
        //     let tmpRes = [...data];
        //     let buf: Buffer = tmpRes.pop();
        //     socket.send(getRpcMsg({ "id": rpcMsg.id }, Buffer.from(BSON.serialize(tmpRes)), buf, define.Rpc_Msg.rpcMsgAwait));
        // } else {
        //以上两种情况，目前皆无可能
        let bufEnd = getRpcMsg({ "id": rpcMsg.id }, Buffer.from(BSON.serialize(data)), /* null as any,*/ 7 /* define.Rpc_Msg.rpcMsgAwait */);
        sendTo(sid, null, bufEnd);
        // }
    }
}
exports.handleMsgAwait = handleMsgAwait;
/**
 * rpc structure
 */
class rpc_create {
    // private toId: string = "";
    // private notify: boolean = false;
    // private rpcObj: Rpc | {} = {};
    // private rpcObjAwait: Rpc | {} = {};
    constructor() {
        this.loadRemoteMethod();
    }
    rpcSend(sid, type, eventName, ...args) {
        // console.log("rpcSend", sid, type, eventName);
        rpc.send(sid, { "serverType": type, "file_method": eventName }, args);
    }
    rpcAwaitSend(sid, type, eventName, ...args) {
        // console.log("rpcSend", sid, type, eventName);
        return rpc.sendAwait(sid, { "serverType": type, "file_method": eventName }, args);
    }
    loadRemoteMethod() {
        let self = this;
        // app.rpc = self.rpcSend;
        // app.rpcAwait = self.rpcAwaitSend;
        app.rpc = this.rpcSend.bind(this);
        app.rpcAwait = this.rpcAwaitSend.bind(this);
    }
    /**
     *
     * @param sid
     * @param cmd
     * @param args  当最后一个参数是方法时，在RPC超时之后，会回调该方法
     * @returns
     */
    send(sid, cmd, args) {
        // logInfo("RPC SED", sid)
        if (sid === "*") {
            // logInfo("RPC SED 111", sid)
            this.sendT(cmd, args);
            return;
        }
        let cb = null;
        if (typeof args[args.length - 1] === "function") {
            cb = args.pop();
        }
        // logInfo("RPC SED 222", sid)
        let bufLast = null;
        if (args[args.length - 1] instanceof Buffer) {
            bufLast = args.pop();
        }
        // logInfo("RPC SED 333", sid, app.serverId)
        if (sid === app.serverName) {
            // logInfo("sendRpcMsgToSelf222", cmd.serverType, cmd.serverType);
            sendRpcMsgToSelf(cmd, BSON.serialize(args), /**bufLast,*/ cb);
            return;
        }
        // logInfo("RPC SED 333333", sid, app.serverId);
        let socket = app.rpcPool.getSocket(sid);
        if (!socket) {
            if (cb) {
                process.nextTick(() => {
                    cb(1 /* rpcErr.noServer */);
                });
            }
            return;
        }
        let rpcMsg = {
            "cmd": cmd.file_method
        };
        let rpcTimeout = null;
        if (cb) {
            let id = getRpcId();
            // rpcRequest[id] = { "cb": cb, "time": outTime, "await": false };
            // rpcMsg.id = id;
            rpcTimeout = { "id": getRpcId(), "cb": cb, "time": outTime, "await": false };
            rpcMsg.id = rpcTimeout.id;
        }
        // logInfo("send messss", rpcMsg.cmd, rpcMsg.len);
        // logInfo("RPC SED 444", sid, rpcMsg.cmd, rpcMsg.id)
        let bufEnd = getRpcMsg(rpcMsg, BSON.serialize(args), /*bufLast, */ 6 /* define.Rpc_Msg.rpcMsg */);
        sendTo(sid, rpcTimeout, bufEnd);
    }
    sendT(cmd, args) {
        let servers = app.getServersByType(cmd.serverType);
        // logInfo("serverrr", cmd.serverType, servers.length);
        if (servers.length === 0) {
            return;
        }
        // let bufLast: Buffer = null as any;
        // if (args[args.length - 1] instanceof Buffer) {
        //     bufLast = args.pop();
        // }
        // logInfo("buff", cmd.serverType, servers.length, args);
        let msgBuf = BSON.serialize(args);
        let bufEnd = getRpcMsg({ "cmd": cmd.file_method }, msgBuf, /*bufLast,*/ 6 /* define.Rpc_Msg.rpcMsg */);
        for (let one of servers) {
            // logInfo("RPC SERVERS", one.id, one.serverType);
            if (one.serverName === app.serverName) {
                (0, LogTS_1.logInfo)("sendRpcMsgToSelf", cmd.serverType, servers.length, args);
                sendRpcMsgToSelf(cmd, msgBuf /*, bufLast*/);
            }
            else {
                (0, LogTS_1.logInfo)("socket", cmd.serverType, servers.length, args);
                // let socket = app.rpcPool.getSocket(one.id);
                // socket && socket.send(bufEnd);
                sendTo(one.serverName, null, bufEnd);
            }
        }
    }
    /**
     *
     * @param sid
     * @param cmd
     * @param args RPC参数
     * @returns Promise<any[]>  因为同一个事件可能有多个方法监听，因此最后返回来的值，是一个数组 ，默认取 下标0 即可
     */
    sendAwait(sid, cmd, args) {
        if (sid === "*") {
            (0, LogTS_1.errLog)("rpc Await 不允许发送到全部服务器，请使用rpc");
            return undefined;
        }
        // let bufLast: Buffer = null as any;
        // if (args[args.length - 1] instanceof Buffer) {
        //     bufLast = args.pop();
        // }
        if (sid === app.serverName) {
            // return sendRpcMsgToSelfAwait(cmd, BSON.serialize(args), bufLast);
            return sendRpcMsgToSelfAwait(cmd, BSON.serialize(args));
        }
        // let socket = app.rpcPool.getSocket(sid);
        // if (!socket) {
        //     return undefined;
        // }
        let rpcMsg = {
            "cmd": cmd.file_method
        };
        let cb = null;
        let rpcTimeout = null;
        let promise = new Promise((resolve) => {
            cb = resolve;
        });
        rpcTimeout = { "id": getRpcId(), "cb": cb, "time": outTime, "await": true };
        // let id = getRpcId();
        // rpcRequest[id] = { "cb": cb, "time": outTime, "await": true };
        rpcMsg.id = rpcTimeout.id;
        let bufEnd = getRpcMsg(rpcMsg, BSON.serialize(args), /**bufLast,*/ 7 /* define.Rpc_Msg.rpcMsgAwait */);
        sendTo(sid, rpcTimeout, bufEnd);
        return promise;
        // let promise: Promise<any> = undefined as any;
        // let rpcTimeout: I_rpcTimeout = null as any;
        // if (!notify) {
        //     let cb: Function = null as any;
        //     promise = new Promise((resolve) => {
        //         cb = resolve;
        //     });
        //     rpcTimeout = { "id": getRpcId(), "cb": cb, "time": outTime, "await": true };
        //     rpcMsg.id = rpcTimeout.id;
        // }
        // let bufEnd = getRpcMsg(rpcMsg, Buffer.from(JSON.stringify(args)), bufLast, define.Rpc_Msg.rpcMsgAwait);
        // sendTo(sid, rpcTimeout, bufEnd);
        // return promise;
    }
}
function sendTo(sid, rpcTimeout, buf) {
    let socket = app.rpcPool.getSocket(sid);
    if (socket) {
        if (rpcTimeout) {
            rpcRequest[rpcTimeout.id] = rpcTimeout;
        }
        socket.send(buf);
        return;
    }
    let queue = msgQueueDic[sid];
    if (!queue) {
        queue = [];
        msgQueueDic[sid] = queue;
    }
    if (queue.length < msgCacheLength) {
        queue.push({ "rpcTimeout": rpcTimeout, "buf": buf, "time": outTime - 3000 });
    }
    else if (rpcTimeout) {
        process.nextTick(() => {
            rpcTimeout.await ? rpcTimeout.cb(undefined) : rpcTimeout.cb(true);
        });
    }
}
/**
 * Get rpcId
 */
function getRpcId() {
    let id = rpcId++;
    if (rpcId > 99999999) {
        rpcId = 1;
    }
    return id;
}
/**
 * rpc timeout detection
 */
function checkTimeout() {
    let now = Date.now();
    for (let sid in msgQueueDic) {
        let queue = msgQueueDic[sid];
        while (queue[0] && queue[0].time < now) {
            let one = queue.shift();
            if (one.rpcTimeout) {
                one.rpcTimeout.await ? one.rpcTimeout.cb(undefined) : one.rpcTimeout.cb(true);
            }
        }
    }
    for (let id in rpcRequest) {
        if (rpcRequest[id].time < now) {
            let one = rpcRequest[id];
            delete rpcRequest[id];
            one.await ? one.cb(undefined) : one.cb(true);
        }
    }
}
/**
 *  Send rpc message
 *
 *    [4]       [1]         [1]      [...]    [...]      [...]
 *  allMsgLen  msgType   rpcBufLen   rpcBuf   msgBuf    bufLast
 */
function getRpcMsg(rpcMsg, msgBuf, /**bufLast: Buffer*/ t) {
    let buffLastLen = 0;
    // if (bufLast) {
    //     buffLastLen = bufLast.length;
    //     rpcMsg.len = buffLastLen;
    // }
    let rpcBuf = BSON.serialize(rpcMsg);
    let buffEnd = Buffer.allocUnsafe(6 + rpcBuf.length + msgBuf.length + buffLastLen);
    buffEnd.writeUInt32BE(buffEnd.length - 4, 0);
    buffEnd.writeUInt8(t, 4);
    buffEnd.writeUInt8(rpcBuf.length, 5);
    rpcBuf.copy(buffEnd, 6);
    msgBuf.copy(buffEnd, 6 + rpcBuf.length);
    // if (bufLast) {
    //     bufLast.copy(buffEnd, buffEnd.length - buffLastLen);
    // }
    return buffEnd;
}
/**
 * Send rpc message to this server
 */
function sendRpcMsgToSelf(cmd, msgBuf, /*bufLast: Buffer,*/ cb) {
    let args = BSON.deserialize(msgBuf);
    // if (bufLast) {
    //     args.push(bufLast);
    // }
    if (cb) {
        let id = getRpcId();
        rpcRequest[id] = { "id": id, "cb": cb, "time": outTime, "await": false };
        args.push(getCallBackFuncSelf(id));
    }
    process.nextTick(() => {
        TSEventCenter_1.TSEventCenter.Instance.event(cmd.file_method, args);
    });
}
/**
 * Send rpc message to this server await
 */
async function sendRpcMsgToSelfAwait(cmd, msgBuf) {
    let args = BSON.deserialize(msgBuf);
    // if (bufLast) {
    //     args.push(bufLast);
    // }
    // let cb: Function = null as any;
    // let id = getRpcId();
    // rpcRequest[id] = { "cb": cb, "time": outTime, "await": true };
    // let promise = new Promise(async (resolve) => {
    // cb = resolve;
    let data = await TSEventCenter_1.TSEventCenter.Instance.eventAsync(cmd.file_method, ...args);
    // resolve(null);
    // });
    // return promise;
    return data;
}
/**
 * rpc callback
 */
function getCallBackFunc(sid, id) {
    return function (...args) {
        // let bufLast: Buffer = null as any;
        // if (args[args.length - 1] instanceof Buffer) {
        // bufLast = args.pop();
        // }
        // let socket = app.rpcPool.getSocket(sid);
        // if (socket) {
        // socket.send(getRpcMsg({ "id": id }, BSON.serialize(args), /**bufLast,*/ define.Rpc_Msg.rpcMsg));
        // }
        let bufEnd = getRpcMsg({ "id": id }, Buffer.from(JSON.stringify(args)), /**bufLast,*/ 6 /* define.Rpc_Msg.rpcMsg */);
        sendTo(sid, null, bufEnd);
    };
}
/**
 * rpc server callback
 */
function getCallBackFuncSelf(id) {
    return function (...args) {
        let buf = null;
        if (args[args.length - 1] instanceof Buffer) {
            buf = args.pop();
        }
        args = BSON.deserialize(BSON.serialize(args));
        if (buf) {
            args.push(buf);
        }
        process.nextTick(() => {
            let timeout = rpcRequest[id];
            if (timeout) {
                delete rpcRequest[id];
                timeout.cb.apply(null, args);
            }
        });
    };
}
//# sourceMappingURL=rpcService.js.map