/**
 * tcp server
 */


import * as net from "net";
import { EventEmitter } from "events";
import { SocketProxy } from "../util/interfaceDefine";
import { decode } from "./msgCoder";
import { some_config } from "../util/define";
import { app, isDebug } from "../app";


export default function tcpServer(port: number, noDelay: boolean, startCb: () => void, newClientCb: (socket: SocketProxy) => void) {
    let svr = net.createServer(function (socket) {
        socket.setNoDelay(noDelay);
        newClientCb(new NetSocket(socket));
    }).listen(port, startCb);

    svr.on("error", (err) => {
        console.error("error", err);
        process.exit();
    });
    svr.on("close", () => { });
}

class NetSocket extends EventEmitter implements SocketProxy {
    die: boolean = false;
    remoteAddress: string = "";
    remotePort:number = 0;
    socket: net.Socket;
    maxLen: number;
    len: number = 0;
    buffer: Buffer = null as any;
    headLen = 0;
    headBuf = Buffer.alloc(4);
    private onDataFunc: (data: Buffer) => void = null as any;

    constructor(socket: net.Socket) {
        super();
        this.socket = socket;
        this.maxLen = some_config.SocketBufferMaxLenUnregister;
        this.remoteAddress = socket.remoteAddress as string;
        this.remotePort = socket.remotePort;
        this.socket.on("close", () => {
            this.onClose();
        });
        this.socket.on("error", (err) => {
            this.onClose(err);
        });

        this.onDataFunc = this.onData.bind(this);
        this.socket.on("data", this.onDataFunc);

    }

    private onClose(err?: Error) {
        if (!this.die) {
            this.die = true;
            this.socket.off("data", this.onDataFunc);
            this.emit("close", err);
        }
    }

    private onData(data: Buffer) {
        decode(this, data);
    }


    send(data: Buffer) {
        this.socket.write(data);
        if (isDebug) {
            if (data.length > this.maxLen) {
                //容错，避免自己杀自己
                if (this.remoteAddress == "127.0.0.1") {
                    console.error(app.serverName + " send is longer then " + this.maxLen + " , nowlen : " + data.length + ", from " + this.remoteAddress + " not close it");
                    return;
                }
                console.error(app.serverName + " send is longer then " + this.maxLen + " , nowlen : " + data.length + ", close it, " + this.remoteAddress);
                return;
            }

            if (this.len > this.maxLen) {
                //容错，避免自己杀自己
                if (this.remoteAddress == "127.0.0.1") {
                    console.error(app.serverName + " send is longer then " + this.maxLen + " , nowlen : " + this.len + ", from " + this.remoteAddress + " not close it");
                    return;
                }
                console.error(app.serverName + " send is longer then " + this.maxLen + " , nowlen : " + this.len + ", close it, " + this.remoteAddress);
                return;
            }
        }
    }

    close() {
        this.socket.end(() => {
            setTimeout(() => {
                this.socket.destroy();
            }, 1000)
        });
        this.socket.emit("close");
    }
}