import { BaseServerLogic } from "../../components/BaseServerLogic";
import { KalrEvent } from "../../event/KalrEvent";
import { RpcEvent } from "../../event/RpcEvent";
import { TSEventCenter } from "../../utils/TSEventCenter";

export default class LoginMain extends BaseServerLogic {
    public static SigletonInsName = "LoginMain";
    public static get Instance(): LoginMain {
        return super.getInstance(LoginMain);
    }

    public initInstance(): void {
        //接收后端服数据 ---注意，后端服只能接收到前端服的消息以及RPC消息
        TSEventCenter.Instance.bind(RpcEvent.SayHello, this, this.test);
    }


    public destoryInstance(): void {
        TSEventCenter.Instance.unbind(RpcEvent.SayHello, this,);
    }

    //romote是用于服务器间通讯的，因此，此处是来自Handler调用的
    test(msg: string) {
        console.log("test say ", msg)
    }

}
