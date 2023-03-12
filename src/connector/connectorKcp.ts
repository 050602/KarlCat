
import dgram from 'dgram';
var kcp = require('node-kcp');
import { Client_To_Server, ConnectorLockStep, SocketProxy } from "./connectorLockStep";
import { EventEmitter } from "events";
import { I_clientManager, I_clientSocket, I_connectorConfig } from '../util/interfaceDefine';
import { Session } from '../components/session';
import { errLog, logTest } from '../LogTS';


let udpClients: { [key: string]: ClientSocket } = {};
let closedClients: { [key: string]: { "time": number, "kcpobj": any } } = {};   // 被关闭了的连接。（kcp被关闭时，向客户端发送关闭消息，需要update驱动一会儿）

export function kcpServer(port: number, config: I_connectorConfig, connector: ConnectorLockStep, startCb: () => void) {
    let svr = dgram.createSocket("udp4");
    let interval = connector.interval || 40;

    function outputFunc(data: Buffer, size: number, context: I_kcpContext) {
        svr.send(data, 0, size, context.port, context.address);
    };

    svr.on("message", (msg, rinfo) => {
        // console.log("on message", msg, rinfo);
        let client = udpClients[rinfo.address + rinfo.port];
        if (!client) {
            if (closedClients[rinfo.address + rinfo.port]) {    // 正在关闭中
                return;
            }

            let context: I_kcpContext = {
                address: rinfo.address,
                port: rinfo.port
            };
            let kcpobj = new kcp.KCP(rinfo.port, context);//来自同一个连接的两个端点的` conv `必须相等。
            kcpobj.nodelay(1, interval, 2, 1);
            kcpobj.wndsize(256, 256);
            kcpobj.output(outputFunc);

            let socket = new UdpSocket(kcpobj, rinfo);
            client = new ClientSocket(connector, connector.clientManager, socket);
            udpClients[rinfo.address + rinfo.port] = client;

            if (connector.nowConnectionNum >= connector.maxConnectionNum) {
                console.warn("socket num has reached the maxConnectionNum, close it");
                client.close();
                return;
            }
        }

        client.socket.kcpobj.input(msg);
    });

    svr.on("error", (e) => {
        errLog("kcpSvr error", e);
        process.exit();
    });
    svr.on("close", () => { });
    svr.bind(port, () => {
        startCb();
        setInterval(updateFunc, interval);
    });

}

/** kcp update 和 接收数据检测 */
function updateFunc() {
    let now = Date.now();
    for (let x in udpClients) {
        let client = udpClients[x];
        client.socket.kcpobj.update(now);

        let recv: Buffer = client.socket.kcpobj.recv();
        if (recv) {
            client.socket.emit("data", recv);
        }
    }

    for (let x in closedClients) {
        let client = closedClients[x];
        if (now > client.time) {
            delete closedClients[x];
            continue;
        }
        client.kcpobj.update(now);
    }
}


export class UdpSocket extends EventEmitter implements SocketProxy {
    die: boolean = false;
    remoteAddress: string = "";
    len: number = 0;
    maxLen: number = 0;
    buffer: Buffer = Buffer.allocUnsafe(0);
    socket: any = null;
    kcpobj: any;
    rinfo: dgram.RemoteInfo;

    headLen = 0;
    headBuf = null as any;

    constructor(kcpobj: any, rinfo: dgram.RemoteInfo) {
        super();
        this.kcpobj = kcpobj;
        this.rinfo = rinfo;
        this.remoteAddress = rinfo.address + "/" + rinfo.port;
    }

    send(data: Buffer) {
        // logTest("send Msg", data);
        // console.log("send Msg", data);
        this.kcpobj.send(data);
    }

    close() {
        if (this.die) {
            return;
        }
        this.die = true;

        let rinfo = this.rinfo.address + this.rinfo.port;
        delete udpClients[rinfo];
        closedClients[rinfo] = { "time": Date.now() + 1000, "kcpobj": this.kcpobj };

        this.emit("close");
    }
}


export class ClientSocket implements I_clientSocket {
    session: Session = null as any;                         // Session
    remoteAddress: string = "";
    private connector: ConnectorLockStep;
    private clientManager: I_clientManager;
    public socket: UdpSocket;                            // socket
    private registerTimer: NodeJS.Timer = null as any;      // Handshake timeout timer
    private heartbeatTimer: NodeJS.Timer = null as any;     // Heartbeat timeout timer
    private sendCache = false;
    private interval: number = 0;
    private sendTimer: NodeJS.Timer = null as any;
    private sendArr: Buffer[] = [];
    private onDataFunc: (...args: any[]) => void;

    constructor(connector: ConnectorLockStep, clientManager: I_clientManager, socket: UdpSocket) {
        this.connector = connector;
        this.connector.nowConnectionNum++;
        // this.sendCache = connector.sendCache;
        // this.interval = connector.interval;
        this.clientManager = clientManager;
        this.socket = socket;
        this.remoteAddress = socket.remoteAddress;
        socket.once('data', this.onRegister.bind(this));
        socket.on('close', this.onClose.bind(this));

        this.onDataFunc = this.onData.bind(this);

        this.registerTimer = setTimeout(() => {
            this.close();
        }, 5000);
    }

    private onRegister(data: Buffer) {
        // console.log("onRegister", data);
        let type = data.readUInt8(0);
        if (type === Client_To_Server.handshake) {        // shake hands
            this.handshake(data);
        } else {
            this.close();
        }
    }

    /**
     * Received data
     */
    private onData(data: Buffer) {
        // console.log("onData", data);
        let type = data.readUInt8(0);
        if (type === Client_To_Server.msg) {               // Ordinary custom message
            this.clientManager.handleMsg(this, data);
        } else if (type === Client_To_Server.heartbeat) {        // Heartbeat
            this.heartbeat();
            this.heartbeatResponse();
        } else if (type === Client_To_Server.close) {        // client close
            this.close();
        } else {
            this.close();
        }
    }

    /**
     * closed
     */
    private onClose() {
        this.connector.nowConnectionNum--;
        clearTimeout(this.registerTimer);
        clearTimeout(this.heartbeatTimer);
        this.heartbeatTimer = null as any;
        clearInterval(this.sendTimer);
        this.sendArr = [];
        this.socket.off("data", this.onDataFunc);
        this.clientManager.removeClient(this);
    }

    /**
     * shake hands
     */
    private handshake(data: Buffer) {
        let msg: { "md5": string } = null as any;
        try {
            msg = JSON.parse(data.subarray(1).toString());
        } catch (e) {
            console.log("error:", e);
        }
        if (!msg) {
            this.close();
            return;
        }
        if (msg.md5 === this.connector.md5) {
            this.send(this.connector.handshakeBuf);
        } else {
            this.send(this.connector.handshakeBufAll);
        }

        clearTimeout(this.registerTimer);
        this.heartbeat();
        this.clientManager.addClient(this);
        // if (this.sendCache) {
        // this.sendTimer = setInterval(this.sendInterval.bind(this), this.interval);
        // }
        this.socket.on('data', this.onDataFunc);
    }

    /**
     * Heartbeat
     */
    private heartbeat() {
        if (this.connector.heartbeatTime === 0) {
            return;
        }
        if (this.heartbeatTimer) {
            this.heartbeatTimer.refresh();
        } else {
            this.heartbeatTimer = setTimeout(() => {
                this.close();
            }, this.connector.heartbeatTime * 2);
        }
    }

    /**
     * Heartbeat response
     */
    private heartbeatResponse() {
        this.send(this.connector.heartbeatBuf);
    }

    /**
     * send data
     */
    send(msg: Buffer) {
        this.socket.send(msg);
    }

    private sendInterval() {
        if (this.sendArr.length > 0) {
            this.socket.send(Buffer.concat(this.sendArr));
            this.sendArr.length = 0;
        }
    }

    /**
     * close
     */
    close() {
        this.send(this.connector.beClosedBuf);
        this.sendInterval();
        this.socket.close();
    }
}





interface I_kcpContext {
    "port": number,
    "address": string
}