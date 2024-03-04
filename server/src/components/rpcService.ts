/**
 * rpc connection management, sending rpc messages
 */


import { Application } from "../application";
import { RpcEvent } from "../event/RpcEvent";
import { I_rpcMsg, I_rpcTimeout } from "../util/interfaceDefine";
import { TSEventCenter } from "../utils/TSEventCenter";
import define = require("../util/define");
const BSON = require('bson');
const Long = BSON.Long;


let app: Application;
let rpcId = 1;  // Must start from 1, not 0
let rpcRequest: { [id: number]: I_rpcTimeout } = {};
let rpcTimeMax: number = 10 * 1000; //overtime time
let outTime = 0;    // Current time + timeout
let msgQueueDic: { [serverId: string]: { "rpcTimeout": I_rpcTimeout | null, "buf": Buffer, "time": number }[] } = {};
let msgCacheCount = 5000;
let rpc: rpc_create;

/**
 * init
 * @param _app 
 */
export function init(_app: Application) {
    app = _app;
    let rpcConfig = app.someconfig.rpc || {};
    let rpcMsgCacheCount = parseInt(rpcConfig.rpcMsgCacheCount as any);
    if (rpcMsgCacheCount >= 0) {
        msgCacheCount = rpcMsgCacheCount;
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

export function rpcOnNewSocket(sid: string) {
    let queue = msgQueueDic[sid];
    if (!queue) {
        return;
    }
    delete msgQueueDic[sid];
    for (let one of queue) {
        sendTo(sid, one.rpcTimeout, one.buf);
    }
}


/**
 * Process rpc messages
 * 
 *     [1]         [1]      [...]    [...]      [...]
 *   msgType    rpcBufLen   rpcBuf   msgBuf    bufLast
 */
export function handleMsg(sid: string, bufAll: Buffer) {
    // logRPC("收到RPC0", app.serverName, sid, "handleMsg");
    let rpcBufLen = bufAll.readUInt8(1);
    let args = BSON.deserialize(bufAll.subarray(2, 2 + rpcBufLen))
    let rpcMsg = args.data as I_rpcMsg;
    let msg: any[];
    if (rpcMsg.type === undefined) {
        let args = BSON.deserialize(bufAll.subarray(2 + rpcBufLen));
        msg = args.data;
    } else {
        let args = BSON.deserialize(bufAll.subarray(2 + rpcBufLen));
        msg = args.data;
    }

    if (!rpcMsg.cmd) {
        // logRPC("收到RPC2", app.serverName, sid, msg);
        let timeout = rpcRequest[rpcMsg.id as number];
        if (timeout) {
            delete rpcRequest[rpcMsg.id as number];
            timeout.cb(...msg);
        }
    } else {
        //sid是发来的
        console.log("收到RPC", app.serverName, sid, rpcMsg.cmd);
        let cmd = rpcMsg.cmd;
        // if (rpcMsg.id) {
        //     msg.push(getCallBackFunc(sid, rpcMsg.id));
        // }
        TSEventCenter.Instance.event(cmd as number, ...msg);
    }
}

export async function handleMsgAwait(sid: string, bufAll: Buffer) {
    // logRPC("收到RPC0", app.serverName, sid, "handleMsgAwait");
    let rpcBufLen = bufAll.readUInt8(1);
    let args = BSON.deserialize(bufAll.subarray(2, 2 + rpcBufLen))
    let rpcMsg = args.data as I_rpcMsg;

    let msg: any[];
    let args2 = BSON.deserialize(bufAll.subarray(2 + rpcBufLen));
    msg = args2.data;
    if (!rpcMsg.cmd) {
        // logRPC("收到RPCa2", app.serverName, sid, msg);
        // gzaLog("rpc cb ", rpcMsg, msg);
        let timeout = rpcRequest[rpcMsg.id as number];
        if (timeout) {
            delete rpcRequest[rpcMsg.id as number];
            timeout.cb(msg);
        }
        return;
    }


    if (rpcMsg.type === undefined) {
        console.log("收到RPC", app.serverName, sid, rpcMsg.cmd);
        let args = await TSEventCenter.Instance.eventAwait(rpcMsg.cmd as number, ...msg);
        let socket = app.rpcPool.getSocket(sid);
        if (!socket) {
            return;
        }
        if (args === undefined) {
            args = null;
        }

        let bufEnd = getRpcMsg({ "id": rpcMsg.id }, Buffer.from(BSON.serialize({ data: args })), null, define.Rpc_Msg.rpcMsgAwait);//特殊处理了BSON的来回，加了数组嵌套
        sendTo(sid, null, bufEnd);
    }
    else if (rpcMsg.type == 1) {
        //1是发送出去的数据
        let args = await TSEventCenter.Instance.eventDB(rpcMsg.cmd as string, ...msg);
        let socket = app.rpcPool.getSocket(sid);
        if (!socket) {
            return;
        }
        if (args === undefined) {
            args = null;
        }
        // gzaLog("rpcDBSend", rpcMsg, args);
        let bufEnd = getRpcMsg({ "id": rpcMsg.id }, Buffer.from(BSON.serialize({ data: args })), 2, define.Rpc_Msg.rpcMsgAwait);
        sendTo(sid, null, bufEnd);
    }
}

class rpc_create {
    constructor() {
        this.loadRemoteMethod();
    }

    rpcSend(serverName: string, eventName: RpcEvent, ...args: any[]) {
        rpc.send(serverName, eventName, args);
    }

    rpcAwaitSend(serverName: string, eventName: RpcEvent, ...args: any[]): Promise<any> {
        return rpc.sendAwait(serverName, eventName, args);
    }

    rpcDBSend(serverName: string, eventName: string, ...args: any[]): Promise<any> {
        return rpc.sendDBAwait(serverName, eventName, args);
    }

    loadRemoteMethod() {
        let self = this;
        app.rpc = this.rpcSend.bind(this);
        app.rpcAwait = this.rpcAwaitSend.bind(this);
        app.rpcDB = this.rpcDBSend.bind(this);
    }

    /**
     * 
     * @param serverName 
     * @param eventName 
     * @param args  
     * @returns 
     */
    send(serverName: string, eventName: RpcEvent, args: any[]) {
        if (serverName === app.serverName) {
            sendRpcMsgToSelf(eventName, BSON.serialize({ data: args }), /**bufLast,*/);
            return;
        }

        let socket = app.rpcPool.getSocket(serverName);
        if (!socket) {
            return;
        }

        let rpcMsg: I_rpcMsg = {
            cmd: eventName
        };
        let rpcTimeout: I_rpcTimeout = null as any;
        let bufEnd = getRpcMsg(rpcMsg, BSON.serialize({ data: args }), null, define.Rpc_Msg.rpcMsg);
        sendTo(serverName, rpcTimeout, bufEnd);
    }


    /**
     * 发送Await的RPC
     * @param serverName 
     * @param cmd 
     * @param args RPC参数
     * @returns Promise<any[]>  因为同一个事件可能有多个方法监听，因此最后返回来的值，是一个数组 ，默认取 下标0 即可
     */
    sendAwait(serverName: string, eventName: RpcEvent, args: any[]): Promise<any> | undefined {
        if (serverName === "*") {
            console.error("rpc Await 不允许发送到全部服务器，请使用rpc");
            return undefined;
        }

        if (serverName === app.serverName) {
            return sendRpcMsgToSelfAwait(eventName, BSON.serialize({ data: args }));
        }

        let rpcMsg: I_rpcMsg = {
            cmd: eventName
        };

        let cb: Function = null as any;
        let rpcTimeout: I_rpcTimeout = null as any;
        let promise: Promise<any[]> = new Promise((resolve) => {
            cb = resolve;
        });
        rpcTimeout = { "id": getRpcId(), "cb": cb, "time": outTime, "await": true };

        rpcMsg.id = rpcTimeout.id;

        let bufEnd = getRpcMsg(rpcMsg, BSON.serialize({ data: args }), null, define.Rpc_Msg.rpcMsgAwait);
        sendTo(serverName, rpcTimeout, bufEnd);

        return promise;
    }

    /**
 * 发送DB RPC
 * @param serverName 
 * @param cmd 
 * @param args RPC参数
 * @returns Promise<any>  
 */
    sendDBAwait(serverName: string, databaseEvent: string, args: any[]): Promise<any> | undefined {
        let rpcMsg: I_rpcMsg = {
            cmd: databaseEvent
        };

        //理论上不可能本地发本地
        if (serverName === app.serverName) {
            return sendRpcMsgToSelfDBAwait(databaseEvent, BSON.serialize({ data: args }));
        }

        let cb: Function = null as any;
        let rpcTimeout: I_rpcTimeout = null as any;
        let promise: Promise<any[]> = new Promise((resolve) => {
            cb = resolve;
        });

        rpcTimeout = { "id": getRpcId(), "cb": cb, "time": outTime, "await": true };
        rpcMsg.id = rpcTimeout.id;
        let bufEnd = getRpcMsg(rpcMsg, BSON.serialize({ data: args }), 1, define.Rpc_Msg.rpcMsgAwait);

        sendTo(serverName, rpcTimeout, bufEnd);
        return promise;
    }
}



function sendTo(sid: string, rpcTimeout: I_rpcTimeout | null, buf: Buffer) {
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

    queue.push({ "rpcTimeout": rpcTimeout, "buf": buf, "time": outTime - 3000 });

    if (queue.length > msgCacheCount) {
        for (let one of queue.splice(0, 20)) {
            if (one.rpcTimeout) {
                timeoutCall(one.rpcTimeout);
            }
        }
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
        let deleteCount = 0;
        for (let one of queue) {
            if (one.time < now) {
                deleteCount++;
            } else {
                break;
            }
        }
        if (deleteCount > 0) {
            for (let one of queue.splice(0, deleteCount)) {
                if (one.rpcTimeout) {
                    timeoutCall(one.rpcTimeout);
                }
            }
        }
    }

    for (let id in rpcRequest) {
        if (rpcRequest[id].time < now) {
            let one = rpcRequest[id];
            delete rpcRequest[id];
            timeoutCall(one);
        }
    }
}

function timeoutCall(one: I_rpcTimeout) {
    process.nextTick(() => {
        one.await ? one.cb(undefined) : one.cb(true);
    });
}


/**
 *  Send rpc message
 * 
 *    [4]       [1]         [1]      [...]    [...]      [...]
 *  allMsgLen  msgType   rpcBufLen   rpcBuf   msgBuf    bufLast
 */
function getRpcMsg(rpcMsg: I_rpcMsg, msgBuf: Buffer, rpcType: number, RPCMsgType: define.Rpc_Msg) {
    if (rpcType) {
        rpcMsg.type = rpcType;
    }
    let rpcBuf = BSON.serialize({ data: rpcMsg });
    let buffEnd = Buffer.allocUnsafe(6 + rpcBuf.length + msgBuf.length);
    buffEnd.writeUInt32BE(buffEnd.length - 4, 0);
    buffEnd.writeUInt8(RPCMsgType, 4);
    buffEnd.writeUInt8(rpcBuf.length, 5);
    rpcBuf.copy(buffEnd, 6);
    msgBuf.copy(buffEnd, 6 + rpcBuf.length);

    if (buffEnd.length > define.some_config.SocketBufferMaxLen) {
        console.error(app.serverName + " rpc 超长度了啊啊啊 " + define.some_config.SocketBufferMaxLen + " , nowlen : " + buffEnd.length);
    }
    return buffEnd;
}


/**
 * 发送回给本服务器的RPC消息
 */
function sendRpcMsgToSelf(eventName: RpcEvent, msgBuf: Buffer, /*bufLast: Buffer,*/) {
    let args = BSON.deserialize(msgBuf)
    args = args.data as any[];
    process.nextTick(() => {
        TSEventCenter.Instance.event(eventName, ...args);
    });
}


/**
 * 发送回给本服务器的RPC Await消息
 */
async function sendRpcMsgToSelfAwait(eventName: RpcEvent, msgBuf: Buffer, /**bufLast: Buffer*/): Promise<any[]> {
    let args = BSON.deserialize(msgBuf)
    args = args.data as any[];
    let data = await TSEventCenter.Instance.eventAwait(eventName, ...args);
    return data;
}

/**
 * 发送回给本服务器的RPC DB Await消息
 */
async function sendRpcMsgToSelfDBAwait(eventName: string, msgBuf: Buffer, /**bufLast: Buffer*/): Promise<any> {
    let args = BSON.deserialize(msgBuf)
    args = args.data as any[];
    let data = await TSEventCenter.Instance.eventDB(eventName, ...args);
    return data;
}

