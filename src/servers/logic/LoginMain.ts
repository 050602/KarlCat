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
        //监听后端服消息
        TSEventCenter.Instance.bind(KarlCatEvent.BackendServerDoFuntion + "101_1", this, this.changeName);
    }


    public destoryInstance(): void {
        TSEventCenter.Instance.unbind(RpcEvent.SayHello, this,);
    }

    
    public test(msg: string) {
        console.log("test say ", msg)
    }

    //以下代码是示例接收后端服的代码 lanlu.IPt101_1_tos会报错，因为我生成的proto文件没有101这个协议
    public async changeName(msg: lanlu.IPt101_1_tos, session: Session, next: Function) {
        console.log("changeName ", msg)
    }

}
