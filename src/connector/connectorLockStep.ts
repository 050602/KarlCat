import * as crypto from "crypto";
import { EventEmitter } from "events";
import { Application } from "../application";
import { serversConfig } from "../serverConfig/servers";
import { I_clientManager, I_connectorConfig, I_encodeDecodeConfig } from "../util/interfaceDefine";
import { kcpServer } from "./connectorKcp";

/**
 * connector lockstep
 */
export class ConnectorLockStep {
    public app: Application;
    public clientManager: I_clientManager = null as any;
    public handshakeBuf: Buffer;        // Handshake buffer
    public handshakeBufAll: Buffer = null as any;        // Handshake buffer all
    public heartbeatBuf: Buffer;        // Heartbeat response buffer
    public heartbeatTime: number = 0;   // Heartbeat time
    public beClosedBuf: Buffer;        // beClosed buffer
    public maxConnectionNum: number = Number.POSITIVE_INFINITY;
    public nowConnectionNum: number = 0;
    public sendCache = false;
    public interval: number = 0;
    public md5 = "";    // route array md5
    public maxLen = 0;

    constructor(info: { app: Application, clientManager: I_clientManager, config: I_connectorConfig, startCb: () => void }) {
        this.app = info.app;
        this.clientManager = info.clientManager;

        let connectorConfig = info.config || {};
        this.maxLen = connectorConfig.maxLen || 10 * 1024 * 1024;
        this.heartbeatTime = (connectorConfig.heartbeat || 0) * 1000;
        if (connectorConfig.maxConnectionNum != null) {
            this.maxConnectionNum = connectorConfig.maxConnectionNum;
        }
        let interval = Number(connectorConfig.interval) || 0;
        if (interval >= 10) {
            this.sendCache = true;
            this.interval = interval;
        }


        // Handshake buffer
        let cipher = crypto.createHash("md5")
        this.md5 = cipher.update(JSON.stringify(serversConfig)).digest("hex");

        let routeBuf = Buffer.from(JSON.stringify({ "md5": this.md5, "heartbeat": this.heartbeatTime * 0.001 }));
        this.handshakeBuf = Buffer.alloc(routeBuf.length + 1);
        this.handshakeBuf.writeUInt8(Server_To_Client.handshake, 0);
        routeBuf.copy(this.handshakeBuf, 1);

        let routeBufAll = Buffer.from(JSON.stringify({ "md5": this.md5, "route": serversConfig, "heartbeat": this.heartbeatTime * 0.001 }));
        this.handshakeBufAll = Buffer.alloc(routeBufAll.length + 1);
        this.handshakeBufAll.writeUInt8(Server_To_Client.handshake, 0);
        routeBufAll.copy(this.handshakeBufAll, 1);

        // Heartbeat response buffer
        this.heartbeatBuf = Buffer.alloc(1);
        this.heartbeatBuf.writeUInt8(Server_To_Client.heartbeatResponse, 0);

        // be closed buffer
        this.beClosedBuf = Buffer.alloc(1);
        this.beClosedBuf.writeUInt8(Server_To_Client.beClosed, 0);


        // wsServer(info.app.serverInfo.clientPort, connectorConfig, () => {
        // kcpServer(info.app.serverInfo.clientPort, connectorConfig, this, () => {
        //     info.startCb();
        // });
        // }, this.newClientCb);

        kcpServer(info.app.serverInfo.clientPort, connectorConfig, this, () => {
            info.startCb();
        });

    }
}


/**
 * client to server, message type
 */
export const enum Client_To_Server {
    msg = 1,
    handshake = 2,
    heartbeat = 3,
    close = 4,
}

/**
 * server to client, message type
 */
export const enum Server_To_Client {
    msg = 1,
    handshake = 2,
    heartbeatResponse = 3,
    beClosed = 4,
}

/**
 * socket connection proxy
 */
export interface SocketProxy extends EventEmitter {
    socket: any;
    remoteAddress: string;
    die: boolean;
    maxLen: number;
    len: number;
    buffer: Buffer;
    headLen: number;
    headBuf: Buffer;
    close(): void;
    send(data: Buffer): void;
}

