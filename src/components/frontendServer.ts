
import { Application } from "../application";
import * as protocol from "../connector/protocol";
import * as protocolBG from "../connector/protocolBG";
import { RegisterSigleton } from "../register/RegisterSigleton";
import { getNameByMainKey, isFrontend, ServerName } from "../serverConfig/sys/route";
import { I_clientManager, I_clientSocket, I_connectorConstructor, I_encodeDecodeConfig, loggerLevel, loggerType, sessionCopyJson } from "../util/interfaceDefine";
import { KalrEvent } from "../event/KalrEvent";
import { TSEventCenter } from "../utils/TSEventCenter";
import { initSessionApp, Session } from "./session";
import define = require("../util/define");
import { logInfo, logProto, warningLog } from "../LogTS";
import { isStressTesting } from "../app";
import { DateUtils } from "../utils/DateUtils";
const BSON = require('bson');
const Long = BSON.Long;


export class FrontendServer {
    private app: Application;
    private clientManager: ClientManager;
    constructor(app: Application) {
        this.app = app;
        initSessionApp(this.app);

        let defaultEncodeDecode: Required<I_encodeDecodeConfig> = protocol.default_encodeDecode;

        if (this.app.serverType == ServerName.background) {
            protocolBG.init(this.app);
            defaultEncodeDecode = protocolBG.bg_encodeDecode;
        } else {
            protocol.init(this.app);
            defaultEncodeDecode = protocol.default_encodeDecode;
        }

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
            logInfo(str);
            self.app.logger(loggerType.frame, loggerLevel.info, str);
            cb && cb();
        };


        let mydog = require("../mydog");
        let connectorConfig = this.app.someconfig.connector || {};
        let connectorConstructor: I_connectorConstructor = connectorConfig.connector || mydog.connector.Tcp;
        // new connectorConstructor({
        //     "app": this.app as any,
        //     "clientManager": new ClientManager(this.app),
        //     "config": this.app.someconfig.connector,
        //     "startCb": startCb
        // });
        new connectorConstructor({
            "app": this.app,
            "clientManager": this.clientManager,
            "config": this.app.someconfig.connector,
            "startCb": startCb
        });
    }

    // start(cb: Function) {
    //     initSessionApp(this.app);

    //     let self = this;
    //     let startCb = function () {
    //         let str = `listening at [${self.app.serverInfo.host}:${self.app.serverInfo.clientPort}]  ${self.app.serverId} (clientPort)`;
    //         logInfo(str);
    //         self.app.logger(loggerType.frame, loggerLevel.info, str);
    //         cb && cb();
    //     };
    //     let defaultEncodeDecode: Required<I_encodeDecodeConfig>;

    //     if (this.app.serverType == ServerName.background) {
    //         protocolBG.init(this.app);
    //         defaultEncodeDecode = protocolBG.bg_encodeDecode;
    //     } else {
    //         protocol.init(this.app);
    //         defaultEncodeDecode = protocol.default_encodeDecode;
    //     }


    //     let mydog = require("../mydog");
    //     let connectorConfig = this.app.someconfig.connector || {};
    //     let connectorConstructor: I_connectorConstructor = connectorConfig.connector as any || mydog.connector.Tcp;

    //     let encodeDecodeConfig = this.app.someconfig.encodeDecode || {};
    //     this.app.protoEncode = encodeDecodeConfig.protoEncode || defaultEncodeDecode.protoEncode;
    //     this.app.msgEncode = encodeDecodeConfig.msgEncode || defaultEncodeDecode.msgEncode;
    //     this.app.protoDecode = encodeDecodeConfig.protoDecode || defaultEncodeDecode.protoDecode;
    //     this.app.msgDecode = encodeDecodeConfig.msgDecode || defaultEncodeDecode.msgDecode;

    //     new connectorConstructor({
    //         "app": this.app as any,
    //         "clientManager": new ClientManager(this.app),
    //         "config": this.app.someconfig.connector,
    //         "startCb": startCb
    //     });
    // }

    /**
     * Sync session
     */
    applySession(data: Buffer) {
        let session = BSON.deserialize(data.slice(1)) as sessionCopyJson;
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


        // gzaLog("sendMsgByUids", uidsLen, this.app.serverId);
        for (i = 0; i < uidsLen; i++) {
            let idddd = data.readUInt32BE(3 + i * 4);

            client = clients[idddd];

            if (isStressTesting) {
                let data = this.app.protoDecode(msgBuf);
                TSEventCenter.Instance.event(KalrEvent.OnUnitTestProto + data.mainKey + "_" + data.sonKey, data.msg);
            }

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
        this.serverType = app.serverType; 1
        this.router = this.app.router;
        this.protoTime = new Map();
        this.protoCount = new Map();
        this.proto100Time = new Map();
        this.proto100Count = new Map();
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
        RegisterSigleton.initForntend(this);
    }

    public initMsgHandler(sigleton: any) {
        sigleton["ServerType"] = this.serverType;
    }


    addClient(client: I_clientSocket) {
        if (client.session) {
            this.app.logger(loggerType.frame, loggerLevel.warn, "frontendServer -> the I_client has already been added, close it");
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
        if (!session) {
            return;
        }

        delete this.app.clients[session.uid];
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
            // logProto(">>>>>>>>>>>>>>>" + this.app.serverId + " 收到消息", data.mainKey + "-" + data.sonKey);
            //目前没有在使用过滤，因此直接屏蔽相关代码
            // if (this.cmdFilter && this.cmdFilter(client.session, data.mainKey, data.sonKey)) {
            //     return;
            // }
            //  如果该协议是发给前端服的，就前端自己处理


            //TODO 校验token合法性
            if (isFrontend(data.mainKey)) {
                //此处返回的是Protobuf的结构体，而不是Buffer
                //同IP防DDOS
                if (!isStressTesting) {
                    let ip = client.session.getIp();
                    let time = this.proto100Time.get(ip);
                    let time2 = DateUtils.timestamp();
                    if (time) {
                        let cha = time2 - time;
                        if (cha > 10000) {
                            this.proto100Time.set(ip, time2);
                            this.proto100Count.set(ip, 1);
                        } else {
                            let count = this.proto100Count.get(ip);
                            if (count > 15) {
                                warningLog("理论上十秒内，不应该超过请求15次协议 ip:", ip, data.mainKey, data.sonKey);
                                return;
                            }
                            this.proto100Count.set(ip, count + 1)
                        }
                    } else {
                        this.proto100Time.set(ip, time2);
                        this.proto100Count.set(ip, 1);
                    }
                }
                let msg = this.app.msgDecode(data.mainKey, data.sonKey, data.msg, true);
                logProto(">>>>>>>>>>>>>>>" + this.app.serverName + " 收到消息", data.mainKey + "-" + data.sonKey, client.session.uid, msg);
                if (client.session.uid) {
                    let queue = this.protoQueue.get(client.session.uid);
                    if (!queue) {
                        queue = [];
                        this.protoQueue.set(client.session.uid, queue);
                    }
                    queue.push([data.mainKey, data.sonKey, msg, client]);
                    if (queue.length == 1) {
                        this.doQueue(client.session.uid);
                    }
                } else {
                    TSEventCenter.Instance.event(KalrEvent.FrontendServerDoFuntion + data.mainKey + "_" + data.sonKey, msg, client.session, this.callBack(client, data.mainKey, data.sonKey), this.otherCallBack(client));
                }
                // TSEventCenter.Instance.event(KalrEvent.FrontendServerDoFuntion + data.mainKey + "_" + data.sonKey, msg, client.session, this.callBack(client, data.mainKey, data.sonKey), this.otherCallBack(client));
            } else {
                let uid = client.session.uid;
                let time = this.protoTime.get(uid);
                let time2 = DateUtils.timestamp();
                if (time) {
                    let cha = time2 - time;
                    if (cha > 10000) {
                        this.protoTime.set(uid, time2);
                        this.protoCount.set(uid, 1);
                    } else {
                        let count = this.protoCount.get(uid);
                        if (count > 100) {
                            warningLog("理论上十秒内，不应该超过请求100次协议 Uid,ip", uid, client.session.getIp(), data.mainKey, data.sonKey);
                            return;
                        }
                        this.protoCount.set(uid, count + 1)
                    }
                } else {
                    this.protoTime.set(uid, time2);
                    this.protoCount.set(uid, 1);
                }


                //  如果该协议是发给后端服的，就抛出到对应路由 如下面注释，当协议不属于前端服时，消息会根据route函数，转发给对应的服务器
                this.doRemote(data, client.session);

                let msg = this.app.msgDecode(data.mainKey, data.sonKey, data.msg, true);
                logProto(">>>>>>>>>>>>>>>" + this.app.serverName + " 收到消息", data.mainKey + "-" + data.sonKey, client.session.uid, msg);

                // 当客户端给后端服务器发消息时，需要提供路由函数以决定该消息发到哪个服务器
                // app.route(ServerName.connector, (session: Session) => {
                // return ServerName.connector + "-" + session.get("serverId");
                // });
            }
        } catch (e: any) {
            this.app.logger(loggerType.msg, loggerLevel.error, e.stack);
        }
    }

    public clearQueue(uid: number) {
        let queue = this.protoQueue.get(uid);
        if (queue) {
            queue = [];
            this.protoQueue.delete(uid);
        }
    }

    private async doQueue(uid: number) {
        let queue = this.protoQueue.get(uid);
        let count = 0;
        while (queue.length > 0) {
            count++;
            if (count > 30) {
                warningLog("执行消息队列超过了30次尚未跳出");
                break;
            }
            let arr = queue.shift();
            await TSEventCenter.Instance.eventAsync(KalrEvent.FrontendServerDoFuntion + arr[0] + "_" + arr[1], arr[2], arr[3].session, this.callBack(arr[3], arr[0], arr[1]), this.otherCallBack(arr[3]));
            // await TSEventCenter.Instance.eventAsync(KalrEvent.BackendServerDoFuntion + arr[0] + "_" + arr[1], arr[2], arr[3], this.callBack(arr[4], arr[0], arr[1], uid));
        }
    }

    /**
     * Callback  
     */
    private callBack(client: I_clientSocket, mainKey: number, sonKey: number) {
        let self = this;
        return function (msg: any) {
            // logInfo("frone  callback", mainKey, sonKey, msg);
            if (msg === undefined) {
                msg = null;
            }
            //callback都是给前端的，因此直接TOS = False
            logProto("<<<<<<<<<<<<<<< 发送消息", mainKey + "-" + sonKey, client.session && client.session.uid, msg);
            if (isStressTesting) {
                TSEventCenter.Instance.event(KalrEvent.OnUnitTestProto + mainKey + "_" + sonKey, msg);
            }

            let buf = self.app.protoEncode(mainKey, sonKey, msg, false);
            client.send(buf);
        }
    }

    /**
    * otherCallBack  类似next的用法，实现了 sendMsgByUidSid
    */
    private otherCallBack(client: I_clientSocket) {
        let self = this;
        return function (msg: any, mainKey: number, sonKey: number) {
            // logInfo("frone  callback", mainKey, sonKey, msg);
            if (msg === undefined) {
                msg = null;
            }
            //callback都是给前端的，因此直接TOS = False
            logProto("<<<<<<<<<<<<<<< 发送消息", mainKey + "-" + sonKey, msg);
            let buf = self.app.protoEncode(mainKey, sonKey, msg, false);
            if (isStressTesting) {
                TSEventCenter.Instance.event(KalrEvent.OnUnitTestProto + mainKey + "_" + sonKey, msg);
            }
            client.send(buf);
        }
    }

    /**
     * 处理Gate转发到后端服逻辑
     * Forward client messages to the backend server
     */
    private doRemote(msg: { mainKey: number, sonKey: number, "msg": Buffer }, session: Session) {
        let name = getNameByMainKey(msg.mainKey);
        // logInfo("doRemote", msg.mainKey, name, this.router);
        let id = this.router[name](session);
        let socket = this.app.rpcPool.getSocket(id);

        logInfo("客户端发送协议从前端服转发到后端服", msg.mainKey, name, id, socket == null);
        if (!socket) {
            return;
        }
        let svr = this.app.serversNameMap[id];
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