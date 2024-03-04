"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("../../app");
const BaseServerLogic_1 = require("../../components/BaseServerLogic");
const RpcEvent_1 = require("../../event/RpcEvent");
const SnowDrifting_1 = require("../../utils/SnowDrifting");
class GateMain extends BaseServerLogic_1.BaseServerLogic {
    static get Instance() {
        return this.getInstance();
    }
    initInstance() {
        this.bindRpcEvents(RpcEvent_1.RpcEvent.OnKillSocketByUid, this.onKillSocketByUid);
    }
    async clientOnCallback(session) {
        //临时的唯一ID
        let onlyId = SnowDrifting_1.SnowDrifting.Instance.getOnlyId();
        session.bind(onlyId);
    }
    onKillSocketByUid(uid) {
        console.log("onKillSocketByUid", uid);
        let session = app_1.app.getSession(uid);
        session.close();
    }
}
exports.default = GateMain;
//# sourceMappingURL=GateMain.js.map