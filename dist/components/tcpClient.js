"use strict";
/**
 * tcp client
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
exports.TcpClient = void 0;
const net = __importStar(require("net"));
const events_1 = require("events");
const msgCoder_1 = require("./msgCoder");
class TcpClient extends events_1.EventEmitter {
    constructor(port, host, maxLen, noDelay, connectCb) {
        super();
        this.die = false;
        this.remoteAddress = "";
        this.len = 0;
        this.buffer = null;
        this.headLen = 0;
        this.headBuf = Buffer.alloc(4);
        this.onDataFunc = null;
        this.socket = net.connect(port, host, () => {
            this.remoteAddress = this.socket.remoteAddress;
            connectCb();
        });
        this.socket.setNoDelay(noDelay);
        this.maxLen = maxLen;
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
exports.TcpClient = TcpClient;
//# sourceMappingURL=tcpClient.js.map