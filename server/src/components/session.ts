/**
 * session class. The front-end server represents the client connection, and the back-end server is a copy of some data
 */


const BSON = require('bson');
const Long = BSON.Long;

import { Application } from "../application";
import { I_clientSocket, sessionCopyJson } from "../util/interfaceDefine";

let app: Application;

export function initSessionApp(_app: Application) {
    app = _app;
}

export class Session {
    uid: number = 0;                                        // The bound uid, the unique identifier of the player
    private sid: string = "";                               // Front-end server id
    private settings: { [key: string]: any } = {};          // user set,get
    private settingsLocal: { [key: string]: any } = {};     // user set,get（Local, will not exist in buf）
    sessionBuf: Buffer = null as any;                       // buff
    saveRemoteIP: string = "";
    saveRemotePort: number = 0;

    socket: I_clientSocket = null as any;                   // Player's socket connection

    constructor(sid: string = "") {
        this.sid = sid;
        this.resetBuf();
    }

    private resetBuf() {
        if (app.frontend) {
            let tmpBuf = BSON.serialize({ "uid": this.uid, "sid": this.sid, "settings": this.settings });
            this.sessionBuf = Buffer.alloc(tmpBuf.length).fill(tmpBuf); // Copy reason: Buffer.from may be allocated from the internal buffer pool, while sessionBuf is almost resident
        }
    }

    public getFrontendSid(){
        return this.sid;
    }

    /**
     * 绑定UID到session
     * 仅限前端服调用
     */
    bind(_uid: number): boolean {
        if (!app.frontend || !this.socket) {
            return false;
        }
        if (app.clients[_uid]) {
            return false;
        }
        app.clients[_uid] = this.socket;

        this.uid = _uid;
        this.resetBuf();
        return true;
    }

    set(_settings: { [key: string]: any }) {
        for (let f in _settings) {
            this.settings[f] = _settings[f];
        }
        this.resetBuf();
    }


    get(key: string | number) {
        return this.settings[key];
    }

    delete(keys: (string | number)[]) {
        for (let one of keys) {
            delete this.settings[one];
        }
        this.resetBuf();
    }


    setLocal(key: number | string, value: any) {
        this.settingsLocal[key] = value;
    }


    getLocal(key: number | string) {
        return this.settingsLocal[key];
    }


    deleteLocal(key: number | string) {
        delete this.settingsLocal[key];
    }

    /**
     * 复制session值给当前session
     */
    setAll(_session: sessionCopyJson) {
        this.uid = _session.uid;
        this.sid = _session.sid;
        this.settings = _session.settings;
    }


    /**
     * 关闭一个session对应的socket链接
     * 仅限前端服调用
     */
    close() {
        if (app.frontend && this.socket) {
            this.socket.close();
        }
    }

    /**
     * 把后端服对session的修改同步到前端服
     * Push the back-end session to the front-end [Note: back-end call]
     */
    apply() {
        if (!app.frontend) {
            app.backendServer.sendSession(this.sid, Buffer.from(BSON.serialize({
                "uid": this.uid,
                "settings": this.settings
            })));
        }
    }
    /**
     * 前端服接收到后端服发过来的apply后设置到前端服
     * After the back-end calls apply, the processing received by the front-end
     */
    applySession(settings: { [key: string]: any }) {
        this.settings = settings;
        this.resetBuf();
    }

    /**
     * Get ip 
     * 警告，在TCP中有把"::ffff:"替换成空字符串
     */
    getIp() {
        if (this.socket) {
            this.saveRemoteIP = this.socket.remoteAddress;
            return this.saveRemoteIP;
        } else {
            return this.saveRemoteIP;
        }
    }
    /**
     * Get port
     * 警告，目前只在ConnectorTcp 支持了该接口，WebSocket没有支持，有需要再看这个
     * @returns 
     */
    getPort() {
        if (this.socket) {
            this.saveRemotePort = this.socket.remotePort;
            return this.saveRemotePort;
        } else {
            return this.saveRemotePort;
        }
    }

    getRealIp() {
        if (this.socket) {
            let pattern = /\b((\d{1,2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))\.((\d{1,2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))\.((\d{1,2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))\.((\d{1,2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))\b/
            let ip = pattern.exec(this.socket.remoteAddress);
            if (ip) {
                return ip[0];
            } else {
                console.error("异常的IP匹配", this.socket.remoteAddress);
                return "";
            }
        } else {
            return "";
        }
    }

    /** 发送协议到客户端 
     * 仅限于在前端服 后端没有sokcet链接
     */
    send(cmd: number, msg: any) {
        if (!app.frontend || !this.socket) {
            return;
        }
        if (msg === undefined) {
            msg = null;
        }
        let msgBuf = app.protoEncode(cmd, msg);
        this.socket.send(msgBuf);
    }
}