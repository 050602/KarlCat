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
    /**
     * Binding session [Note: Front-end call]
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
     * Set up all sessions
     */
    setAll(_session) {
        this.uid = _session.uid;
        this.sid = _session.sid;
        this.settings = _session.settings;
    }
    /**
     * Close the connection [Note: Front-end call]
     */
    close() {
        if (app.frontend && this.socket) {
            this.socket.close();
        }
    }
    /**
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
     * After the back-end calls apply, the processing received by the front-end
     */
    applySession(settings) {
        this.settings = settings;
        this.resetBuf();
    }
    /**
     * Get ip
     */
    getIp() {
        if (this.socket) {
            return this.socket.remoteAddress;
        }
        else {
            return "";
        }
    }
    /** Send msg to client */
    send(mainKey, sonKey, msg) {
        if (!app.frontend || !this.socket) {
            return;
        }
        if (msg === undefined) {
            msg = null;
        }
        let msgBuf = app.protoEncode(mainKey, sonKey, msg, false);
        this.socket.send(msgBuf);
    }
}
exports.Session = Session;
//# sourceMappingURL=session.js.map