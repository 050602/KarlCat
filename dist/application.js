"use strict";
/**
 * app class
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
exports.Application = void 0;
const events_1 = require("events");
const path = __importStar(require("path"));
const rpcSocketPool_1 = require("./components/rpcSocketPool");
const LogTS_1 = require("./LogTS");
const appUtil = __importStar(require("./util/appUtil"));
class Application extends events_1.EventEmitter {
    constructor() {
        super();
        this.appName = "hello world"; // App name
        this.hasStarted = false; // Whether has started
        this.main = ""; // Startup file
        this.base = path.dirname(require.main.filename); // Root path
        // routeConfig: string[] = [];                                                              // route.ts
        this.masterConfig = {}; // master.ts
        this.serversConfig = {}; // servers.ts
        // routeConfig2: string[][] = [];                                                           // route.ts  (split)
        // * (只有前端服可调用)
        this.clientNum = 0; // Number of all socket connections
        this.clients = {}; // Sockets that have been binded
        this.settings = {}; // User set，get  
        this.servers = {}; // All user servers that are running
        this.serversNameMap = {}; // All user servers that are running (Dictionary format)
        this.serverInfo = {}; // The configuration of this server
        this.isDaemon = false; // Whether to run in the background
        this.env = ""; // environment
        this.serverName = ""; // Server name id, the unique identifier of the server
        this.serverType = ""; // Server type
        this.frontend = false; // Is it a front-end server
        this.startMode = "all"; // Start Mode:  all / alone
        this.startTime = 0; // Start time
        this.router = {}; // Pre-selection when routing messages to the backend
        this.rpcPool = new rpcSocketPool_1.RpcSocketPool(); // Rpc socket pool
        this.logger = function () { }; // Internal msg log output
        this.msgEncode = null;
        this.msgDecode = null;
        this.protoEncode = null;
        this.protoDecode = null;
        this.someconfig = {}; // Partially open configuration
        this.noRpcMatrix = {}; // The configuration of not establishing a socket connection between servers
        this.frontendServer = null;
        this.backendServer = null;
        this.InstanceMap = new Map();
        appUtil.defaultConfiguration(this);
    }
    /**
     * Start up
     */
    start() {
        if (this.hasStarted) {
            (0, LogTS_1.errLog)("the app has already started");
            return;
        }
        this.hasStarted = true;
        this.startTime = new Date().getTime();
        appUtil.startServer(this);
    }
    setConfig(key, value) {
        this.someconfig[key] = value;
        if (key === "logger") {
            this.logger = value;
        }
        else if (key === "rpc") {
            let noRpcMatrix = value["noRpcMatrix"] || {};
            for (let svrT1 in noRpcMatrix) {
                let arr = noRpcMatrix[svrT1];
                for (let svrT2 of arr) {
                    this.noRpcMatrix[appUtil.getNoRpcKey(svrT1, svrT2)] = true;
                }
            }
        }
    }
    /**
     * Set key-value pairs
     */
    set(key, value) {
        this.settings[key] = value;
        return value;
    }
    /**
     * Get the value corresponding to the key
     */
    get(key) {
        return this.settings[key];
    }
    /**
     * Delete a key-value pair
     */
    delete(key) {
        delete this.settings[key];
    }
    /**
     * Get the server array according to the server type
     */
    getServersByType(serverType) {
        return this.servers[serverType] || [];
    }
    /**
     * Get a server configuration
     */
    getServerById(serverId) {
        return this.serversNameMap[serverId];
    }
    /**
     * * (只有前端服可调用)
     * Routing configuration (deciding which backend to call)
     * @param serverType Back-end server type
     * @param routeFunc Configuration function
     */
    route(serverType, routeFunc) {
        this.router[serverType] = routeFunc;
    }
    /**
     * (只有前端服可调用)
     * get session by uid
     */
    getSession(uid) {
        let client = this.clients[uid];
        if (client) {
            return client.session;
        }
        else {
            return null;
        }
    }
    /**
     * * (只有前端服可调用)
     * get all clients
     */
    getAllClients() {
        return this.clients;
    }
    /**
     * * (只有前端服可调用)
     * 断开所有链接
     */
    killAllClients() {
        for (let uid in this.clients) {
            //PS:这里是我项目用到，尝试发送一下被干掉
            // let msgBuf = this.protoEncode(100, 9, { code: 4}, false);
            // this.clients[uid].send(msgBuf);
            this.clients[uid].close();
        }
    }
    /**
     * 只有前端服可以使用
     * Send a message to the client
     * @param cmd   cmd
     * @param msg   message
     * @param uids  uid array [1,2]
     */
    sendMsgByUid(mainKey, sonKey, msg, uids) {
        if (msg === undefined) {
            msg = null;
        }
        let msgBuf = this.protoEncode(mainKey, sonKey, msg, false);
        let client;
        let i;
        for (i = 0; i < uids.length; i++) {
            if (uids[i] == null) {
                continue;
            }
            client = this.clients[uids[i]];
            if (client) {
                client.send(msgBuf);
            }
        }
    }
    /**
     * * (只有前端服可调用)
     * Send messages to all clients
     * @param cmd cmd
     * @param msg message
     */
    sendAll(mainKey, sonKey, msg) {
        if (msg === undefined) {
            msg = null;
        }
        // logInfo("app sendAll", mainKey, sonKey, this.clients);
        let data = this.protoEncode(mainKey, sonKey, msg, false);
        let uid;
        for (uid in this.clients) {
            this.clients[uid].send(data);
        }
    }
    /**
     * 只有后端服可调用
     * Send a message to the client
     * @param cmd   cmd
     * @param msg   message
     * @param uidsid  uidsid array
     */
    sendMsgByUidSid(mainKey, sonKey, msg, uidsid) {
        if (msg === undefined) {
            msg = null;
        }
        this.backendServer.sendMsgByUidSid(mainKey, sonKey, msg, uidsid);
    }
    /**
     * 只有后端服可调用 发送的消息都是TO C
     * Send a message to the client
     * @param cmd   cmd
     * @param msg   message
     * @param group   { sid : uid[] }
     */
    sendMsgByGroup(mainKey, sonKey, msg, group) {
        if (msg === undefined) {
            msg = null;
        }
        this.backendServer.sendMsgByGroup(mainKey, sonKey, msg, group);
    }
    /**
     * Configure server execution function
     * @param type  Server type:  "all" or "gate|connector" like
     * @param cb    Execution function
     */
    configure(type, cb) {
        if (type === "all") {
            cb.call(this);
            return;
        }
        let ts = type.split("|");
        for (let i = 0; i < ts.length; i++) {
            if (this.serverType === ts[i].trim()) {
                cb.call(this);
                break;
            }
        }
    }
}
exports.Application = Application;
//# sourceMappingURL=application.js.map