"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseServerLogic_1 = require("../../components/BaseServerLogic");
const LoginTable_1 = __importDefault(require("../../database/LoginTable"));
const RoleTable_1 = __importDefault(require("../../database/RoleTable"));
const KalrEvent_1 = require("../../event/KalrEvent");
const TSEventCenter_1 = require("../../utils/TSEventCenter");
class GateMain extends BaseServerLogic_1.BaseServerLogic {
    static get Instance() {
        return super.getInstance(GateMain);
    }
    initInstance() {
        //接受前端服数据 ---注意，前端服只能接收到前端服的消息以及RPC消息
        TSEventCenter_1.TSEventCenter.Instance.bind(KalrEvent_1.KalrEvent.FrontendServerDoFuntion + "100_1", this, this.onLogin);
        TSEventCenter_1.TSEventCenter.Instance.bind(KalrEvent_1.KalrEvent.FrontendServerDoFuntion + "100_2", this, this.onExit); //退出登录
        TSEventCenter_1.TSEventCenter.Instance.bind(KalrEvent_1.KalrEvent.FrontendServerDoFuntion + "100_3", this, this.onEnterRole); //进入游戏
    }
    destoryInstance() {
        TSEventCenter_1.TSEventCenter.Instance.unbind(KalrEvent_1.KalrEvent.FrontendServerDoFuntion + "100_1", this);
        TSEventCenter_1.TSEventCenter.Instance.unbind(KalrEvent_1.KalrEvent.FrontendServerDoFuntion + "100_2", this); //退出登录
        TSEventCenter_1.TSEventCenter.Instance.unbind(KalrEvent_1.KalrEvent.FrontendServerDoFuntion + "100_3", this); //进入游戏
    }
    async onExit(msg, session, next) {
    }
    async onEnterRole(msg, session, next) {
        let data;
        let role = await RoleTable_1.default.find(msg.roleId);
        if (role != null) {
            data = {
                code: 1 // 错误码 0失败 1成功-加载场景 2登录太频繁 3IP黑名单 4帐号被禁 5账号在其他地方登陆 6封号 7买卖元宝封号 8不正当竞争封号 9状态不正常 10所有账号登陆都被禁止 11服务器维护
            };
        }
        else {
            data = {
                code: 1 // 错误码 0失败 1成功-加载场景 2登录太频繁 3IP黑名单 4帐号被禁 5账号在其他地方登陆 6封号 7买卖元宝封号 8不正当竞争封号 9状态不正常 10所有账号登陆都被禁止 11服务器维护
            };
        }
        next(data);
    }
    async onLogin(msg, session, next) {
        let database = await LoginTable_1.default.find(msg.userName);
        let data;
        if (!database) {
            console.log(msg.userName, msg.passWord);
            //完全找不到数据返回错误
            //登录失败
            data = {
                serverId: -1,
                serverTime: 0,
                roleList: [],
                code: 0 // 错误码 0失败 1成功-加载场景 2登录太频繁 3IP黑名单 4帐号被禁 5账号在其他地方登陆 6封号 7买卖元宝封号 8不正当竞争封号 9状态不正常 10所有账号登陆都被禁止 11服务器维护
            };
        }
        else if (database.password == msg.passWord) {
            //登录成功
            //分配一个服务器给玩家使用  此处经过一系列复杂的逻辑后，给玩家分配一个没那么忙的服务器
            let roledate = await RoleTable_1.default.findAll(database._id);
            let arr = [];
            for (let i = 0; i < roledate.length; i++) {
                arr.push(roledate[i]._id);
            }
            data = {
                serverId: 1,
                serverTime: Date.now(),
                roleList: arr,
                code: 1 // 错误码 0失败 1成功-加载场景 2登录太频繁 3IP黑名单 4帐号被禁 5账号在其他地方登陆 6封号 7买卖元宝封号 8不正当竞争封号 9状态不正常 10所有账号登陆都被禁止 11服务器维护
            };
            session.set({ "serverId": 1 });
        }
        else {
            //登录失败
            data = {
                serverId: -1,
                serverTime: 0,
                roleList: [],
                code: 0 // 错误码 0失败 1成功-加载场景 2登录太频繁 3IP黑名单 4帐号被禁 5账号在其他地方登陆 6封号 7买卖元宝封号 8不正当竞争封号 9状态不正常 10所有账号登陆都被禁止 11服务器维护
            };
        }
        next(data);
    }
}
exports.default = GateMain;
GateMain.SigletonInsName = "GateMain";
//# sourceMappingURL=GateMain.js.map