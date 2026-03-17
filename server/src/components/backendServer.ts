

import { Application } from "../application";
import * as protocol from "../connector/protocol";
import { ServerType, getServerTypeByMainKey } from "../register/route";
import { I_encodeDecodeConfig, sessionCopyJson } from "../util/interfaceDefine";
import { TSEventCenter } from "../utils/TSEventCenter";
import { encodeRemoteData } from "./msgCoder";
import { initSessionApp, Session } from "./session";
import define = require("../util/define");
const BSON = require('bson');
const Long = BSON.Long;

// realCross 内部代理 sid 结构：__realcross_proxy__|<crossSid>|<originSid>
const REAL_CROSS_PROXY_SID_PREFIX = "__realcross_proxy__|";



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

        // 可选：cross 服将跨服协议直接转发到 realCross（默认关闭）
        if (this.tryForwardCrossCmdToRealCross(id, cmd, msg)) {
            return;
        }

        //此处返回的是Protobuf的结构体，而不是Buffer
        let data = this.app.msgDecode(cmd, msg.subarray(5 + sessionLen));
        if (!data) {
            console.error("异常的调用协议，可能是在扫描协议", session.uid, session.getIp(), session.getPort());
            return;
        }
        console.log(">>>>>>>>>>>>>>>" + this.app.serverName + " 收到消息", cmd, id, "\n", session, "\n", data);

        TSEventCenter.Instance.eventCMDAsync(session.uid, cmd, data, session, this.callback(id, session.uid));
    }

    private tryForwardCrossCmdToRealCross(id: string, cmd: number, msg: Buffer): boolean {
        if (this.app.serverType !== ServerType.cross) {
            return false;
        }
        let enableProxy = !!this.app.get("enableCrossCmdForward");
        if (!enableProxy) {
            return false;
        }
        if (getServerTypeByMainKey(cmd) !== ServerType.cross) {
            return false;
        }
        let realCrossSocketName = this.app.get("realCrossSocketName") as string;
        if (!realCrossSocketName) {
            return false;
        }
        let socket = this.app.rpcPool.getSocket(realCrossSocketName);
        if (!socket) {
            return false;
        }

        let sidBuf = Buffer.from(id, "utf8");
        let rawPayload = msg.subarray(1); // remove msg-type, keep [sessionLen + session + cmd + payload]
        let buf = Buffer.allocUnsafe(1 + 2 + sidBuf.length + rawPayload.length);
        buf.writeUInt8(define.Rpc_Msg.forward_cross2RealCross_inSubZone, 0);
        buf.writeUInt16BE(sidBuf.length, 1);
        sidBuf.copy(buf, 3);
        rawPayload.copy(buf, 3 + sidBuf.length);
        socket.send(buf);
        return true;
    }

    // realCross 接收来自 cross 的客户端协议透传
    onForwardCross2RealCross_inSubZone(id: string, msg: Buffer) {
        if (this.app.serverType !== ServerType.realCross) {
            return;
        }
        if (msg.length < 3) {
            return;
        }
        let sidLen = msg.readUInt16BE(1);
        let sidStart = 3;
        let sidEnd = sidStart + sidLen;
        if (sidEnd > msg.length) {
            return;
        }
        let sid = msg.subarray(sidStart, sidEnd).toString("utf8");
        let rawPayload = msg.subarray(sidEnd);
        if (rawPayload.length == 0) {
            return;
        }

        let proxySid = this.makeRealCrossProxySid(id, sid || id);
        let payload = this.rewriteForwardPayloadSid(rawPayload, proxySid);
        if (!payload) {
            return;
        }
        let buf = Buffer.allocUnsafe(payload.length + 1);
        buf.writeUInt8(define.Rpc_Msg.clientMsgIn, 0);
        payload.copy(buf, 1);
        this.handleMsg(proxySid, buf);
    }

    // realCross -> cross 反向透传，并回到本区原始 sid（通常是 gate-x）
    onForwardRealCross2cross_inCrossZone(id: string, msg: Buffer) {
        if (this.app.serverType !== ServerType.cross) {
            return;
        }
        if (msg.length < 3) {
            return;
        }
        let sidLen = msg.readUInt16BE(1);
        let sidStart = 3;
        let sidEnd = sidStart + sidLen;
        if (sidEnd > msg.length) {
            return;
        }
        let sid = msg.subarray(sidStart, sidEnd).toString("utf8");
        let rawPacket = msg.subarray(sidEnd);
        if (!sid || rawPacket.length == 0) {
            return;
        }

        let packet = Buffer.allocUnsafe(rawPacket.length + 4);
        packet.writeUInt32BE(rawPacket.length, 0);
        rawPacket.copy(packet, 4);
        this.app.rpcPool.sendMsg(sid, packet);
    }

    private makeRealCrossProxySid(crossSid: string, originSid: string): string {
        return `${REAL_CROSS_PROXY_SID_PREFIX}${crossSid}|${originSid}`;
    }

    /**
     * 解析 realCross 内部代理 sid，提取：
     * - crossSid：回流目标 cross 节点
     * - originSid：该 cross 下原始 sid（通常 gate-x）
     */
    private parseRealCrossProxySid(sid: string): { crossSid: string, originSid: string } | null {
        if (!sid || !sid.startsWith(REAL_CROSS_PROXY_SID_PREFIX)) {
            return null;
        }
        let body = sid.slice(REAL_CROSS_PROXY_SID_PREFIX.length);
        let pos = body.indexOf("|");
        if (pos <= 0) {
            return null;
        }
        let crossSid = body.slice(0, pos);
        let originSid = body.slice(pos + 1);
        if (!crossSid || !originSid) {
            return null;
        }
        return { crossSid, originSid };
    }

    /**
     * 重写透传包中的 session.sid。
     * realCross 执行逻辑时需要把 sid 改成代理 sid，便于回包准确回到原 cross+gate。
     */
    private rewriteForwardPayloadSid(rawPayload: Buffer, sid: string): Buffer | null {
        if (rawPayload.length < 2) {
            return null;
        }
        let sessionLen = rawPayload.readUInt16BE(0);
        let sessionStart = 2;
        let sessionEnd = sessionStart + sessionLen;
        if (sessionEnd > rawPayload.length) {
            return null;
        }
        let sessionObj: sessionCopyJson;
        try {
            sessionObj = BSON.deserialize(rawPayload.subarray(sessionStart, sessionEnd)) as sessionCopyJson;
        } catch (err) {
            return null;
        }

        sessionObj.sid = sid;
        let newSessionBuf = BSON.serialize(sessionObj);
        let tail = rawPayload.subarray(sessionEnd);
        let payload = Buffer.allocUnsafe(2 + newSessionBuf.length + tail.length);
        payload.writeUInt16BE(newSessionBuf.length, 0);
        newSessionBuf.copy(payload, 2);
        tail.copy(payload, 2 + newSessionBuf.length);
        return payload;
    }

    /**
     * 统一发送出口：
     * - 普通服：直接按 sid 发送
     * - realCross：若命中代理 sid，则封装为 forward_realCross2cross_inCrossZone 回传给 cross
     */
    private sendPacketToSid(sid: string, packet: Buffer) {
        if (this.app.serverType !== ServerType.realCross) {
            this.app.rpcPool.sendMsg(sid, packet);
            return;
        }
        let proxyInfo = this.parseRealCrossProxySid(sid);
        if (!proxyInfo) {
            this.app.rpcPool.sendMsg(sid, packet);
            return;
        }

        let socket = this.app.rpcPool.getSocket(proxyInfo.crossSid);
        if (!socket) {
            return;
        }
        let sidBuf = Buffer.from(proxyInfo.originSid, "utf8");
        let rawPacket = packet.subarray(4);
        let out = Buffer.allocUnsafe(7 + sidBuf.length + rawPacket.length);
        out.writeUInt32BE(3 + sidBuf.length + rawPacket.length, 0);
        out.writeUInt8(define.Rpc_Msg.forward_realCross2cross_inCrossZone, 4);
        out.writeUInt16BE(sidBuf.length, 5);
        sidBuf.copy(out, 7);
        rawPacket.copy(out, 7 + sidBuf.length);
        socket.send(out);
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
            self.sendPacketToSid(id, buf);
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
        this.sendPacketToSid(sid, buf);
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
            this.sendPacketToSid(sid, buf);
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
            this.sendPacketToSid(sid, buf);
        }
    }
}
