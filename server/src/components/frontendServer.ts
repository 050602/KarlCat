
import { isDebug } from "../app";
import { Application } from "../application";
import * as protocol from "../connector/protocol";
import { ServerType, getServerTypeByMainKey } from "../register/route";
import { I_clientManager, I_clientSocket, I_connectorConstructor, I_encodeDecodeConfig, loggerLevel, loggerType, sessionCopyJson } from "../util/interfaceDefine";
import { Session, initSessionApp } from "./session";
import define = require("../util/define");
const BSON = require('bson');
const Long = BSON.Long;


export class FrontendServer {
    private app: Application;
    private clientManager: ClientManager;
    constructor(app: Application) {
        this.app = app;
        initSessionApp(this.app);

        let defaultEncodeDecode: Required<I_encodeDecodeConfig> = protocol.default_encodeDecode;

        // protocol.init(this.app);
        defaultEncodeDecode = protocol.default_encodeDecode;

        let encodeDecodeConfig = this.app.someconfig.encodeDecode || {};
        this.app.protoEncode = encodeDecodeConfig.protoEncode || defaultEncodeDecode.protoEncode;
        this.app.msgEncode = encodeDecodeConfig.msgEncode || defaultEncodeDecode.msgEncode;
        this.app.protoDecode = encodeDecodeConfig.protoDecode || defaultEncodeDecode.protoDecode;
        this.app.msgDecode = encodeDecodeConfig.msgDecode || defaultEncodeDecode.msgDecode;

        this.clientManager = new ClientManager(app);
    }

    start(cb: Function) {
        let self = this;
        let startCb = function () {
            let str = `listening at [${self.app.serverInfo.host}:${self.app.serverInfo.clientPort}]  ${self.app.serverName} (clientPort)`;
            console.log(str);
            self.app.logger(loggerType.frame, loggerLevel.info, str);
            cb && cb();
        };

        let mydog = require("../mydog");
        let connectorConfig = this.app.someconfig.connector || {};
        let connectorConstructor: I_connectorConstructor = connectorConfig.connector || mydog.connector.Tcp;
        new connectorConstructor({
            "app": this.app,
            "clientManager": this.clientManager,
            "config": this.app.someconfig.connector,
            "startCb": startCb
        });
    }

    /**
     * Sync session
     */
    applySession(data: Buffer) {
        let session = BSON.deserialize(data.subarray(1)) as sessionCopyJson;
        let client = this.app.clients[session.uid];
        if (client) {
            client.session.applySession(session.settings);
        }
    }
    /**
     * The front-end server forwards the message of the back-end server to the client
     */
    sendMsgByUids(data: Buffer) {
        let uidsLen = data.readUInt16BE(1);
        let msgBuf = data.subarray(3 + uidsLen * 8);
        let clients = this.app.clients;
        let client: I_clientSocket;
        let i: number;


        // gzaLog("sendMsgByUids", uidsLen, this.app.clientNum, clients, this.app.serverName);
        for (i = 0; i < uidsLen; i++) {
            let socketId = data.readBigUint64BE(3 + i * 8);

            // let socketId2 = Number(socketId);
            client = clients[Number(socketId)];
            // if (isStressTesting) {
            //     let data = this.app.protoDecode(msgBuf);
            //     TSEventCenter.Instance.event(KarlCatEvent.OnUnitTestProto + data.mainKey + "_" + data.sonKey, data.msg);
            // }

            if (client) {
                client.send(msgBuf);
            }
        }
    }

}

function clientOnOffCb() {

}

class ClientManager implements I_clientManager {
    private app: Application;
    private serverType: string = "";
    private router: { [serverType: string]: (session: Session) => string };
    private clientOnCb: (session: Session) => void = null as any;
    private clientOffCb: (session: Session) => void = null as any;
    private cmdFilter: (session: Session, mainKey: number, sonKey: number) => boolean = null as any;
    private proto100Time: Map<string, number>;//key roleUid  value上一个10秒的时间戳
    private proto100Count: Map<string, number>;//key roleUid  value上一个10秒的时间戳
    private protoTime: Map<number, number>;//key roleUid  value上一个10秒的时间戳
    private protoCount: Map<number, number>;//key roleUid  最近10秒的执行次数  按每秒6条，理论上最多60条
    constructor(app: Application) {
        this.app = app;
        this.serverType = app.serverType;
        this.router = this.app.router;
        this.protoTime = new Map();
        this.protoCount = new Map();
        this.proto100Time = new Map();
        this.proto100Count = new Map();
        let connectorConfig = this.app.someconfig.connector || {};
        this.clientOnCb = connectorConfig.clientOnCb || clientOnOffCb;
        this.clientOffCb = connectorConfig.clientOffCb || clientOnOffCb;
        this.cmdFilter = connectorConfig.cmdFilter as any || null;
    }



    addClient(client: I_clientSocket) {
        if (client.session) {
            this.app.logger(loggerType.frame, loggerLevel.warn, "frontendServer -> 这个新的客户端Socket已有建立, close it");
            client.close();
            return;
        }
        this.app.clientNum++;

        let session = new Session(this.app.serverName);
        session.socket = client;
        client.session = session;
        this.clientOnCb(session as any);
    }

    removeClient(client: I_clientSocket) {
        let session = client.session;
        // logTest("removeClient", session.uid, this.app.clients);
        if (!session) {
            return;
        }


        delete this.app.clients[session.uid];
        // logTest("removeClient2", session.uid, this.app.clients);
        this.app.clientNum--;

        client.session = null as any;
        session.socket = null as any;
        this.clearQueue(session.uid);
        this.clientOffCb(session as any);
    }


    public protoQueue: Map<number, any[][]> = new Map();
    handleMsg(client: I_clientSocket, msgBuf: Buffer) {
        try {
            if (!client.session) {
                this.app.logger(loggerType.frame, loggerLevel.warn, "frontendServer -> cannot handle msg before added, close it");
                client.close();
                return;
            }

            let data = this.app.protoDecode(msgBuf);
            //  如果该协议是发给后端服的，就抛出到对应路由 如下面注释，当协议不属于前端服时，消息会根据route函数，转发给对应的服务器
            this.doRemote(data, client.session);
        } catch (e: any) {
            let error: string = this.app.serverName + "-----" + e.stack
            this.app.logger(loggerType.msg, loggerLevel.error, error);
        }
    }

    public clearQueue(uid: number) {
        let queue = this.protoQueue.get(uid);
        if (queue) {
            queue = [];
            this.protoQueue.delete(uid);
        }
    }

    // private async doQueue(uid: number) {
    //     let queue = this.protoQueue.get(uid);
    //     let count = 0;
    //     while (queue.length > 0) {
    //         count++;
    //         if (count > 30) {
    //             warningLog("执行消息队列超过了30次尚未跳出");
    //             break;
    //         }
    //         let arr = queue.shift();
    //         await TSEventCenter.Instance.eventAsync(KarlCatEvent.FrontendServerDoFuntion + arr[0] + "_" + arr[1], arr[2], arr[3].session, this.callBack(arr[3], arr[0], arr[1]), this.otherCallBack(arr[3]));
    //     }
    // }

    /**
     * Callback  
     */
    // private callBack(client: I_clientSocket, cmd: number) {
    //     let self = this;
    //     return function (msg: any) {
    //         // logInfo("frone  callback", mainKey, sonKey, msg);
    //         if (msg === undefined) {
    //             msg = null;
    //         }
    //         //callback都是给前端的，因此直接TOS = False
    //         // if (cmd != 302)
    //         //     logProto("<<<<<<<<<<<<<<< 发送消息", cmd + "-" + sonKey, client.session && client.session.uid, msg);
    //         // if (isStressTesting) {
    //         //     TSEventCenter.Instance.event(KarlCatEvent.OnUnitTestProto + mainKey + "_" + sonKey, msg);
    //         // }

    //         let buf = self.app.protoEncode(cmd, msg);
    //         client.send(buf);
    //     }
    // }

    // /**
    // * otherCallBack  类似next的用法，实现了 sendMsgByUidSid
    // */
    // private otherCallBack(client: I_clientSocket) {
    //     let self = this;
    //     return function (msg: any, cmd: number) {
    //         // logInfo("frone  callback", mainKey, sonKey, msg);
    //         if (msg === undefined) {
    //             msg = null;
    //         }
    //         //callback都是给前端的，因此直接TOS = False
    //         // if (cmd != 302)
    //         // logProto("<<<<<<<<<<<<<<< 发送消息", cmd + "-" + sonKey, msg);
    //         let buf = self.app.protoEncode(cmd, msg);
    //         // if (isStressTesting) {
    //         //     TSEventCenter.Instance.event(KarlCatEvent.OnUnitTestProto + mainKey + "_" + sonKey, msg);
    //         // }
    //         client.send(buf);
    //     }
    // }

    /**
     * 处理Gate转发到后端服逻辑
     * Forward client messages to the backend server
     */
    private doRemote(msg: { cmd: number, "msg": Buffer }, session: Session) {
        let name = getServerTypeByMainKey(msg.cmd);
        // logInfo("doRemote", msg.mainKey, name, this.router);
        if (isDebug) {
            if (typeof (this.router[name]) != "function") {
                console.log("非方法", name, this.app.serverName, msg.cmd);
                console.log("what the fuck", name, this.app.serverName, msg.cmd);
            }
        }

        let id = this.router[name](session);
        let socket = this.app.rpcPool.getSocket(id);

        // logInfo("客户端发送协议从前端服转发到后端服", msg.mainKey, name, id, socket == null);
        if (!socket) {
            return;
        }
        let svr = this.app.serversNameMap[id];
        if (svr.serverType !== name || svr.frontend) {
            this.app.logger(loggerType.msg, loggerLevel.warn, "frontendServer -> illegal remote");
            return;
        }

        // this.app.logger(loggerType.msg, loggerLevel.info, this.app.serverName + "send msg to " + name);

        let sessionBuf = session.sessionBuf;
        let buf = Buffer.allocUnsafe(9 + sessionBuf.length + msg.msg.length);
        buf.writeUInt32BE(5 + sessionBuf.length + msg.msg.length, 0);//消息总长度
        buf.writeUInt8(define.Rpc_Msg.clientMsgIn, 4);
        buf.writeUInt16BE(sessionBuf.length, 5);

        sessionBuf.copy(buf, 7);
        buf.writeUInt16BE(msg.cmd, 7 + sessionBuf.length);//38+7 =  45
        // buf.writeUInt16BE(msg.sonKey, 9 + sessionBuf.length);//38+9 = 47
        msg.msg.copy(buf, 9 + sessionBuf.length); //38+11 = 49 从49位开始复制
        socket.send(buf);
    }
}