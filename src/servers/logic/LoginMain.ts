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
        //监听RPC消息
        TSEventCenter.Instance.bind(RpcEvent.SayHello, this, this.test);
    }


    public destoryInstance(): void {
        TSEventCenter.Instance.unbind(RpcEvent.SayHello, this,);
    }

    
    test(msg: string) {
        console.log("test say ", msg)
    }

}
