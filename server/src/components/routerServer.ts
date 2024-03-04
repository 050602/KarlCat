
import { Application } from "../application";
import * as protocol from "../connector/protocol";
import { ServerType } from "../register/route";
import { I_clientManager, I_clientSocket, I_connectorConstructor, I_encodeDecodeConfig, loggerLevel, loggerType, sessionCopyJson } from "../util/interfaceDefine";
import { Session, initSessionApp } from "./session";
const BSON = require('bson');
const Long = BSON.Long;


export class RouterServer {
    private app: Application;
    private clientManager: ClientManager;
    constructor(app: Application) {
        this.app = app;
        initSessionApp(this.app);

        let defaultEncodeDecode: Required<I_encodeDecodeConfig> = protocol.default_encodeDecode;

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
            client = clients[Number(socketId)];
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
    private router: { [serverType: string]: (session: Session) => string };
    private clientOnCb: (session: Session) => void = null as any;
    private clientOffCb: (session: Session) => void = null as any;
    private toGate: string;
    constructor(app: Application) {
        this.app = app;
        this.router = this.app.router;
        let connectorConfig = this.app.someconfig.connector || {};
        this.clientOnCb = connectorConfig.clientOnCb || clientOnOffCb;
        this.clientOffCb = connectorConfig.clientOffCb || clientOnOffCb;
        this.toGate = app.serverInfo.toGate;
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
        this.app.clientNum--;

        client.session = null as any;
        session.socket = null as any;
        this.clientOffCb(session as any);
    }


    handleMsg(client: I_clientSocket, msgBuf: Buffer) {
        try {
            let id = this.router[this.toGate](client.session);
            let socket = this.app.rpcPool.getSocket(id);
            if (!socket) {
                return;
            }
            let svr = this.app.serversNameMap[id];
            if (svr.serverType !== this.toGate || svr.frontend) {
                this.app.logger(loggerType.msg, loggerLevel.warn, "frontendServer -> illegal remote");
                return;
            }

            socket.send(msgBuf);
        } catch (e: any) {
            let error: string = this.app.serverName + "-----" + e.stack
            this.app.logger(loggerType.msg, loggerLevel.error, error);
        }
    }


}