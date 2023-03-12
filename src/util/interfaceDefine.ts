import { EventEmitter } from "events";
import { Application } from "../application";
import { Session } from "../components/session";
import { ServerName } from "../serverConfig/route";

/**
 * socket connection proxy
 */
export interface SocketProxy extends EventEmitter {
    socket: any;
    remoteAddress: string;
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
    cmd?: string;
    id?: number;
    len?: number;
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
    send(msg: Buffer): void;
    close(): void;
}



/**
 * connector configuration
 */
export interface I_connectorConfig {
    /**
     * custom connector class (default tcp)
     */
    "connector"?: I_connectorConstructor,
    /**
     * heartbeat (seconds, default none)
     */
    "heartbeat"?: number,
    /**
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
     * message sending frequency (ms, more than 10 is enabled, the default is to send immediately)
     */
    "interval"?: number,
    /**
     * client connection notification
     */
    "clientOnCb"?: (session: Session) => void,
    /**
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
    "protoEncode"?: (mainKey: number, sonKey: number, msg: any, toS: boolean) => Buffer,
    /**
     * message encoding
     */
    "msgEncode"?: (mainKey: number, sonKey: number, msg: any, toS: boolean) => Uint8Array,
    /**
     * protocol decoding
     */
    "protoDecode"?: (data: Buffer) => { mainKey: number, sonKey: number, "msg": Buffer, toS: boolean },
    /**
     * message decoding
     */
    "msgDecode"?: (mainKey: number, sonKey: number, msg: Buffer, toS: boolean) => any,
}


/**
 * rpc configuration
 */
export interface I_rpcConfig {
    /**
     * timeout (seconds, use more than 5, default 10)
     */
    "timeout"?: number,
    /**
     * maximum message packet length (default 10 MB)
     */
    "maxLen"?: number,
    /**
     * message sending frequency (ms, more than 10 is enabled, the default is to send immediately)
     */
    "interval"?: number | { "default": number, [serverType: string]: number }
    /**
     * whether to enable Nagle algorithm (not enabled by default)
     */
    "noDelay"?: boolean,
    /**
     * heartbeat (seconds, use more than 5, default 60)
     */
    "heartbeat"?: number,
    /**
     * reconnection interval (seconds, default 2)
     */
    "reconnectDelay"?: number,
    /**
     * matrix without socket connection
     */
    "noRpcMatrix"?: { [serverType: string]: string[] },
    /**
    * Message cache length. The default is 5000.
    */
    "msgCacheLength"?: number,
}


/**
 * server information
 */
export interface ServerInfo {
    //数字ID
    readonly serverId: number;
    /**
     * Server id 即服务器唯一名称
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
    readonly serverType: ServerName;

    [key: string]: any;
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