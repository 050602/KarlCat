"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModelLogic = void 0;
const UserModel_1 = require("../model/UserModel");
const BaseModelLogic_1 = require("./BaseModelLogic");
class UserModelLogic extends BaseModelLogic_1.BaseModelLogic {
    deleteCache(roleUid) {
    }
    cacheRefresh(roleUid) {
        let data17 = UserModelLogic.Instance.getUserData(roleUid);
    }
    static get Instance() {
        return this.getInstance();
    }
    //请注意，要热更此方法，需要把model的cache重新new，否则引用还在旧的单例里 ，假如要热更fetchData方法请参考 RoleSaveDataModelLogic 的 initInstance
    async fetchData(key, staleValue, { options, signal, context }) {
        let data = await UserModel_1.UserModel.Instance.findByRoleUid(key);
        return data;
    }
    async fetchDataString(key, staleValue, { options, signal, context }) {
        let data = await UserModel_1.UserModel.Instance.find(key);
        return data;
    }
    async getUserData(roleUid) {
        return UserModel_1.UserModel.Instance.userDataCache.fetch(roleUid);
    }
    async getLoginUserData(username) {
        return UserModel_1.UserModel.Instance.userDataLoginCache.fetch(username);
    }
}
exports.UserModelLogic = UserModelLogic;
//# sourceMappingURL=UserModelLogic.js.map