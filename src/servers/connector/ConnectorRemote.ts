import Application from "../../application"
import { BaseServerLogic } from "../../components/BaseServerLogic";
import { RpcEvent } from "../../event/RpcEvent";
import { gzaLog } from "../../LogTS";
import { KalrEvent } from "../../utils/TSEvent";
import { TSEventCenter } from "../../utils/TSEventCenter";

export default class ConnectorRemote extends BaseServerLogic {

    constructor() {
        super();
        //RPC通讯
        TSEventCenter.getInstance().bind(RpcEvent.SayHello, this, this.test);
        TSEventCenter.getInstance().bind(KalrEvent.FrontendServerDoFuntion + "100_1", this, this.frontendFun);
        //接收后端服数据
        TSEventCenter.getInstance().bind(KalrEvent.BackendServerDoFuntion + "100_1", this, this.backFun);
    }

    //romote是用于服务器间通讯的，因此，此处是来自Handler调用的
    test(msg: string) {
        console.log("test say ", msg)
    }

    //protobuf结构体
    frontendFun(data: any) {
        //理论上此处不可能收到
        console.log("后端收到了前端服的数据")
    }
    //protobuf结构体
    backFun(data: any) {
        console.log("后端收到了穿透前端服传递过来的数据")
    }
}