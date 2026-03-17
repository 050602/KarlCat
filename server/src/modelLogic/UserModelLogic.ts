import { logInfo } from "../LogTS";
import { UserModel } from "../model/UserModel";
import { DateUtils } from "../utils/DateUtils";
import { UserData } from "../database/UserTable";
import { BaseModelLogic } from "./BaseModelLogic";
import { CONFIG_PATH, FileUtils, TXT_SUFFIX } from "../utils/FileUtils";

export class UserModelLogic extends BaseModelLogic {
    public static get Instance(): UserModelLogic {
        return this.getInstance();
    }

    // 覆盖基类：初始化 UserData（当数据库中不存在时创建）
    protected async initModelData(roleUid: number): Promise<UserData> {
        // UserModel 的主键不是 roleUid，这里不应该被调用
        // 如果需要初始化用户，应该在业务层处理
        return null;
    }

    // UserModel 特殊：按 roleUid 查询
    public async getUserData(roleUid: number): Promise<UserData> {
        return this.refreshAndReturn(roleUid);
    }

    // 登录用：按 username 查询（不走缓存，直接 RPC 到 DB）
    public async getLoginUserData(username: string): Promise<UserData> {
        return UserModel.Instance.findOne({ userName: username });
    }

    // UserModel 特殊：按 MD5 查询（用于登录）
    public async getUserDataByMD5(md5: string): Promise<UserData> {
        return UserModel.Instance.userDataLoginCache.fetch(md5);
    }

    // 生成登录 MD5
    public getMd5(os: number, channel: string, userkey: string): string {
        let time = DateUtils.sysTick;
        let str = userkey + os + time + channel;
        let md5 = require('crypto').createHash('md5').update(str).digest('hex');
        return md5;
    }

    // 账号激活码存储
    public accountActivationData: Set<string>;

    // 加载激活码配置
    public async getAccountActivation() {
        let path = CONFIG_PATH + "account" + TXT_SUFFIX;
        let arr: string = await FileUtils.Instance.readFile(path);
        let dtg: string[] = arr.split('\r\n');
        dtg.forEach((item, index) => {
            if (!item) {
                dtg.splice(index, 1)
            }
        });
        this.accountActivationData = new Set();
        for (let i = 0; i < dtg.length; i++) {
            this.accountActivationData.add(dtg[i])
        }
        logInfo("激活码长度", this.accountActivationData.size);
    }

    // 验证激活码是否有效
    public getAccountActivationTotal(ac: string): boolean {
        if (this.accountActivationData) {
            if (this.accountActivationData.size == 0) {
                return true;
            }
            if (this.accountActivationData.has(ac)) {
                logInfo("可进入");
                return true;
            } else {
                logInfo("输入账号不为激活码");
                return false;
            }
        } else {
            return true;
        }
    }
}