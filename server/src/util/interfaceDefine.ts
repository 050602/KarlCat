import { EventEmitter } from "events";
import { Application } from "../application";
import { Session } from "../components/session";
import { ServerType } from "../register/route";

/**
 * socket connection proxy
 */
export interface SocketProxy extends EventEmitter {
    socket: any;
    remoteAddress: string;
    remotePort: number;
    die: boolean;
    maxLen: number;
    len: number;
    buffer: Buffer;
    headLen: number;
    headBuf: Buffer;
    close(): void;
    send(data: Buffer): void;
}

/**
 * The monitor receives the new server information format from the master
 */
export interface monitor_get_new_server {
    "T": number;
    "servers": {
        [serverName: string]: ServerInfo
    };
}

/**
 * The monitor receives the removal server information format from the master
 */
export interface monitor_remove_server {
    "T": number;
    "serverName": string;
    "serverType": string;
}

/**
 * The message format when the monitor registers with the master
 */
export interface monitor_reg_master {
    T: number,
    serverToken?: string,
    cliToken?: string,
    serverInfo: ServerInfo
}

/**
 * The session copied from the front end to the back end
 */
export interface sessionCopyJson {
    uid: number;
    sid: string;
    settings: { [key: string]: any };
}

/**
 * Internal frame log level
 */
export const enum loggerLevel {
    info = "info",
    warn = "warn",
    error = "error"
}

/**
 * Internal frame log type
 */
export const enum loggerType {
    frame = "frame",
    msg = "msg",
}



/**
 * rpc message-oriented package
 * 1. If there is cmd and id, it means the message is received and needs to be called back
 * 2. With cmd without id means no need to call back when the message is received
 * 3. If there is an id without cmd, it means it is a callback message
 * 4. len represents the length of the last Buffer parameter
 */
export interface I_rpcMsg {
    cmd?: number | string; //TODO目前只有RPC是纯数字，后续需要把CMD也改成纯数字 DB的必须要有字符串，表名需要
    id?: number;
    type?: number;
}

/**
 * rpc request timeout
 */
export interface I_rpcTimeout {
    id: number;
    cb: Function;
    await: boolean;
    time: number;
}


export interface I_someConfig {
    "rpc": I_rpcConfig,             // rpc configuration
    "connector": I_connectorConfig, // Front-end connector connection server configuration
    "encodeDecode": I_encodeDecodeConfig,   // Codec configuration
    "ssh": string[],                // ssh configuration
    "recognizeToken": { "serverToken": string, "cliToken": string },    // Authentication key
    "logger": (type: loggerType, level: loggerLevel, msg: string) => void,           // Internal log output
    "mydogList": () => { "title": string, "value": string }[],      // Custom monitoring
    "onBeforeExit": (cb: () => void) => void,       // beforeExit notice
    "onMydogSend": (args: string[], cb: (data: any) => void) => void,       // mydog send msg callback
}

/**
 * Connect the user's socket management agent
 */
export interface I_clientManager {
    addClient(client: I_clientSocket): void;
    handleMsg(client: I_clientSocket, msg: Buffer): void;
    removeClient(client: I_clientSocket): void;
}

/**
 * Connection server constructor
 */
export interface I_connectorConstructor {
    new(info: { app: Application, clientManager: I_clientManager, config: I_connectorConfig, startCb: () => void }): void;
}

/**
 * Socket for each user
 */
export interface I_clientSocket {
    session: Session;
    remoteAddress: string;
    remotePort: number;
    send(msg: Buffer): void;
    close(): void;
}



/**
 * connector configuration
 */
export interface I_connectorConfig {
    /**
     * 通信协议
     * custom connector class (default tcp)
     */
    "connector"?: I_connectorConstructor,
    /**
     * 心跳发送间隔 秒
     * heartbeat (seconds, default none)
     */
    "heartbeat"?: number,
    /**
     * 最大连接数
     * maximum number of connections (no upper limit by default)
     */
    "maxConnectionNum"?: number,
    /**
     * maximum message packet length (default 10 MB)
     */
    "maxLen"?: number
    /**
     * whether to enable Nagle algorithm (not enabled by default)
     */
    "noDelay"?: boolean,
    /**
     * 消息发出间隔，毫秒 默认10
     * message sending frequency (ms, more than 10 is enabled, the default is to send immediately)
     */
    "interval"?: number,
    /**
     * 客户端连接到服务器时的回调方法
     * client connection notification
     */
    "clientOnCb"?: (session: Session) => void,
    /**
     *  客户端断开与服务器连接的回调方法
     * client leaving notification
     */
    "clientOffCb"?: (session: Session) => void,
    /**
     * message filtering. Return true, the message will be discarded.
     */
    "cmdFilter"?: (session: Session, cmd: number) => boolean,

    [key: string]: any,
}


/**
 * codec configuration
 */
export interface I_encodeDecodeConfig {
    /**
     * protocol encoding
     */
    "protoEncode"?: (cmd: number, msg: any) => Buffer,
    /**
     * message encoding
     */
    "msgEncode"?: (cmd: number, msg: any) => Uint8Array,
    /**
     * protocol decoding
     */
    "protoDecode"?: (data: Buffer) => { cmd: number, "msg": Buffer },
    /**
     * message decoding
     */
    "msgDecode"?: (cmd: number, msg: Buffer) => any,
}


/**
 * rpc configuration
 */
export interface I_rpcConfig {
    /**
     * rpc超时时间，秒，默认10秒
     * timeout (seconds, use more than 5, default 10)
     */
    "timeout"?: number,
    /**
     * 最大RPC数据长度 默认10MB
     * maximum message packet length (default 10 MB)
     */
    "maxLen"?: number,
    /**
     * 发送消息的频率，毫秒，默认十毫秒
     * message sending frequency (ms, more than 10 is enabled, the default is to send immediately)
     */
    "interval"?: number | { "default": number, [serverType: string]: number }
    /**
     * whether to enable Nagle algorithm (not enabled by default)
     */
    "noDelay"?: boolean,
    /**
     * 心跳时间，秒，默认5秒
     * heartbeat (seconds, use more than 5, default 60)
     */
    "heartbeat"?: number,
    /**
     * 重连间隔，默认2秒
     * reconnection interval (seconds, default 2)
     */
    "reconnectDelay"?: number,
    /**
    * matrix without socket connection
    */
    "noRpcMatrix"?: { [serverType: string]: string[] },
    /**
     * Rpc message cache count. The default is 5000.
     */
    "rpcMsgCacheCount"?: number,
    /**
     * message cache max length when interval is on. The default is +Infinity.
     */
    "intervalCacheLen"?: number,
}


/**
 * server information
 */
export interface ServerInfo {
    //数字ID    形如 1
    readonly serverId: number;
    /**
     * ServerName 即服务器唯一名称 形如 gate-1
     */
    readonly serverName: string;
    /**
     * host
     */
    readonly host: string;
    /**
     * port
     */
    readonly port: number;
    /**
     * Is it a frontend server
     */
    readonly frontend: boolean;
    /**
     * clientPort
     */
    readonly clientPort: number;
    /**
     * Server type [Note: Assigned by the framework]  服务器类型  Gate  Logic之类
     */
    readonly serverType: ServerType;

    [key: string]: any;

    /**
    * 消息发送到的Gate
    */
    readonly toGate: string;
}

/**
 * 日志备份信息
 */
export interface LogBackupInfo {
    /**
     * 目标IP及帐号信息
     */
    readonly destIPInfo: string;

    /**
     * 备份的源路径信息
     */
    readonly sourceDir: string;

    /**
     * 备份的机器密码文件路径
     */
    readonly passwordFilePath: number;
}

/**
 * 有多个大区再做调整
 */
export interface ServerConfig {
    //大区ID
    readonly zoneid: number;

    /**
     * mongodb_connectstring  连接数据库的字符串
     */
    readonly mongodb_connectstring: string;

    // 主服务器配置
    readonly masterConfig: ServerInfo;

    // 服务器信息
    readonly serverinfos: ServerTypeInfo[];

    // 日志备份配置
    readonly logbackupinfo: LogBackupInfo;

    //接收后台数据的监听端口
    readonly backgroundPort: number;

}

/**
 * 服务器类型信息
 */
export interface ServerTypeInfo {
    // 服务器类型
    readonly serverType: string;

    // 服务器基本信息
    readonly singleTypeServers: ServerInfo[];
}

/**
 * DB数据恢复时间依据
 */
export interface DBTableInitTime {
    // 表名
    tbName: string;

    // 初始化时间
    initTime: number;
}

/**
 * DB容灾的单条信息
 */
export interface DBRecoverWriteInfo {
    // 表名
    tbName: string;

    // 操作类型
    opType: string;

    // 序号
    seq: number;

    // 压入时间
    pushTime: number;

    // 操作条件
    key: any;

    // 操作的数据
    value: any;
}

/**
 * DB容灾的单条数据信息
 */
export interface DBRecoverWriteFinishInfo {
    // 表名
    tbName: string;

    // 操作类型
    opType: string;

    // 序号
    seq: number;

    // 压入时间
    pushTime: number;
}

/**
 * rpc call, internal error code
 */
export const enum rpcErr {
    /**
     * no err
     */
    ok = 0,
    /**
     * no target server
     */
    noServer = 1,
    /**
     * rpc timeout
     */
    timeout = 2
}
