"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseServerLogic_1 = require("../../components/BaseServerLogic");
const RpcEvent_1 = require("../../event/RpcEvent");
const TSEventCenter_1 = require("../../utils/TSEventCenter");
class LoginMain extends BaseServerLogic_1.BaseServerLogic {
    static get Instance() {
        return super.getInstance(LoginMain);
    }
    initInstance() {
        //接收后端服数据 ---注意，后端服只能接收到前端服的消息以及RPC消息
        TSEventCenter_1.TSEventCenter.Instance.bind(RpcEvent_1.RpcEvent.SayHello + "100_1", this, this.test);
        // TSEventCenter.Instance.bind(KalrEvent.BackendServerDoFuntion + "100_1", this, this.backFun);
    }
    destoryInstance() {
        TSEventCenter_1.TSEventCenter.Instance.unbind(RpcEvent_1.RpcEvent.SayHello, this);
    }
    //romote是用于服务器间通讯的，因此，此处是来自Handler调用的
    test(msg) {
        console.log("test say ", msg);
    }
    //protobuf结构体
    backFun(data) {
        console.log("后端收到了穿透前端服传递过来的数据");
    }
}
exports.default = LoginMain;
LoginMain.SigletonInsName = "LoginMain";
//# sourceMappingURL=LoginMain.js.map