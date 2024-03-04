"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseModel = void 0;
const app_1 = require("../app");
const Sigleton_1 = require("../core/Sigleton");
const DatabaseEvent_1 = require("../event/DatabaseEvent");
const route_1 = require("../register/route");
//请不要在Model里写任何逻辑
class BaseModel extends Sigleton_1.Sigleton {
    //当实例初始化时
    initInstance() {
        super.initInstance();
        if (!this.tableName)
            this.tableName = this.clsName.replace('Model', 'Table');
    }
    ;
    async insertOne(data) {
        // console.log('in base model, insert one, table:', this.tableName);
        return app_1.app.rpcDB(BaseModel.dbName, DatabaseEvent_1.DatabaseEvent.OnInsertOneData + this.tableName, data);
    }
    async findOne(cond) {
        // console.log('in base model, find one, table:', this.tableName);
        return app_1.app.rpcDB(BaseModel.dbName, DatabaseEvent_1.DatabaseEvent.OnFindOneData + this.tableName, cond);
    }
    /**
     * 该方法理论上跟findOne一毛一样，主要用来区分findOne ,让 findOne可以用单一key做Map缓存
     * 此处不能直接调用findOne  因为在子类时，会调用到子类的findOne
     * @param cond
     * @returns
     */
    async findOneByObject(cond) {
        // console.log('in base model, find one by object, table:', this.tableName);
        return app_1.app.rpcDB(BaseModel.dbName, DatabaseEvent_1.DatabaseEvent.OnFindOneDataByObject + this.tableName, cond);
    }
    async findAll(cond) {
        return app_1.app.rpcDB(BaseModel.dbName, DatabaseEvent_1.DatabaseEvent.OnFindAllData + this.tableName, cond);
    }
    async updateOne(cond, data) {
        return app_1.app.rpcDB(BaseModel.dbName, DatabaseEvent_1.DatabaseEvent.OnUpdateOneData + this.tableName, cond, data);
    }
    async deleteOne(cond) {
        return app_1.app.rpcDB(BaseModel.dbName, DatabaseEvent_1.DatabaseEvent.OnDeleteOneData + this.tableName, cond);
    }
    /**
     * 统计数量
     */
    async countNum(cond) {
        return app_1.app.rpcDB(BaseModel.dbName, DatabaseEvent_1.DatabaseEvent.OnCount + this.tableName, cond);
    }
    /**
     * 获取唯一字段列表
     */
    async distinctList(field, cond) {
        return app_1.app.rpcDB(BaseModel.dbName, DatabaseEvent_1.DatabaseEvent.OnDistinct + this.tableName, field, cond);
    }
}
exports.BaseModel = BaseModel;
//请不要在Model里写任何逻辑
BaseModel.dbName = route_1.ServerType.database + "-1";
//# sourceMappingURL=BaseModel.js.map