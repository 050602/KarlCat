

import { Application } from "../application";
import * as protocol from "../connector/protocol";
import { I_encodeDecodeConfig, sessionCopyJson } from "../util/interfaceDefine";
import { TSEventCenter } from "../utils/TSEventCenter";
import { encodeRemoteData } from "./msgCoder";
import { initSessionApp, Session } from "./session";
import define = require("../util/define");
const BSON = require('bson');
const Long = BSON.Long;



export class BackendServer {
    private app: Application;
    constructor(app: Application) {
        this.app = app;
    }

    init() {
        initSessionApp(this.app);
        // protocol.init(this.app);
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
        let cmd = msg.readUInt16BE(3 + sessionLen);
        //此处返回的是Protobuf的结构体，而不是Buffer
        let data = this.app.msgDecode(cmd, msg.subarray(5 + sessionLen));
        if (!data) {
            console.error("异常的调用协议，可能是在扫描协议", session.uid, session.getIp(), session.getPort());
            return;
        }
        console.log(">>>>>>>>>>>>>>>" + this.app.serverName + " 收到消息", cmd, id, "\n", session, "\n", data);

        TSEventCenter.Instance.eventCMDAsync(session.uid, cmd, data, session, this.callback(id, session.uid));
    }



    private callback(id: string, uid: number) {
        let self = this;
        return function (cmd: number, msg: any) {
            if (msg === undefined) {
                msg = null;
            }
            let msgBuf = self.app.protoEncode(cmd, msg);
            console.log("<<<<<<<<<<<<<<< 发送消息", cmd, id, msg);
            let buf = encodeRemoteData([uid], msgBuf);
            self.app.rpcPool.sendMsg(id, buf);
        };
    }

    /**
     * 把后端服的session设置同步到前端服
     */
    sendSession(sid: string, sessionBuf: Buffer) {
        let buf = Buffer.allocUnsafe(5 + sessionBuf.length);
        buf.writeUInt32BE(1 + sessionBuf.length, 0);
        buf.writeUInt8(define.Rpc_Msg.applySession, 4);
        sessionBuf.copy(buf, 5);
        this.app.rpcPool.sendMsg(sid, buf);
    }

    /**
     * 后端服发送消息给客户端
     */
    sendMsgByUidSid(cmd: number, msg: any, uidsid: { "uid": number, "sid": string }[]) {
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

        let msgBuf: Buffer = app.protoEncode(cmd, msg);
        console.log("<<<<<<<<<<<<<<< 发送消息", cmd, groups, msg);
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
    sendMsgByGroup(cmd: number, msg: any, group: { [sid: string]: number[] }) {
        let app = this.app;
        let msgBuf: Buffer = app.protoEncode(cmd, msg);
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
