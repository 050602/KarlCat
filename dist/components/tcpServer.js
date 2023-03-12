"use strict";
/**
 * tcp server
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const net = __importStar(require("net"));
const events_1 = require("events");
const msgCoder_1 = require("./msgCoder");
const define_1 = require("../util/define");
const LogTS_1 = require("../LogTS");
function tcpServer(port, noDelay, startCb, newClientCb) {
    let svr = net.createServer(function (socket) {
        socket.setNoDelay(noDelay);
        newClientCb(new NetSocket(socket));
    }).listen(port, startCb);
    svr.on("error", (err) => {
        (0, LogTS_1.errLog)("error", err);
        process.exit();
    });
    svr.on("close", () => { });
}
exports.default = tcpServer;
class NetSocket extends events_1.EventEmitter {
    constructor(socket) {
        super();
        this.die = false;
        this.remoteAddress = "";
        this.len = 0;
        this.buffer = null;
        this.headLen = 0;
        this.headBuf = Buffer.alloc(4);
        this.onDataFunc = null;
        this.socket = socket;
        this.maxLen = define_1.some_config.SocketBufferMaxLenUnregister;
        this.remoteAddress = socket.remoteAddress;
        this.socket.on("close", () => {
            this.onClose();
        });
        this.socket.on("error", (err) => {
            this.onClose(err);
        });
        this.onDataFunc = this.onData.bind(this);
        this.socket.on("data", this.onDataFunc);
    }
    onClose(err) {
        if (!this.die) {
            this.die = true;
            this.socket.off("data", this.onDataFunc);
            this.emit("close", err);
        }
    }
    onData(data) {
        (0, msgCoder_1.decode)(this, data);
    }
    send(data) {
        this.socket.write(data);
    }
    close() {
        this.socket.end(() => {
            setTimeout(() => {
                this.socket.destroy();
            }, 1000);
        });
        this.socket.emit("close");
    }
}
//# sourceMappingURL=tcpServer.js.map