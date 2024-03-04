"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseServerLogic_1 = require("../../components/BaseServerLogic");
const Pt100Login_1 = require("../../proto/protos/Pt100Login");
const UserModel_1 = require("../../model/UserModel");
const UserModelLogic_1 = require("../../modelLogic/UserModelLogic");
const SnowDrifting_1 = require("../../utils/SnowDrifting");
const app_1 = require("../../app");
const RpcEvent_1 = require("../../event/RpcEvent");
class LoginMain extends BaseServerLogic_1.BaseServerLogic {
    static get Instance() {
        return this.getInstance();
    }
    initInstance() {
        this.bindCmd(Pt100Login_1.Pt100Login.LoginReq10001, this.loginReq10001);
    }
    destoryInstance() {
    }
    //以下代码是示例接收后端服的代码 lanlu.IPt101_1_tos会报错，因为我生成的proto文件没有101这个协议
    async loginReq10001(msg, session, next) {
        console.log("login succc ", msg);
        //简单的登录示例
        let userData = await UserModelLogic_1.UserModelLogic.Instance.getLoginUserData(msg.username);
        if (!userData) {
            //创建帐号
            //唯一ID 当做用户标识，但是建议真的开发时，不要使用该api获取唯一ID来当角色UID ，因为在同一机子上如果没设置好参数，ID可能与临时ID重复，被其他用户顶掉
            let onlyId = SnowDrifting_1.SnowDrifting.Instance.getOnlyId();
            let user = {
                userName: msg.username,
                roleUid: onlyId
            };
            userData = await UserModel_1.UserModel.Instance.insert(user);
        }
        //重新纠正session的uid 并应用到前端服
        session.uid = userData.roleUid;
        session.apply();
        let proto = {
            code: 1,
        };
        //一般来说可以通过next快捷回调协议
        next(Pt100Login_1.Pt100Login.LoginResp10002, proto); //回调的协议号，协议结构体
        //也可以使用该API 发送消息给客户端
        app_1.app.sendMsgByUidSid(Pt100Login_1.Pt100Login.LoginResp10002, proto, [{ uid: session.uid, sid: session.getFrontendSid() }]);
        //通过RPC踢该玩家下线
        app_1.app.rpc(session.getFrontendSid(), RpcEvent_1.RpcEvent.OnKillSocketByUid, session.uid);
    }
}
exports.default = LoginMain;
//# sourceMappingURL=LoginMain.js.map