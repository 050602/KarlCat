

import { Application } from "../application";
import { I_encodeDecodeConfig, sessionCopyJson } from "../util/interfaceDefine";
import { encodeRemoteData } from "./msgCoder";
import define = require("../util/define");
import { KalrEvent } from "../event/KalrEvent";
import * as protocol from "../connector/protocol";
import { RegisterSigleton } from "../register/RegisterSigleton";
import { TSEventCenter } from "../utils/TSEventCenter";
import { initSessionApp, Session } from "./session";
import { logInfo, logProto, warningLog } from "../LogTS";
const BSON = require('bson');
const Long = BSON.Long;



export class BackendServer {
    private app: Application;
    // private msgHandler: { [filename: string]: any } = {};
    constructor(app: Application) {
        this.app = app;
    }

    init() {
        initSessionApp(this.app);
        protocol.init(this.app);
        let defaultEncodeDecode: Required<I_encodeDecodeConfig> = protocol.default_encodeDecode;
        let encodeDecodeConfig = this.app.someconfig.encodeDecode || {};
        this.app.protoEncode = encodeDecodeConfig.protoEncode || defaultEncodeDecode.protoEncode;
        this.app.msgEncode = encodeDecodeConfig.msgEncode || defaultEncodeDecode.msgEncode;
        this.app.protoDecode = encodeDecodeConfig.protoDecode || defaultEncodeDecode.protoDecode;
        this.app.msgDecode = encodeDecodeConfig.msgDecode || defaultEncodeDecode.msgDecode;

        this.loadHandler();
    }


    /**
     * Back-end server load routing processing
     */
    private loadHandler() {
        RegisterSigleton.initBack(this);
        // TSEventCenter.Instance.bind(RpcEvent.OnRoleAcitveOutLine, this, this.clearQueue);
        // TSEventCenter.Instance.bind(RpcEvent.OnRoleNetDisconnection, this, this.clearQueue);
    }


    public initMsgHandler(sigleton: any) {
        sigleton["ServerType"] = this.app.serverType;
    }

    public protoQueue: Map<number, any[][]> = new Map();

    /**
     * The back-end server receives the client message forwarded by the front-end server
     */
    handleMsg(id: string, msg: Buffer) {
        let sessionLen = msg.readUInt16BE(1);
        // logInfo("msgLen", msg.length);
        let sessionBuf = msg.subarray(3, 3 + sessionLen); //截取了3-41位的数据
        let session = new Session();

        session.setAll(BSON.deserialize(sessionBuf) as sessionCopyJson);
        let mainKey = msg.readUInt16BE(3 + sessionLen);
        let sonKey = msg.readUInt16BE(5 + sessionLen);
        //此处返回的是Protobuf的结构体，而不是Buffer
        let data = this.app.msgDecode(mainKey, sonKey, msg.subarray(7 + sessionLen), true);
        logProto(">>>>>>>>>>>>>>>" + this.app.serverName + " 收到消息", mainKey + "-" + sonKey, id, data);

        let queue = this.protoQueue.get(session.uid);
        if (!queue) {
            queue = [];
            this.protoQueue.set(session.uid, queue);
        }
        queue.push([mainKey, sonKey, data, session, id]);
        if (queue.length == 1) {
            this.doQueue(session.uid);
        }
        // TSEventCenter.Instance.event(KalrEvent.BackendServerDoFuntion + mainKey + "_" + sonKey, data, session, this.callback(id, mainKey, sonKey, session.uid));
    }

    public clearQueue(uid: number) {
        let queue = this.protoQueue.get(uid);
        if (queue) {
            queue = [];
            this.protoQueue.delete(uid);
        }
    }

    private async doQueue(uid: number) {
        let queue = this.protoQueue.get(uid);
        let count = 0;
        while (queue.length > 0) {
            count++;
            if (count > 30) {
                warningLog("执行消息队列超过了30次尚未跳出");
                break;
            }
            let arr = queue.shift();
            await TSEventCenter.Instance.eventAsync(KalrEvent.BackendServerDoFuntion + arr[0] + "_" + arr[1], arr[2], arr[3], this.callback(arr[4], arr[0], arr[1], uid));
        }
    }


    private callback(id: string, mainKey: number, sonKey: number, uid: number) {
        let self = this;
        return function (msg: any) {
            if (msg === undefined) {
                msg = null;
            }
            // logInfo("back callback", mainKey, sonKey);

            let msgBuf = self.app.protoEncode(mainKey, sonKey, msg, false);
            logProto("<<<<<<<<<<<<<<< 发送消息", mainKey + "-" + sonKey, id, msg);
            let buf = encodeRemoteData([uid], msgBuf);
            self.app.rpcPool.sendMsg(id, buf);
        };
    }

    /**
     * Synchronize back-end session to front-end
     */
    sendSession(sid: string, sessionBuf: Buffer) {
        let buf = Buffer.allocUnsafe(5 + sessionBuf.length);
        buf.writeUInt32BE(1 + sessionBuf.length, 0);
        buf.writeUInt8(define.Rpc_Msg.applySession, 4);
        sessionBuf.copy(buf, 5);
        this.app.rpcPool.sendMsg(sid, buf);
    }

    /**
     * The back-end server sends a message to the client
     */
    sendMsgByUidSid(mainKey: number, sonKey: number, msg: any, uidsid: { "uid": number, "sid": string }[]) {
        let groups: { [sid: string]: number[] } = {};
        let group: number[];
        let one: { "uid": number, "sid": string };
        for (one of uidsid) {

            if (!one.sid || !one.uid) {
                continue;
            }
            group = groups[one.sid];
            if (!group) {
                group = [];
                groups[one.sid] = group;
            }
            group.push(one.uid);
        }
        let app = this.app;

        // if (isStressTesting) {
        //     TSEventCenter.Instance.event(KalrEvent.OnUnitTestProto + mainKey + "_" + sonKey, msg);
        // }
        // logInfo("back2 callback", mainKey, sonKey);
        let msgBuf: Buffer = app.protoEncode(mainKey, sonKey, msg, false);
        logProto("<<<<<<<<<<<<<<< 发送消息", mainKey + "-" + sonKey, groups, msg);
        let sid: string;
        let buf: Buffer;
        for (sid in groups) {
            buf = encodeRemoteData(groups[sid], msgBuf);
            app.rpcPool.sendMsg(sid, buf);
        }
    }

    /**
     * The back-end server sends a message to the client
     */
    sendMsgByGroup(mainKey: number, sonKey: number, msg: any, group: { [sid: string]: number[] }) {
        let app = this.app;
        // logInfo("back3 callback", mainKey, sonKey);
        let msgBuf: Buffer = app.protoEncode(mainKey, sonKey, msg, true);
        let sid: string;
        let buf: Buffer;
        for (sid in group) {
            if (group[sid].length === 0) {
                continue;
            }
            buf = encodeRemoteData(group[sid], msgBuf);
            app.rpcPool.sendMsg(sid, buf);
        }
    }
}
