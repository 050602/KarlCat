import { BaseServerLogic } from "../../components/BaseServerLogic";
import { Session } from "../../components/session";
import LoginTable from "../../database/LoginTable";
import RoleTable from "../../database/RoleTable";
import { KalrEvent } from "../../event/KalrEvent";
import { lanlu } from "../../proto/protobuf/proto.js.js";
import { TSEventCenter } from "../../utils/TSEventCenter";

export default class GateMain extends BaseServerLogic {
    public static SigletonInsName = "GateMain";
    public static get Instance(): GateMain {
        return super.getInstance(GateMain);
    }
    public initInstance(): void {
        //接受前端服数据 ---注意，前端服只能接收到前端服的消息以及RPC消息
        TSEventCenter.Instance.bind(KalrEvent.FrontendServerDoFuntion + "100_1", this, this.onLogin);
        TSEventCenter.Instance.bind(KalrEvent.FrontendServerDoFuntion + "100_2", this, this.onExit);//退出登录
        TSEventCenter.Instance.bind(KalrEvent.FrontendServerDoFuntion + "100_3", this, this.onEnterRole);//进入游戏
    }


    public destoryInstance(): void {
        TSEventCenter.Instance.unbind(KalrEvent.FrontendServerDoFuntion + "100_1", this,);
        TSEventCenter.Instance.unbind(KalrEvent.FrontendServerDoFuntion + "100_2", this,);//退出登录
        TSEventCenter.Instance.unbind(KalrEvent.FrontendServerDoFuntion + "100_3", this,);//进入游戏
    }

    async onExit(msg: lanlu.IPt100_2_tos, session: Session, next: Function) {

    }

    async onEnterRole(msg: lanlu.IPt100_3_tos, session: Session, next: Function) {
        let data: lanlu.IPt100_3_toc;
        let role = await RoleTable.find(msg.roleId);
        if (role != null) {
            data = {
                code: 1  // 错误码 0失败 1成功-加载场景 2登录太频繁 3IP黑名单 4帐号被禁 5账号在其他地方登陆 6封号 7买卖元宝封号 8不正当竞争封号 9状态不正常 10所有账号登陆都被禁止 11服务器维护
            };
        } else {
            data = {
                code: 1  // 错误码 0失败 1成功-加载场景 2登录太频繁 3IP黑名单 4帐号被禁 5账号在其他地方登陆 6封号 7买卖元宝封号 8不正当竞争封号 9状态不正常 10所有账号登陆都被禁止 11服务器维护
            };
        }
        next(data);
    }

    async onLogin(msg: lanlu.IPt100_1_tos, session: Session, next: Function) {
        let database = await LoginTable.find(msg.userName);

        let data: lanlu.IPt100_1_toc;
        if (!database) {
            console.log(msg.userName, msg.passWord);
            //完全找不到数据返回错误
            //登录失败
            data = {
                serverId: -1,
                serverTime: 0,
                roleList: [],
                code: 0  // 错误码 0失败 1成功-加载场景 2登录太频繁 3IP黑名单 4帐号被禁 5账号在其他地方登陆 6封号 7买卖元宝封号 8不正当竞争封号 9状态不正常 10所有账号登陆都被禁止 11服务器维护
            };

        } else if (database.password == msg.passWord) {
            //登录成功
            //分配一个服务器给玩家使用  此处经过一系列复杂的逻辑后，给玩家分配一个没那么忙的服务器

            let roledate = await RoleTable.findAll(database._id);
            let arr = [];
            for (let i = 0; i < roledate.length; i++) {
                arr.push(roledate[i]._id);
            }
            data = {
                serverId: 1,
                serverTime: Date.now(),
                roleList: arr,
                code: 1  // 错误码 0失败 1成功-加载场景 2登录太频繁 3IP黑名单 4帐号被禁 5账号在其他地方登陆 6封号 7买卖元宝封号 8不正当竞争封号 9状态不正常 10所有账号登陆都被禁止 11服务器维护
            };

            session.set({ "serverId": 1 })


        } else {
            //登录失败
            data = {
                serverId: -1,
                serverTime: 0,
                roleList: [],
                code: 0  // 错误码 0失败 1成功-加载场景 2登录太频繁 3IP黑名单 4帐号被禁 5账号在其他地方登陆 6封号 7买卖元宝封号 8不正当竞争封号 9状态不正常 10所有账号登陆都被禁止 11服务器维护
            };
        }
        next(data);

    }
}