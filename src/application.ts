/**
 * app class
 */


import * as path from "path"
import { I_someConfig, loggerType, I_clientSocket, I_connectorConfig, I_encodeDecodeConfig, I_rpcConfig, ServerInfo, loggerLevel } from "./util/interfaceDefine";
import * as appUtil from "./util/appUtil";
import { EventEmitter } from "events";
import { RpcSocketPool } from "./components/rpcSocketPool";
import { FrontendServer } from "./components/frontendServer";
import { BackendServer } from "./components/backendServer";
import { Session } from "./components/session";
import { RpcEvent } from "./event/RpcEvent";
import { errLog, gzaLog } from "./LogTS";

// declare global {
//     interface Rpc {
//     }
// }

export class Application extends EventEmitter {
    appName: string = "hello world";                                                         // App name
    hasStarted: boolean = false;                                                             // Whether has started
    main: string = "";                                                                       // Startup file
    base: string = path.dirname((require.main as any).filename);                             // Root path

    // routeConfig: string[] = [];                                                              // route.ts
    masterConfig: ServerInfo = {} as ServerInfo;                                             // master.ts
    serversConfig: { [serverType: string]: ServerInfo[] } = {};                              // servers.ts
    // routeConfig2: string[][] = [];                                                           // route.ts  (split)

    clientNum: number = 0;                                                                   // Number of all socket connections
    clients: { [uid: number]: I_clientSocket } = {};                                         // Sockets that have been binded
    settings: { [key: string]: any } = {};                                                   // User set，get  

    servers: { [serverType: string]: ServerInfo[] } = {};                                    // All user servers that are running
    serversNameMap: { [serverName: string]: ServerInfo } = {};                               // All user servers that are running (Dictionary format)

    serverInfo: ServerInfo = {} as ServerInfo;                                               // The configuration of this server
    isDaemon: boolean = false;                                                               // Whether to run in the background
    env: string = "";                                                                        // environment
    serverName: string = "";                                                                   // Server name id, the unique identifier of the server
    serverType: string = "";                                                                 // Server type
    frontend: boolean = false;                                                               // Is it a front-end server
    startMode: "all" | "alone" = "all";                                                      // Start Mode:  all / alone
    startTime: number = 0;                                                                   // Start time

    router: { [serverType: string]: (session: Session) => string } = {};                     // Pre-selection when routing messages to the backend
    /**
     * @param serverName 要发往的服务器的名称
     * @param type 如果ServerId === * 时，会把RPC发送给该类型的服务器
     * @param eventName RpcEvent
     * @param args 参数们，此处的参数理应要能被JSON转为字符串
     */
    rpc: (serverName: string, type: string, eventName: RpcEvent, ...args: any[]) => void;// => Rpc = null as any;           
      /**
     * @param serverName 要发往的服务器的名称
     * @param type 如果ServerId === * 时，会报错，await不支持发往多个服务器
     * @param eventName RpcEvent
     * @param args 参数们，此处的参数理应要能被JSON转为字符串
     * @return Promise<any[]>  因为同一个事件可能有多个方法监听，因此最后返回来的值，是一个数组 ，默认取 下标0 即可
     */                                 // Rpc packaging
    rpcAwait: (serverName: string, type: string, eventName: RpcEvent, ...args: any[]) => Promise<any[]>;// => Rpc = null as any;                      // Rpc await packaging
    rpcPool: RpcSocketPool = new RpcSocketPool();                                            // Rpc socket pool

    logger: (type: loggerType, level: loggerLevel, msg: string) => void = function () { };                      // Internal msg log output

    msgEncode: Required<I_encodeDecodeConfig>["msgEncode"] = null as any;
    msgDecode: Required<I_encodeDecodeConfig>["msgDecode"] = null as any;
    protoEncode: Required<I_encodeDecodeConfig>["protoEncode"] = null as any;
    protoDecode: Required<I_encodeDecodeConfig>["protoDecode"] = null as any;

    someconfig: I_someConfig = {} as any;                                                    // Partially open configuration
    noRpcMatrix: { [svrT_svrT: string]: boolean } = {};                                      // The configuration of not establishing a socket connection between servers
    frontendServer: FrontendServer = null as any;
    backendServer: BackendServer = null as any;

    InstanceMap = new Map();

    constructor() {
        super();
        appUtil.defaultConfiguration(this);
    }

    /**
     * Start up
     */
    start() {
        if (this.hasStarted) {
            errLog("the app has already started");
            return;
        }
        this.hasStarted = true;
        this.startTime = new Date().getTime();
        appUtil.startServer(this);
    }


    setConfig(key: keyof I_someConfig, value: any): void {
        this.someconfig[key] = value;
        if (key === "logger") {
            this.logger = value;
        } else if (key === "rpc") {
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
    set(key: string | number, value: any) {
        this.settings[key] = value;
        return value;
    }

    /**
     * Get the value corresponding to the key
     */
    get(key: string | number) {
        return this.settings[key];
    }

    /**
     * Delete a key-value pair
     */
    delete(key: string | number) {
        delete this.settings[key];
    }


    /**
     * Get the server array according to the server type
     */
    getServersByType(serverType: string) {
        return this.servers[serverType] || [];
    }

    /**
     * Get a server configuration
     */
    getServerById(serverId: string) {
        return this.serversNameMap[serverId];
    }

    /**
     * Routing configuration (deciding which backend to call)
     * @param serverType Back-end server type
     * @param routeFunc Configuration function
     */
    route(serverType: string, routeFunc: (session: Session) => string) {
        this.router[serverType] = routeFunc;
    }

    /**
     * get session by uid
     */
    getSession(uid: number) {
        let client = this.clients[uid];
        if (client) {
            return client.session;
        } else {
            return null;
        }
    }

    /**
     * get all clients
     */
    getAllClients() {
        return this.clients;
    }

    public killAllClients() {
        for (let uid in this.clients) {
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
    sendMsgByUid(mainKey: number, sonKey: number, msg: any, uids: number[]) {
        if (msg === undefined) {
            msg = null;
        }

        let msgBuf = this.protoEncode(mainKey, sonKey, msg, false);
        let client: I_clientSocket;
        let i: number;
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
     * Send messages to all clients
     * @param cmd cmd
     * @param msg message
     */
    sendAll(mainKey: number, sonKey: number, msg: any) {
        if (msg === undefined) {
            msg = null;
        }
        // logInfo("app sendAll", mainKey, sonKey, this.clients);
        let data = this.protoEncode(mainKey, sonKey, msg, false);
        let uid: string;
        for (uid in this.clients) {
            this.clients[uid].send(data)
        }
    }

    /**
     * Send a message to the client
     * @param cmd   cmd
     * @param msg   message
     * @param uidsid  uidsid array
     */
    sendMsgByUidSid(mainKey: number, sonKey: number, msg: any, uidsid: { "uid": number, "sid": string }[]) {
        if (msg === undefined) {
            msg = null;
        }

        this.backendServer.sendMsgByUidSid(mainKey, sonKey, msg, uidsid);
    }

    /**
     * Send a message to the client
     * @param cmd   cmd
     * @param msg   message
     * @param group   { sid : uid[] }
     */
    sendMsgByGroup(mainKey: number, sonKey: number, msg: any, group: { [sid: string]: number[] }) {
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
    configure(type: string, cb: Function) {
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
