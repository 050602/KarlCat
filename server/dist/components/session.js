"use strict";
/**
 * session class. The front-end server represents the client connection, and the back-end server is a copy of some data
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Session = exports.initSessionApp = void 0;
const BSON = require('bson');
const Long = BSON.Long;
let app;
function initSessionApp(_app) {
    app = _app;
}
exports.initSessionApp = initSessionApp;
class Session {
    constructor(sid = "") {
        this.uid = 0; // The bound uid, the unique identifier of the player
        this.sid = ""; // Front-end server id
        this.settings = {}; // user set,get
        this.settingsLocal = {}; // user set,get（Local, will not exist in buf）
        this.sessionBuf = null; // buff
        this.saveRemoteIP = "";
        this.saveRemotePort = 0;
        this.socket = null; // Player's socket connection
        this.sid = sid;
        this.resetBuf();
    }
    resetBuf() {
        if (app.frontend) {
            let tmpBuf = BSON.serialize({ "uid": this.uid, "sid": this.sid, "settings": this.settings });
            this.sessionBuf = Buffer.alloc(tmpBuf.length).fill(tmpBuf); // Copy reason: Buffer.from may be allocated from the internal buffer pool, while sessionBuf is almost resident
        }
    }
    getFrontendSid() {
        return this.sid;
    }
    /**
     * 绑定UID到session
     * 仅限前端服调用
     */
    bind(_uid) {
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
    set(_settings) {
        for (let f in _settings) {
            this.settings[f] = _settings[f];
        }
        this.resetBuf();
    }
    get(key) {
        return this.settings[key];
    }
    delete(keys) {
        for (let one of keys) {
            delete this.settings[one];
        }
        this.resetBuf();
    }
    setLocal(key, value) {
        this.settingsLocal[key] = value;
    }
    getLocal(key) {
        return this.settingsLocal[key];
    }
    deleteLocal(key) {
        delete this.settingsLocal[key];
    }
    /**
     * 复制session值给当前session
     */
    setAll(_session) {
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
    applySession(settings) {
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
        }
        else {
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
        }
        else {
            return this.saveRemotePort;
        }
    }
    getRealIp() {
        if (this.socket) {
            let pattern = /\b((\d{1,2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))\.((\d{1,2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))\.((\d{1,2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))\.((\d{1,2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))\b/;
            let ip = pattern.exec(this.socket.remoteAddress);
            if (ip) {
                return ip[0];
            }
            else {
                console.error("异常的IP匹配", this.socket.remoteAddress);
                return "";
            }
        }
        else {
            return "";
        }
    }
    /** 发送协议到客户端
     * 仅限于在前端服 后端没有sokcet链接
     */
    send(cmd, msg) {
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
exports.Session = Session;
//# sourceMappingURL=session.js.map