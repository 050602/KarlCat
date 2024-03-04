"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientSocket = exports.UdpSocket = exports.kcpServer = void 0;
const dgram_1 = __importDefault(require("dgram"));
// var kcp = require('node-kcp');
let kcp = null;
const events_1 = require("events");
const SocketState_1 = require("../const/SocketState");
let udpClients = {};
let closedClients = {}; // 被关闭了的连接。（kcp被关闭时，向客户端发送关闭消息，需要update驱动一会儿）
function kcpServer(port, config, connector, startCb) {
    let svr = dgram_1.default.createSocket("udp4");
    let interval = connector.interval || 40;
    function outputFunc(data, size, context) {
        svr.send(data, 0, size, context.port, context.address);
    }
    ;
    svr.on("message", (msg, rinfo) => {
        // console.log("on message", msg, rinfo);
        let client = udpClients[rinfo.address + rinfo.port];
        if (!client) {
            if (closedClients[rinfo.address + rinfo.port]) { // 正在关闭中
                return;
            }
            let context = {
                address: rinfo.address,
                port: rinfo.port
            };
            let kcpobj = new kcp.KCP(rinfo.port, context); //来自同一个连接的两个端点的` conv `必须相等。
            kcpobj.nodelay(1, interval, 2, 1);
            kcpobj.wndsize(256, 256);
            kcpobj.output(outputFunc);
            let socket = new UdpSocket(kcpobj, rinfo);
            client = new ClientSocket(connector, connector.clientManager, socket);
            udpClients[rinfo.address + rinfo.port] = client;
            if (!SocketState_1.SocketState.Instance.openClientSocket) {
                client.close();
                return;
            }
            if (connector.nowConnectionNum >= connector.maxConnectionNum) {
                console.warn("socket num has reached the maxConnectionNum, close it");
                client.close();
                return;
            }
        }
        client.socket.kcpobj.input(msg);
    });
    svr.on("error", (e) => {
        console.error("kcpSvr error", e);
        process.exit();
    });
    svr.on("close", () => { });
    svr.bind(port, () => {
        startCb();
        setInterval(updateFunc, interval);
    });
}
exports.kcpServer = kcpServer;
/** kcp update 和 接收数据检测 */
function updateFunc() {
    let now = Date.now();
    for (let x in udpClients) {
        let client = udpClients[x];
        client.socket.kcpobj.update(now);
        let recv = client.socket.kcpobj.recv();
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
class UdpSocket extends events_1.EventEmitter {
    constructor(kcpobj, rinfo) {
        super();
        this.die = false;
        this.remoteAddress = "";
        this.remotePort = 0;
        this.len = 0;
        this.maxLen = 0;
        this.buffer = Buffer.allocUnsafe(0);
        this.socket = null;
        this.headLen = 0;
        this.headBuf = null;
        this.kcpobj = kcpobj;
        this.rinfo = rinfo;
        this.remoteAddress = rinfo.address + "/" + rinfo.port;
        this.remotePort = rinfo.port;
    }
    send(data) {
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
exports.UdpSocket = UdpSocket;
class ClientSocket {
    constructor(connector, clientManager, socket) {
        this.session = null; // Session
        this.remoteAddress = "";
        this.remotePort = 0;
        this.registerTimer = null; // Handshake timeout timer
        this.heartbeatTimer = null; // Heartbeat timeout timer
        this.sendCache = false;
        this.interval = 0;
        this.sendTimer = null;
        this.sendArr = [];
        this.connector = connector;
        this.connector.nowConnectionNum++;
        // this.sendCache = connector.sendCache;
        // this.interval = connector.interval;
        this.clientManager = clientManager;
        this.socket = socket;
        this.remoteAddress = socket.remoteAddress;
        this.remotePort = socket.remotePort;
        socket.once('data', this.onRegister.bind(this));
        socket.on('close', this.onClose.bind(this));
        this.onDataFunc = this.onData.bind(this);
        this.registerTimer = setTimeout(() => {
            this.close();
        }, 5000);
    }
    onRegister(data) {
        if (!SocketState_1.SocketState.Instance.openClientSocket) {
            this.close();
            return;
        }
        // console.log("onRegister", data);
        let type = data.readUInt8(0);
        if (type === 2 /* Client_To_Server.handshake */) { // shake hands
            this.handshake(data);
        }
        else {
            this.close();
        }
    }
    /**
     * Received data
     */
    onData(data) {
        // console.log("onData", data);
        let type = data.readUInt8(0);
        if (type === 1 /* Client_To_Server.msg */) { // Ordinary custom message
            this.clientManager.handleMsg(this, data);
        }
        else if (type === 3 /* Client_To_Server.heartbeat */) { // Heartbeat
            this.heartbeat();
            this.heartbeatResponse();
        }
        else if (type === 4 /* Client_To_Server.close */) { // client close
            this.close();
        }
        else {
            this.close();
        }
    }
    /**
     * closed
     */
    onClose() {
        this.connector.nowConnectionNum--;
        clearTimeout(this.registerTimer);
        clearTimeout(this.heartbeatTimer);
        this.heartbeatTimer = null;
        clearInterval(this.sendTimer);
        this.sendArr = [];
        this.socket.off("data", this.onDataFunc);
        this.clientManager.removeClient(this);
    }
    /**
     * shake hands
     */
    handshake(data) {
        let msg = null;
        try {
            msg = JSON.parse(data.subarray(1).toString());
        }
        catch (e) {
            console.log("error:", e);
        }
        if (!msg) {
            this.close();
            return;
        }
        if (msg.md5 === this.connector.md5) {
            this.send(this.connector.handshakeBuf);
        }
        else {
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
    heartbeat() {
        if (this.connector.heartbeatTime === 0) {
            return;
        }
        if (this.heartbeatTimer) {
            this.heartbeatTimer.refresh();
        }
        else {
            this.heartbeatTimer = setTimeout(() => {
                this.close();
            }, this.connector.heartbeatTime * 2);
        }
    }
    /**
     * Heartbeat response
     */
    heartbeatResponse() {
        this.send(this.connector.heartbeatBuf);
    }
    /**
     * send data
     */
    send(msg) {
        this.socket.send(msg);
    }
    sendInterval() {
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
exports.ClientSocket = ClientSocket;
//# sourceMappingURL=connectorKcp.js.map