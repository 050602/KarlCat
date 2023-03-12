"use strict";
/**
 * After the non-master server is started, it connects to the master server, knows each other, and processes related logic
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
exports.monitor_client_proxy = exports.start = void 0;
const cliUtil_1 = require("./cliUtil");
const tcpClient_1 = require("./tcpClient");
const define = require("../util/define");
const msgCoder_1 = require("./msgCoder");
const rpcClient = __importStar(require("./rpcClient"));
const LogTS_1 = require("../LogTS");
const TSEventCenter_1 = require("../utils/TSEventCenter");
const FrameEvent_1 = require("../event/FrameEvent");
const BSON = require('bson');
const Long = BSON.Long;
let serverIdsArr = [];
let hasStartAll = false;
function start(_app) {
    new monitor_client_proxy(_app);
}
exports.start = start;
class monitor_client_proxy {
    constructor(app) {
        this.socket = null;
        this.heartbeatTimer = null;
        this.heartbeatTimeoutTimer = null;
        this.removeDiffServers = {}; // After the monitor is reconnected, the server set to be compared and removed
        this.needDiff = false; // whether need to compare
        this.diffTimer = null; // diff timeout
        this.app = app;
        this.monitorCli = new cliUtil_1.MonitorCli(app);
        this.doConnect(0);
        let serversConfig = app.serversConfig;
        for (let x in serversConfig) {
            let arr = serversConfig[x];
            for (let one of arr) {
                serverIdsArr.push(one.serverName);
            }
        }
        removeFromArr(serverIdsArr, app.serverName);
    }
    /**
     * Connect master
     */
    doConnect(delay) {
        let self = this;
        setTimeout(function () {
            let connectCb = function () {
                self.app.logger("frame" /* loggerType.frame */, "info" /* loggerLevel.info */, "monitor -> connected to master success");
                // Register with the master
                self.register();
                // Heartbeat package
                self.heartbeat();
                ;
            };
            self.app.logger("frame" /* loggerType.frame */, "info" /* loggerLevel.info */, "monitor -> try to connect to master now");
            self.socket = new tcpClient_1.TcpClient(self.app.masterConfig.port, self.app.masterConfig.host, define.some_config.SocketBufferMaxLen, false, connectCb);
            self.socket.on("data", self.onData.bind(self));
            self.socket.on("close", self.onClose.bind(self));
        }, delay);
    }
    /**
     * register
     */
    register() {
        let tokenConfig = this.app.someconfig.recognizeToken || {};
        let serverToken = tokenConfig["serverToken"] || define.some_config.Server_Token;
        let loginInfo = {
            T: 1 /* define.Monitor_To_Master.register */,
            serverInfo: this.app.serverInfo,
            serverToken: serverToken
        };
        this.send(loginInfo);
    }
    /**
     * Received the msg
     */
    onData(_data) {
        try {
            let data = BSON.deserialize(_data);
            if (data.T === 1 /* define.Master_To_Monitor.addServer */) {
                this.addServer(data.servers);
            }
            else if (data.T === 2 /* define.Master_To_Monitor.removeServer */) {
                this.removeServer(data);
            }
            else if (data.T === 3 /* define.Master_To_Monitor.cliMsg */) {
                this.monitorCli.deal_master_msg(this, data);
            }
            else if (data.T === 4 /* define.Master_To_Monitor.heartbeatResponse */) {
                clearTimeout(this.heartbeatTimeoutTimer);
                this.heartbeatTimeoutTimer = null;
            }
        }
        catch (e) {
            // this.app.logger(loggerType.msg.error, e);
            (0, LogTS_1.errLog)("onData error", e);
        }
    }
    /**
     * closed
     */
    onClose() {
        this.app.logger("frame" /* loggerType.frame */, "error" /* loggerLevel.error */, "monitor -> socket closed, try to reconnect master later");
        this.needDiff = true;
        this.removeDiffServers = {};
        clearTimeout(this.diffTimer);
        clearTimeout(this.heartbeatTimer);
        clearTimeout(this.heartbeatTimeoutTimer);
        this.heartbeatTimeoutTimer = null;
        this.doConnect(define.some_config.Time.Monitor_Reconnect_Time * 1000);
    }
    /**
     * Send heartbeat
     */
    heartbeat() {
        let timeDelay = define.some_config.Time.Monitor_Heart_Beat_Time * 1000 - 5000 + Math.floor(5000 * Math.random());
        this.heartbeatTimer = setTimeout(() => {
            let heartbeatMsg = { "T": 2 /* define.Monitor_To_Master.heartbeat */ };
            this.send(heartbeatMsg);
            this.heartbeatTimeout();
            this.heartbeatTimer.refresh();
        }, timeDelay);
    }
    /**
     * Heartbeat timeout
     */
    heartbeatTimeout() {
        if (this.heartbeatTimeoutTimer !== null) {
            return;
        }
        let self = this;
        this.heartbeatTimeoutTimer = setTimeout(function () {
            self.app.logger("frame" /* loggerType.frame */, "error" /* loggerLevel.error */, "monitor -> heartbeat timeout, close the socket");
            self.socket.close();
        }, define.some_config.Time.Monitor_Heart_Beat_Timeout_Time * 1000);
    }
    /**
     * Send message (not buffer)
     */
    send(msg) {
        this.socket.send((0, msgCoder_1.encodeInnerData)(msg));
    }
    /**
     * Add server
     */
    addServer(servers) {
        if (this.needDiff) {
            this.diffTimerStart();
        }
        let serversApp = this.app.servers;
        let serversIdMap = this.app.serversNameMap;
        let serverInfo;
        for (let sid in servers) {
            serverInfo = servers[sid];
            if (this.needDiff) {
                this.addOrRemoveDiffServer(serverInfo.serverName, true, serverInfo.serverType);
            }
            let tmpServer = serversIdMap[serverInfo.serverName];
            if (tmpServer && tmpServer.host === serverInfo.host && tmpServer.port === serverInfo.port) { // If it already exists and the ip configuration is the same, ignore it (other configurations are not considered, please guarantee by the developer)
                continue;
            }
            if (!serversApp[serverInfo.serverType]) {
                serversApp[serverInfo.serverType] = [];
            }
            if (!!tmpServer) {
                for (let i = serversApp[serverInfo.serverType].length - 1; i >= 0; i--) {
                    if (serversApp[serverInfo.serverType][i].serverName === tmpServer.serverName) {
                        serversApp[serverInfo.serverType].splice(i, 1);
                        rpcClient.removeSocket(tmpServer.serverName);
                        this.emitRemoveServer(tmpServer);
                        break;
                    }
                }
            }
            serversApp[serverInfo.serverType].push(serverInfo);
            serversIdMap[serverInfo.serverName] = serverInfo;
            this.emitAddServer(serverInfo);
            rpcClient.ifCreateRpcClient(this.app, serverInfo);
        }
    }
    /**
     * Remove server
     */
    removeServer(msg) {
        if (this.needDiff) {
            this.diffTimerStart();
            this.addOrRemoveDiffServer(msg.serverName, false);
        }
        delete this.app.serversNameMap[msg.serverName];
        let serversApp = this.app.servers;
        if (serversApp[msg.serverType]) {
            for (let i = 0; i < serversApp[msg.serverType].length; i++) {
                if (serversApp[msg.serverType][i].serverName === msg.serverName) {
                    let tmpInfo = serversApp[msg.serverType][i];
                    serversApp[msg.serverType].splice(i, 1);
                    rpcClient.removeSocket(msg.serverName);
                    this.emitRemoveServer(tmpInfo);
                    break;
                }
            }
        }
    }
    addOrRemoveDiffServer(sid, add, serverType) {
        if (add) {
            this.removeDiffServers[sid] = serverType;
        }
        else {
            delete this.removeDiffServers[sid];
        }
    }
    diffTimerStart() {
        clearTimeout(this.diffTimer);
        let self = this;
        this.diffTimer = setTimeout(function () {
            self.diffFunc();
        }, 5000); // Compare after 5 seconds
    }
    /**
     * 比对原因：与master断开连接期间，如果另一台逻辑服挂了，本服不能断定该服是否移除，
     * 因为添加和删除统一由master通知，所以与master断开期间，不可更改与其他服的关系，
     * 待本服重新连接上master后，通过比对，移除无效服务器
     *
     * (Reason for comparison: During the disconnection from the master, if another logical server hangs up,
     * the server cannot determine whether the server will be removed, because the addition and deletion are uniformly notified by the master,
     *  so during the disconnection from the master, it cannot be changed. Server relationship,
     * after the server reconnects to the master, through the comparison, remove the invalid server)
     */
    diffFunc() {
        this.needDiff = false;
        let servers = this.app.servers;
        for (let serverType in servers) {
            for (let i = servers[serverType].length - 1; i >= 0; i--) {
                let id = servers[serverType][i].serverName;
                if (id === this.app.serverName) {
                    continue;
                }
                if (!this.removeDiffServers[id]) {
                    let tmpInfo = this.app.serversNameMap[id];
                    delete this.app.serversNameMap[id];
                    servers[serverType].splice(i, 1);
                    rpcClient.removeSocket(id);
                    this.emitRemoveServer(tmpInfo);
                }
            }
        }
        this.removeDiffServers = {};
    }
    /**
     * Launch add server event
     */
    emitAddServer(serverInfo) {
        process.nextTick(() => {
            // this.app.emit("onAddServer", serverInfo);
            TSEventCenter_1.TSEventCenter.Instance.event(FrameEvent_1.FrameEvent.onAddServer, serverInfo);
        });
        if (!hasStartAll) {
            removeFromArr(serverIdsArr, serverInfo.serverName);
            if (serverIdsArr.length === 0) {
                hasStartAll = true;
                process.nextTick(() => {
                    // this.app.emit("onStartAll");
                    TSEventCenter_1.TSEventCenter.Instance.event(FrameEvent_1.FrameEvent.onStartAll);
                });
            }
        }
    }
    /**
     * Launch remove server event
     */
    emitRemoveServer(serverInfo) {
        process.nextTick(() => {
            // this.app.emit("onRemoveServer", serverInfo);
            TSEventCenter_1.TSEventCenter.Instance.event(FrameEvent_1.FrameEvent.onRemoveServer, serverInfo);
        });
    }
}
exports.monitor_client_proxy = monitor_client_proxy;
function removeFromArr(arr, one) {
    let index = arr.indexOf(one);
    if (index !== -1) {
        arr.splice(index, 1);
    }
}
//# sourceMappingURL=monitor.js.map