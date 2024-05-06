import { BaseServerLogic } from "../../components/BaseServerLogic";
import { lanlu } from "../../proto/protobuf/proto.js";
import { Pt100Login } from "../../proto/protos/Pt100Login";
import { UserModel } from "../../model/UserModel";
import { UserModelLogic } from "../../modelLogic/UserModelLogic";
import { UserData } from "../../database/UserTable";
import { SnowDrifting } from "../../utils/SnowDrifting";
import { Session } from "../../components/session";
import { app } from "../../app";
import { RpcEvent } from "../../event/RpcEvent";

export default class LoginMain extends BaseServerLogic {
    public static get Instance(): LoginMain {
        return this.getInstance();
    }

    public initInstance(): void {
        this.bindCmd(Pt100Login.LoginReq10001, this.loginReq10001);
    }


    public destoryInstance(): void {
    }


    //以下代码是示例接收后端服的代码
    public async loginReq10001(msg: lanlu.IPt10001, session: Session, next: Function) {
        console.log("login succc ", msg)

        //简单的登录示例
        let userData = await UserModelLogic.Instance.getLoginUserData(msg.username);
        if (!userData) {
            //创建帐号
            //唯一ID 当做用户标识，但是建议真的开发时，不要使用该api获取唯一ID来当角色UID ，因为在同一机子上如果没设置好参数，ID可能与临时ID重复，被其他用户顶掉
            let onlyId = SnowDrifting.Instance.getOnlyId();
            let user: UserData = {
                userName: msg.username,
                roleUid: onlyId
            };
            userData = await UserModel.Instance.insert(user);
        }

        //重新纠正session的uid 并应用到前端服
        session.uid = userData.roleUid;
        session.apply();

        let proto: lanlu.IPt10002 = {
            code: 1,
        }

        //一般来说可以通过next快捷回调协议
        next(Pt100Login.LoginResp10002, proto); //回调的协议号，协议结构体

        //也可以使用该API 发送消息给客户端
        app.sendMsgByUidSid(Pt100Login.LoginResp10002, proto, [{ uid: session.uid, sid: session.getFrontendSid() }]);


        //通过RPC踢该玩家下线
        app.rpc(session.getFrontendSid(), RpcEvent.OnKillSocketByUid, session.uid);

    }

}
