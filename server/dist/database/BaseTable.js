"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseTable = void 0;
const app_1 = require("../app");
const Sigleton_1 = require("../core/Sigleton");
const DatabaseEvent_1 = require("../event/DatabaseEvent");
const route_1 = require("../register/route");
const TSEventCenter_1 = require("../utils/TSEventCenter");
class BaseTable extends Sigleton_1.Sigleton {
    //落地方法
    implementationData(isEnforce) { }
    ;
    initInstance() {
        if (app_1.app.serverInfo.serverType != route_1.ServerType.database) {
            throw this.tableName + "  致命错误，不允许在非数据库服调用Table";
        }
        if (!this.tableName) {
            this.tableName = this.clsName;
        }
        if (!this.tableName) {
            throw this.tableName + "  致命错误，table name is null";
        }
        TSEventCenter_1.TSEventCenter.Instance.bindDB(DatabaseEvent_1.DatabaseEvent.OnFindOneData + this.tableName, this, this.findOne);
        TSEventCenter_1.TSEventCenter.Instance.bindDB(DatabaseEvent_1.DatabaseEvent.OnFindOneDataByObject + this.tableName, this, this.findOneByObject);
        TSEventCenter_1.TSEventCenter.Instance.bindDB(DatabaseEvent_1.DatabaseEvent.OnFindAllData + this.tableName, this, this.findAll);
        TSEventCenter_1.TSEventCenter.Instance.bindDB(DatabaseEvent_1.DatabaseEvent.OnInsertOneData + this.tableName, this, this.insertOne);
        TSEventCenter_1.TSEventCenter.Instance.bindDB(DatabaseEvent_1.DatabaseEvent.OnUpdateOneData + this.tableName, this, this.updateOne);
        TSEventCenter_1.TSEventCenter.Instance.bindDB(DatabaseEvent_1.DatabaseEvent.OnDeleteOneData + this.tableName, this, this.deleteOne);
        TSEventCenter_1.TSEventCenter.Instance.bindDB(DatabaseEvent_1.DatabaseEvent.OnDeleteManyData + this.tableName, this, this.deleteAll);
        TSEventCenter_1.TSEventCenter.Instance.bindDB(DatabaseEvent_1.DatabaseEvent.OnCount + this.tableName, this, this.countNum);
        TSEventCenter_1.TSEventCenter.Instance.bindDB(DatabaseEvent_1.DatabaseEvent.OnDistinct + this.tableName, this, this.distinctList);
        this.implementationTimer = setInterval(this.implementationData.bind(this), 5 * 1000);
    }
    ;
    destoryInstance() {
        TSEventCenter_1.TSEventCenter.Instance.unbindDB(DatabaseEvent_1.DatabaseEvent.OnFindOneData + this.tableName);
        TSEventCenter_1.TSEventCenter.Instance.unbindDB(DatabaseEvent_1.DatabaseEvent.OnFindOneDataByObject + this.tableName);
        TSEventCenter_1.TSEventCenter.Instance.unbindDB(DatabaseEvent_1.DatabaseEvent.OnFindAllData + this.tableName);
        TSEventCenter_1.TSEventCenter.Instance.unbindDB(DatabaseEvent_1.DatabaseEvent.OnInsertOneData + this.tableName);
        TSEventCenter_1.TSEventCenter.Instance.unbindDB(DatabaseEvent_1.DatabaseEvent.OnUpdateOneData + this.tableName);
        TSEventCenter_1.TSEventCenter.Instance.unbindDB(DatabaseEvent_1.DatabaseEvent.OnDeleteOneData + this.tableName);
        TSEventCenter_1.TSEventCenter.Instance.unbindDB(DatabaseEvent_1.DatabaseEvent.OnCount + this.tableName);
        TSEventCenter_1.TSEventCenter.Instance.unbindDB(DatabaseEvent_1.DatabaseEvent.OnDistinct + this.tableName);
        clearInterval(this.implementationTimer);
    }
    ;
    async insertOne(data) {
        let newValue;
        await this.table.create(data).then((value) => {
            if (value) {
                newValue = value.toObject();
            }
        }).catch((err) => {
            console.error("insert one 数据插入失败:", err, data);
        });
        return newValue;
    }
    async findMongokeyOne(cond) {
        let data = null;
        await this.table.findOne(cond).then((value) => {
            if (value) {
                data = value.toObject();
            }
        }).catch((err) => {
            console.error("find mongo key one 查询失败:", err, cond);
        });
        return data;
    }
    async findOne(cond) {
        let data = null;
        await this.table.findOne(cond).then((value) => {
            if (value) {
                data = value.toObject();
            }
        }).catch((err) => {
            console.error("find one 查询失败:", err, cond);
        });
        return data;
    }
    /**
     * 该方法理论上跟findOne一毛一样，主要用来区分findOne ,让 findOne可以用单一key做Map缓存
     * 此处不能直接调用findOne  因为在子类时，会调用到子类的findOne
     * @param cond
     * @returns
     */
    async findOneByObject(cond) {
        let data = null;
        await this.table.findOne(cond).then((value) => {
            if (value) {
                data = value.toObject();
            }
        }).catch((err) => {
            console.error("find one by object 查询失败:", err, cond);
        });
        return data;
    }
    async findAll(cond) {
        let data = [];
        await this.table.find(cond).lean().then((value) => {
            data = value;
            if (!data) {
                console.error(this.tableName, cond);
            }
        }).catch((err) => {
            console.error("find all 查询失败:", cond, err);
        });
        return data;
    }
    async updateOne(cond, data) {
        await this.table.updateOne(cond, data).then((value) => {
        }).catch((err) => {
            console.error("update one 更新失败:", err, data);
            return false;
        });
        return true;
    }
    async deleteOne(cond) {
        await this.table.deleteOne(cond).then(() => {
            // errLog("删除成功", username);
        }).catch((err) => {
            console.error("delete one 删除失败:", err, cond);
            return false;
        });
        return true;
    }
    //deleteAll
    async deleteAll(cond) {
        await this.table.deleteMany(cond).lean().then(() => {
            // errLog("删除成功", username);
        }).catch((err) => {
            console.error("delete all 删除失败:", err, cond);
            return false;
        });
        return true;
    }
    async countNum(cond) {
        let data = 0;
        await this.table.count(cond).then((value) => {
            if (value) {
                data = value;
            }
        }).catch((err) => {
            console.error("count  查询失败:", err, cond);
        });
        return data;
    }
    async distinctList(field, cond) {
        let data = [];
        await this.table.distinct(field, cond).then((value) => {
            if (value) {
                data = value;
            }
        }).catch((err) => {
            console.error("distinctList  查询失败:", err, cond);
        });
        return data;
    }
}
exports.BaseTable = BaseTable;
//# sourceMappingURL=BaseTable.js.map