import { app } from "../../app";
import Application from "../../application";
import { BaseServerLogic } from "../../components/BaseServerLogic";
import { Session } from "../../components/session";
import { ServerName } from "../../config/sys/protoToServerName";
import { RpcEvent } from "../../event/RpcEvent";
import { gzaLog } from "../../LogTS";
import { lanlu } from "../../proto/protobuf/proto.js.js";
import { KalrEvent } from "../../utils/TSEvent";
import { TSEventCenter } from "../../utils/TSEventCenter";

export default class GateMain extends BaseServerLogic {

    constructor() {
        super();
        TSEventCenter.getInstance().bind(KalrEvent.FrontendServerDoFuntion + "100_1", this, this.onLogin);
    }

    onLogin(msg: any, session: Session, next: Function) {
        //当收到Ping时，返回一个pong给客户端
        session.set({ "serverId": 1 })
        let data: lanlu.IPt100_1_toc = { serverId: 1 };
        next(data);
        app.rpc(ServerName.connector + "-1", this.ServerType, RpcEvent.SayHello, "Hello World");
    }
}