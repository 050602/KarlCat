"use strict";
/**
 * The master central server, accepts the monitor connection, is responsible for the mutual understanding between the servers, and accepts cli commands
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Master_ClientProxy = exports.Master_ServerProxy = exports.start = void 0;
const cliUtil_1 = require("./cliUtil");
const tcpServer_1 = __importDefault(require("./tcpServer"));
const starter_1 = require("../util/starter");
const define = require("../util/define");
const msgCoder = __importStar(require("./msgCoder"));
const LogTS_1 = require("../LogTS");
const BSON = require('bson');
const Long = BSON.Long;
let servers = {};
let serversDataTmp = { "T": 1 /* define.Master_To_Monitor.addServer */, "servers": {} };
let masterCli;
let app;
function start(_app, cb) {
    app = _app;
    masterCli = new cliUtil_1.MasterCli(_app, servers);
    startServer(cb);
}
exports.start = start;
function startServer(cb) {
    (0, tcpServer_1.default)(app.serverInfo.port, false, startCb, newClientCb);
    function startCb() {
        let str = `listening at [${app.serverInfo.host}:${app.serverInfo.port}]  ${app.serverName}`;
        (0, LogTS_1.logInfo)(str);
        app.logger("frame" /* loggerType.frame */, "info" /* loggerLevel.info */, str);
        cb && cb();
        if (app.startMode === "all") {
            (0, starter_1.runServers)(app);
        }
    }
    function newClientCb(socket) {
        new UnregSocket_proxy(socket);
    }
}
/**
 * Unregistered socket proxy
 */
class UnregSocket_proxy {
    constructor(socket) {
        this.registerTimer = null;
        this.socket = socket;
        this.onDataFunc = this.onData.bind(this);
        this.onCloseFunc = this.onClose.bind(this);
        socket.on("data", this.onDataFunc);
        socket.on("close", this.onCloseFunc);
        this.registerTimeout();
    }
    registerTimeout() {
        let self = this;
        this.registerTimer = setTimeout(function () {
            app.logger("frame" /* loggerType.frame */, "error" /* loggerLevel.error */, `master -> register timeout, close it, ${self.socket.remoteAddress}`);
            self.socket.close();
        }, 5000);
    }
    onData(_data) {
        let socket = this.socket;
        let data;
        try {
            data = BSON.deserialize(_data);
        }
        catch (err) {
            app.logger("frame" /* loggerType.frame */, "error" /* loggerLevel.error */, `master -> unregistered socket, JSON parse error, close it, ${socket.remoteAddress}`);
            socket.close();
            return;
        }
        // The first packet must be registered
        if (!data || data.T !== 1 /* define.Monitor_To_Master.register */) {
            app.logger("frame" /* loggerType.frame */, "error" /* loggerLevel.error */, `master -> unregistered socket, illegal data, close it, ${socket.remoteAddress}`);
            socket.close();
            return;
        }
        // Is it a server?
        if (data.serverToken) {
            let tokenConfig = app.someconfig.recognizeToken || {};
            let serverToken = tokenConfig["serverToken"] || define.some_config.Server_Token;
            if (data.serverToken !== serverToken) {
                app.logger("frame" /* loggerType.frame */, "error" /* loggerLevel.error */, `master -> illegal serverToken, close it, ${socket.remoteAddress}`);
                socket.close();
                return;
            }
            if (!data.serverInfo || !data.serverInfo.serverName || !data.serverInfo.host || !data.serverInfo.port || !data.serverInfo.serverType) {
                app.logger("frame" /* loggerType.frame */, "error" /* loggerLevel.error */, `master -> illegal serverInfo, close it, ${socket.remoteAddress}`);
                socket.close();
                return;
            }
            this.registerOk();
            new Master_ServerProxy(data, socket);
            return;
        }
        // Is it a cli？
        if (data.cliToken) {
            let tokenConfig = app.someconfig.recognizeToken || {};
            let cliToken = tokenConfig["cliToken"] || define.some_config.Cli_Token;
            if (data.cliToken !== cliToken) {
                app.logger("frame" /* loggerType.frame */, "error" /* loggerLevel.error */, `master -> illegal cliToken, close it, ${socket.remoteAddress}`);
                socket.close();
                return;
            }
            this.registerOk();
            new Master_ClientProxy(socket);
            return;
        }
        app.logger("frame" /* loggerType.frame */, "error" /* loggerLevel.error */, `master -> illegal socket, close it, ${socket.remoteAddress}`);
        socket.close();
    }
    onClose() {
        clearTimeout(this.registerTimer);
        app.logger("frame" /* loggerType.frame */, "error" /* loggerLevel.error */, `master -> unregistered socket closed, ${this.socket.remoteAddress}`);
    }
    registerOk() {
        clearTimeout(this.registerTimer);
        this.socket.removeListener("data", this.onDataFunc);
        this.socket.removeListener("close", this.onCloseFunc);
        this.socket = null;
    }
}
/**
 * master processing server agent
 */
class Master_ServerProxy {
    constructor(data, socket) {
        this.sid = "";
        this.serverType = "";
        this.heartbeatTimeoutTimer = null;
        this.socket = socket;
        this.init(data);
    }
    init(data) {
        let socket = this.socket;
        if (!!servers[data.serverInfo.serverName]) {
            app.logger("frame" /* loggerType.frame */, "error" /* loggerLevel.error */, `master -> already has a monitor named: ${data.serverInfo.serverName}, close it, ${socket.remoteAddress}`);
            socket.close();
            return;
        }
        socket.maxLen = define.some_config.SocketBufferMaxLen;
        this.heartbeatTimeout();
        socket.on('data', this.onData.bind(this));
        socket.on('close', this.onClose.bind(this));
        this.sid = data.serverInfo.serverName;
        this.serverType = data.serverInfo.serverType;
        // Construct a new server message
        let socketInfo = {
            "T": 1 /* define.Master_To_Monitor.addServer */,
            "servers": {}
        };
        socketInfo.servers[this.sid] = data.serverInfo;
        let socketInfoBuf = msgCoder.encodeInnerData(socketInfo);
        // Notify other servers that there are new servers
        for (let sid in servers) {
            servers[sid].socket.send(socketInfoBuf);
        }
        // Notify the newly added server, which servers are currently available
        let result = msgCoder.encodeInnerData(serversDataTmp);
        this.socket.send(result);
        servers[this.sid] = this;
        serversDataTmp.servers[this.sid] = data.serverInfo;
        app.logger("frame" /* loggerType.frame */, "info" /* loggerLevel.info */, `master -> get a new monitor named: ${this.sid}, ${this.socket.remoteAddress}`);
    }
    heartbeatTimeout() {
        this.heartbeatTimeoutTimer = setTimeout(() => {
            app.logger("frame" /* loggerType.frame */, "error" /* loggerLevel.error */, `master -> heartbeat timeout, close the monitor named: ${this.sid}, ${this.socket.remoteAddress}`);
            this.socket.close();
        }, define.some_config.Time.Monitor_Heart_Beat_Time * 1000 * 2);
    }
    send(msg) {
        this.socket.send(msgCoder.encodeInnerData(msg));
    }
    heartbeatResponse() {
        let msg = { T: 4 /* define.Master_To_Monitor.heartbeatResponse */ };
        let buf = msgCoder.encodeInnerData(msg);
        this.socket.send(buf);
    }
    onData(_data) {
        let data;
        try {
            data = BSON.deserialize(_data);
        }
        catch (err) {
            app.logger("frame" /* loggerType.frame */, "error" /* loggerLevel.error */, `master -> JSON parse error，close the monitor named: ${this.sid}, ${this.socket.remoteAddress}`);
            this.socket.close();
            return;
        }
        try {
            if (data.T === 2 /* define.Monitor_To_Master.heartbeat */) {
                this.heartbeatTimeoutTimer.refresh();
                this.heartbeatResponse();
            }
            else if (data.T === 3 /* define.Monitor_To_Master.cliMsg */) {
                masterCli.deal_monitor_msg(data);
            }
        }
        catch (err) {
            app.logger("frame" /* loggerType.frame */, "error" /* loggerLevel.error */, `master -> handle msg error, close it: ${this.sid}, ${this.socket.remoteAddress}\n${err.stack}`);
            this.socket.close();
        }
    }
    onClose() {
        clearTimeout(this.heartbeatTimeoutTimer);
        delete servers[this.sid];
        delete serversDataTmp.servers[this.sid];
        let serverInfo = {
            "T": 2 /* define.Master_To_Monitor.removeServer */,
            "serverName": this.sid,
            "serverType": this.serverType
        };
        let serverInfoBuf = msgCoder.encodeInnerData(serverInfo);
        for (let sid in servers) {
            servers[sid].socket.send(serverInfoBuf);
        }
        app.logger("frame" /* loggerType.frame */, "error" /* loggerLevel.error */, `master -> a monitor disconnected: ${this.sid}, ${this.socket.remoteAddress}`);
    }
}
exports.Master_ServerProxy = Master_ServerProxy;
/**
 * master handles cli agent
 */
class Master_ClientProxy {
    constructor(socket) {
        this.heartbeatTimeoutTimer = null;
        this.socket = socket;
        this.init();
    }
    init() {
        let socket = this.socket;
        socket.maxLen = define.some_config.SocketBufferMaxLen;
        this.heartbeatTimeOut();
        socket.on('data', this.onData.bind(this));
        socket.on('close', this.onClose.bind(this));
        app.logger("frame" /* loggerType.frame */, "info" /* loggerLevel.info */, `master -> get a new cli: ${socket.remoteAddress}`);
    }
    heartbeatTimeOut() {
        this.heartbeatTimeoutTimer = setTimeout(() => {
            app.logger("frame" /* loggerType.frame */, "error" /* loggerLevel.error */, `master -> heartbeat timeout, close the cli: ${this.socket.remoteAddress}`);
            this.socket.close();
        }, define.some_config.Time.Monitor_Heart_Beat_Time * 1000 * 2);
    }
    onData(_data) {
        let data;
        try {
            data = BSON.deserialize(_data);
        }
        catch (err) {
            app.logger("frame" /* loggerType.frame */, "error" /* loggerLevel.error */, `master -> JSON parse error，close the cli: ${this.socket.remoteAddress}`);
            this.socket.close();
            return;
        }
        try {
            if (data.T === 2 /* define.Cli_To_Master.heartbeat */) {
                this.heartbeatTimeoutTimer.refresh();
            }
            else if (data.T === 3 /* define.Cli_To_Master.cliMsg */) {
                app.logger("frame" /* loggerType.frame */, "info" /* loggerLevel.info */, `master -> master get command from the cli: ${this.socket.remoteAddress} ==> ${BSON.serialize(data)}`);
                masterCli.deal_cli_msg(this, data);
            }
            else {
                app.logger("frame" /* loggerType.frame */, "error" /* loggerLevel.error */, `master -> the cli illegal data type close it: ${this.socket.remoteAddress}`);
                this.socket.close();
            }
        }
        catch (e) {
            app.logger("frame" /* loggerType.frame */, "error" /* loggerLevel.error */, `master -> cli handle msg err, close it: ${this.socket.remoteAddress}\n ${e.stack}`);
            this.socket.close();
        }
    }
    send(msg) {
        this.socket.send(msgCoder.encodeInnerData(msg));
    }
    onClose() {
        clearTimeout(this.heartbeatTimeoutTimer);
        app.logger("frame" /* loggerType.frame */, "info" /* loggerLevel.info */, `master -> a cli disconnected: ${this.socket.remoteAddress}`);
    }
}
exports.Master_ClientProxy = Master_ClientProxy;
//# sourceMappingURL=master.js.map