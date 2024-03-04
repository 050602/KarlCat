"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const lru_cache_1 = __importDefault(require("lru-cache"));
const app_1 = require("../app");
const UserModelLogic_1 = require("../modelLogic/UserModelLogic");
const route_1 = require("../register/route");
const BaseModel_1 = require("./BaseModel");
//请不要在Model里写任何逻辑
class UserModel extends BaseModel_1.BaseModel {
    static get Instance() {
        return this.getInstance();
    }
    initInstance() {
        //新增的缓存，需要在RoleRpcMain 的 updateOnlineCache 方法处理一次get 避免因为在线很久，把缓存清除了
        let options = {
            // max: 3333,//最大缓存条数,理论上按同时在线玩家的2倍处理即可？理论上单服3000人，那就6000
            ttl: 1000 * 60 * 5,
            ttlAutopurge: true,
            //在从缓存中移除之前返回过期的项目? LRU
            allowStale: false,
            updateAgeOnGet: true,
            updateAgeOnHas: false,
            ignoreFetchAbort: true,
            //如果缓存中没有指定值，调用cache.fetch时，会调用以下方法，并把方法的返回值，返回,,,就是说，如果缓存中存在，是不会调用该方法的; ps:该方法会自动把返回值设置进缓存内
            fetchMethod: UserModelLogic_1.UserModelLogic.Instance.fetchData,
            fetchContext: UserModelLogic_1.UserModelLogic.Instance,
        };
        this.userDataCache = new lru_cache_1.default(options);
        //在gate时，缩短缓存时间
        if (app_1.app.serverType == route_1.ServerType.gate) {
            let options2 = {
                // max: 8000,//最大缓存条数,理论上按同时在线玩家的2倍处理即可？理论上单服3000人，那就6000
                ttl: 1000 * 10,
                ttlAutopurge: true,
                //在从缓存中移除之前返回过期的项目? LRU
                allowStale: false,
                updateAgeOnGet: true,
                updateAgeOnHas: false,
                ignoreFetchAbort: true,
                //如果缓存中没有指定值，调用cache.fetch时，会调用以下方法，并把方法的返回值，返回,,,就是说，如果缓存中存在，是不会调用该方法的; ps:该方法会自动把返回值设置进缓存内
                fetchMethod: UserModelLogic_1.UserModelLogic.Instance.fetchDataString,
                fetchContext: UserModelLogic_1.UserModelLogic.Instance,
            };
            this.userDataLoginCache = new lru_cache_1.default(options2);
        }
    }
    ;
    destoryInstance() {
    }
    ;
    async insert(data) {
        return super.insertOne(data);
    }
    async find(username) {
        return super.findOne(username);
    }
    async findByRoleUid(roleUid) {
        return super.findOneByObject({ roleUid: roleUid });
    }
    /**
     * 该方法理论上跟findOne一毛一样，主要用来区分findOne ,让 findOne可以用单一key做Map缓存
     * 此处不能直接调用findOne  因为在子类时，会调用到子类的findOne 该方法无法保证取到最新的数据，因为数据需要落地
     * @param cond
     * @returns
     */
    async findByObject(cond) {
        return super.findOneByObject(cond);
    }
    async findAllByAny(cond) {
        return super.findAll(cond);
    }
    async deleteOne(username) {
        return super.deleteOne(username);
    }
    async update(userName, data) {
        return super.updateOne(userName, data);
    }
}
exports.UserModel = UserModel;
UserModel.SigletonInsName = "UserModel";
//# sourceMappingURL=UserModel.js.map