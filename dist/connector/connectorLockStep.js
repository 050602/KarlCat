"use strict";
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
exports.ConnectorLockStep = void 0;
const crypto = __importStar(require("crypto"));
const servers_1 = require("../serverConfig/servers");
const connectorKcp_1 = require("./connectorKcp");
/**
 * connector lockstep
 */
class ConnectorLockStep {
    constructor(info) {
        this.clientManager = null;
        this.handshakeBufAll = null; // Handshake buffer all
        this.heartbeatTime = 0; // Heartbeat time
        this.maxConnectionNum = Number.POSITIVE_INFINITY;
        this.nowConnectionNum = 0;
        this.sendCache = false;
        this.interval = 0;
        this.md5 = ""; // route array md5
        this.maxLen = 0;
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
        let cipher = crypto.createHash("md5");
        this.md5 = cipher.update(JSON.stringify(servers_1.serversConfig)).digest("hex");
        let routeBuf = Buffer.from(JSON.stringify({ "md5": this.md5, "heartbeat": this.heartbeatTime * 0.001 }));
        this.handshakeBuf = Buffer.alloc(routeBuf.length + 1);
        this.handshakeBuf.writeUInt8(2 /* Server_To_Client.handshake */, 0);
        routeBuf.copy(this.handshakeBuf, 1);
        let routeBufAll = Buffer.from(JSON.stringify({ "md5": this.md5, "route": servers_1.serversConfig, "heartbeat": this.heartbeatTime * 0.001 }));
        this.handshakeBufAll = Buffer.alloc(routeBufAll.length + 1);
        this.handshakeBufAll.writeUInt8(2 /* Server_To_Client.handshake */, 0);
        routeBufAll.copy(this.handshakeBufAll, 1);
        // Heartbeat response buffer
        this.heartbeatBuf = Buffer.alloc(1);
        this.heartbeatBuf.writeUInt8(3 /* Server_To_Client.heartbeatResponse */, 0);
        // be closed buffer
        this.beClosedBuf = Buffer.alloc(1);
        this.beClosedBuf.writeUInt8(4 /* Server_To_Client.beClosed */, 0);
        // wsServer(info.app.serverInfo.clientPort, connectorConfig, () => {
        // kcpServer(info.app.serverInfo.clientPort, connectorConfig, this, () => {
        //     info.startCb();
        // });
        // }, this.newClientCb);
        (0, connectorKcp_1.kcpServer)(info.app.serverInfo.clientPort, connectorConfig, this, () => {
            info.startCb();
        });
    }
}
exports.ConnectorLockStep = ConnectorLockStep;
//# sourceMappingURL=connectorLockStep.js.map