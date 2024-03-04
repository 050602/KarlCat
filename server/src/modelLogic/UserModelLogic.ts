import { UserData } from "../database/UserTable";
import { UserModel } from "../model/UserModel";
import { DateUtils } from "../utils/DateUtils";
import { CONFIG_PATH, FileUtils, TXT_SUFFIX } from "../utils/FileUtils";
import { BaseModelLogic } from "./BaseModelLogic";

export class UserModelLogic extends BaseModelLogic {
    public deleteCache(roleUid: number): void {
    }
    public cacheRefresh(roleUid: number): void {
        let data17 = UserModelLogic.Instance.getUserData(roleUid);
    }
    public static get Instance(): UserModelLogic {
        return this.getInstance();
    }


    //请注意，要热更此方法，需要把model的cache重新new，否则引用还在旧的单例里 ，假如要热更fetchData方法请参考 RoleSaveDataModelLogic 的 initInstance
    public async fetchData(key: number, staleValue: any, { options, signal, context }: { options: any, signal: any, context: UserModelLogic }) {
        let data = await UserModel.Instance.findByRoleUid(key);
        return data;
    }

    public async fetchDataString(key: string, staleValue: any, { options, signal, context }: { options: any, signal: any, context: UserModelLogic }) {
        let data = await UserModel.Instance.find(key);
        return data;
    }


    public async getUserData(roleUid: number): Promise<UserData> {
        return UserModel.Instance.userDataCache.fetch(roleUid);
    }

    public async getLoginUserData(username: string): Promise<UserData> {
        return UserModel.Instance.userDataLoginCache.fetch(username);
    }



}