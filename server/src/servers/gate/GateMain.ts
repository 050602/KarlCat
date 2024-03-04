import { app } from "../../app";
import { BaseServerLogic } from "../../components/BaseServerLogic";
import { Session } from "../../components/session";
import { RpcEvent } from "../../event/RpcEvent";
import { SnowDrifting } from "../../utils/SnowDrifting";

export default class GateMain extends BaseServerLogic {
    public static get Instance(): GateMain {
        return this.getInstance();
    }

    public initInstance(): void {
        this.bindRpcEvents(RpcEvent.OnKillSocketByUid, this.onKillSocketByUid);
    }

    public async clientOnCallback(session: Session) {
        //临时的唯一ID
        let onlyId = SnowDrifting.Instance.getOnlyId();
        session.bind(onlyId);
    }

    public onKillSocketByUid(uid: number) {
        console.log("onKillSocketByUid", uid)
        let session = app.getSession(uid);
        session.close();
    }
}