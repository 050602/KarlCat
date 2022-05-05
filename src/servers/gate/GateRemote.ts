import Application from "../../application"
import { KalrEvent } from "../../utils/TSEvent";
import { TSEventCenter } from "../../utils/TSEventCenter";
import { BaseServerLogic } from "../../components/BaseServerLogic";



export default class GateRemote extends BaseServerLogic {

    constructor() {
        super();
        // TSEventCenter.getInstance().bind(KalrEvent.BackendServerDoFuntion + "100_1", this, this.test2);
        // TSEventCenter.getInstance().bind(KalrEvent.FrontendServerDoFuntion + "100_1", this, this.test);
    }

    //romote是用于服务器间通讯的，因此，此处是来自Handler调用的
    // test(msg: string) {
    //     console.log("前端通讯收到：", KalrEvent.FrontendServerDoFuntion + "100_1" + "rpcMsg", msg)
    // }

    // test2(msg: string) {
    //     //理论上此处不可能收到 因为Gate是一个前端服务器
    //     console.log("前端通讯收到后端过来的消息：", KalrEvent.BackendServerDoFuntion + "100_1" + "rpcMsg", msg)
    // }
}