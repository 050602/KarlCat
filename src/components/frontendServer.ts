
import Application from "../application";
import define = require("../util/define");
import * as path from "path";
import * as fs from "fs";
import { loggerType, sessionCopyJson, I_clientSocket, I_clientManager, I_connectorConstructor, I_encodeDecodeConfig, loggerLevel } from "../util/interfaceDefine";
import { Session, initSessionApp } from "./session";
import * as protocol from "../connector/protocol";
import { getNameByMainKey } from "../config/sys/protoToServerName";
import { TSEventCenter } from "../utils/TSEventCenter";
import { KalrEvent } from "../utils/TSEvent";

export class FrontendServer {
    private app: Application;
    constructor(app: Application) {
        this.app = app;
    }

    start(cb: Function) {
        initSessionApp(this.app);

        let self = this;
        let startCb = function () {
            let str = `listening at [${self.app.serverInfo.host}:${self.app.serverInfo.clientPort}]  ${self.app.serverId} (clientPort)`;
            console.log(str);
            self.app.logger(loggerType.frame, loggerLevel.info, str);
            cb && cb();
        };
        protocol.init(this.app);
        let mydog = require("../mydog");
        let connectorConfig = this.app.someconfig.connector || {};
        let connectorConstructor: I_connectorConstructor = connectorConfig.connector as any || mydog.connector.Tcp;
        let defaultEncodeDecode: Required<I_encodeDecodeConfig> = protocol.default_encodeDecode;
        let encodeDecodeConfig = this.app.someconfig.encodeDecode || {};
        this.app.protoEncode = encodeDecodeConfig.protoEncode || defaultEncodeDecode.protoEncode;
        this.app.msgEncode = encodeDecodeConfig.msgEncode || defaultEncodeDecode.msgEncode;
        this.app.protoDecode = encodeDecodeConfig.protoDecode || defaultEncodeDecode.protoDecode;
        this.app.msgDecode = encodeDecodeConfig.msgDecode || defaultEncodeDecode.msgDecode;

        new connectorConstructor({
            "app": this.app as any,
            "clientManager": new ClientManager(this.app),
            "config": this.app.someconfig.connector,
            "startCb": startCb
        });
    }

    /**
     * Sync session
     */
    applySession(data: Buffer) {
        let session = JSON.parse(data.slice(1).toString()) as sessionCopyJson;
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
        let msgBuf = data.slice(3 + uidsLen * 4);
        let clients = this.app.clients;
        let client: I_clientSocket;
        let i: number;
        // gzaLog("sendMsgByUids", clients);
        for (i = 0; i < uidsLen; i++) {
            client = clients[data.readUInt32BE(3 + i * 4)];
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
    private msgHandler: { [filename: string]: any } = {};
    private serverType: string = "";
    private router: { [serverType: string]: (session: Session) => string };
    private clientOnCb: (session: Session) => void = null as any;
    private clientOffCb: (session: Session) => void = null as any;
    private cmdFilter: (session: Session, mainKey: number, sonKey: number) => boolean = null as any;
    constructor(app: Application) {
        this.app = app;
        this.serverType = app.serverType;
        this.router = this.app.router;
        let connectorConfig = this.app.someconfig.connector || {};
        this.clientOnCb = connectorConfig.clientOnCb || clientOnOffCb;
        this.clientOffCb = connectorConfig.clientOffCb || clientOnOffCb;
        this.cmdFilter = connectorConfig.cmdFilter as any || null;
        this.loadHandler();
    }

    /**
     * Front-end server load routing processing
     */
    private loadHandler() {
        let dirName = path.join(this.app.base, define.some_config.File_Dir.Servers, this.serverType);
        let exists = fs.existsSync(dirName);
        if (exists) {
            let self = this;
            fs.readdirSync(dirName).forEach(function (filename) {
                if (!filename.endsWith(".js")) {
                    return;
                }
                let name = path.basename(filename, '.js');
                let handler = require(path.join(dirName, filename));
                if (handler.default && typeof handler.default === "function") {
                    self.msgHandler[name] = new handler.default(self.app);
                    self.msgHandler[name]["ServerType"] = self.serverType;
                }
            });
        }
    }


    addClient(client: I_clientSocket) {
        if (client.session) {
            this.app.logger(loggerType.frame, loggerLevel.warn, "frontendServer -> the I_client has already been added, close it");
            client.close();
            return;
        }
        this.app.clientNum++;

        let session = new Session(this.app.serverId);
        session.socket = client;
        client.session = session;
        this.clientOnCb(session as any);
    }

    removeClient(client: I_clientSocket) {
        let session = client.session;
        if (!session) {
            return;
        }

        delete this.app.clients[session.uid];
        this.app.clientNum--;

        client.session = null as any;
        session.socket = null as any;
        this.clientOffCb(session as any);
    }

    handleMsg(client: I_clientSocket, msgBuf: Buffer) {
        try {
            if (!client.session) {
                this.app.logger(loggerType.frame, loggerLevel.warn, "frontendServer -> cannot handle msg before added, close it");
                client.close();
                return;
            }
            let data = this.app.protoDecode(msgBuf);
            if (this.cmdFilter && this.cmdFilter(client.session, data.mainKey, data.sonKey)) {
                return;
            }
            //  如果该协议是发给前端服的，就前端自己处理
            if (!getNameByMainKey(data.mainKey)) {
                // console.log("frontend protoDecode3", data.mainKey, data.sonKey, msgBuf, KalrEvent.FrontendServerDoFuntion + data.mainKey + "_" + data.sonKey);
                let msg = this.app.msgDecode(data.mainKey, data.sonKey, data.msg, true);
                TSEventCenter.getInstance().event(KalrEvent.FrontendServerDoFuntion + data.mainKey + "_" + data.sonKey, msg, client.session, this.callBack(client, data.mainKey, data.sonKey));
            } else {
                 //  如果该协议是发给后端服的，就抛出到其他链接了的服务器
                this.doRemote(data, client.session);
            }
        } catch (e: any) {
            this.app.logger(loggerType.msg, loggerLevel.error, e.stack);
        }
    }

    /**
     * Callback  
     */
    private callBack(client: I_clientSocket, mainKey: number, sonKey: number) {
        let self = this;
        return function (msg: any) {
            console.log("frone  callback", mainKey, sonKey, msg);
            if (msg === undefined) {
                msg = null;
            }
            //callback都是给前端的，因此直接TOS = False
            let buf = self.app.protoEncode(mainKey, sonKey, msg, false);
            client.send(buf);
        }
    }

    /**
     * Forward client messages to the backend server
     */
    private doRemote(msg: { mainKey: number, sonKey: number, "msg": Buffer }, session: Session) {
        let name = getNameByMainKey(msg.mainKey);
        let id = this.router[name](session);
        // console.log("doRemote", msg.mainKey, name, id);
        let socket = this.app.rpcPool.getSocket(id);
        if (!socket) {
            return;
        }
        let svr = this.app.serversIdMap[id];
        if (svr.serverType !== name || svr.frontend) {
            this.app.logger(loggerType.msg, loggerLevel.warn, "frontendServer -> illegal remote");
            return;
        }
        let sessionBuf = session.sessionBuf;
        let buf = Buffer.allocUnsafe(11 + sessionBuf.length + msg.msg.length);
        buf.writeUInt32BE(7 + sessionBuf.length + msg.msg.length, 0);//消息总长度
        buf.writeUInt8(define.Rpc_Msg.clientMsgIn, 4);
        buf.writeUInt16BE(sessionBuf.length, 5);

        sessionBuf.copy(buf, 7);
        buf.writeUInt16BE(msg.mainKey, 7 + sessionBuf.length);//38+7 =  45
        buf.writeUInt16BE(msg.sonKey, 9 + sessionBuf.length);//38+9 = 47
        msg.msg.copy(buf, 11 + sessionBuf.length); //38+11 = 49 从49位开始复制
        socket.send(buf);
    }
}