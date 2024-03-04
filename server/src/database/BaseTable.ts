import mongoose from "mongoose";
import { app } from "../app";
import { Sigleton } from "../core/Sigleton";
import { DatabaseEvent } from "../event/DatabaseEvent";
import { ServerType } from "../register/route";
import { TSEventCenter } from "../utils/TSEventCenter";


export class BaseTable extends Sigleton {
    public tableName: string;
    //落地方法
    public implementationData(isEnforce?: boolean): void { };

    protected table: mongoose.Model<any, {}, {}>;
    private implementationTimer: NodeJS.Timeout;

    public initInstance() {
        if (app.serverInfo.serverType != ServerType.database) {
            throw this.tableName + "  致命错误，不允许在非数据库服调用Table" ;
        }
        if (!this.tableName) {
            this.tableName = this.clsName;
        }
        if (!this.tableName) {
            throw this.tableName + "  致命错误，table name is null";
        }

        TSEventCenter.Instance.bindDB(DatabaseEvent.OnFindOneData + this.tableName, this, this.findOne);
        TSEventCenter.Instance.bindDB(DatabaseEvent.OnFindOneDataByObject + this.tableName, this, this.findOneByObject);
        TSEventCenter.Instance.bindDB(DatabaseEvent.OnFindAllData + this.tableName, this, this.findAll);
        TSEventCenter.Instance.bindDB(DatabaseEvent.OnInsertOneData + this.tableName, this, this.insertOne);
        TSEventCenter.Instance.bindDB(DatabaseEvent.OnUpdateOneData + this.tableName, this, this.updateOne);
        TSEventCenter.Instance.bindDB(DatabaseEvent.OnDeleteOneData + this.tableName, this, this.deleteOne);
        TSEventCenter.Instance.bindDB(DatabaseEvent.OnDeleteManyData + this.tableName, this, this.deleteAll);
        TSEventCenter.Instance.bindDB(DatabaseEvent.OnCount + this.tableName, this, this.countNum);
        TSEventCenter.Instance.bindDB(DatabaseEvent.OnDistinct + this.tableName, this, this.distinctList);

        this.implementationTimer = setInterval(this.implementationData.bind(this), 5 * 1000);
    };

    public destoryInstance() {
        TSEventCenter.Instance.unbindDB(DatabaseEvent.OnFindOneData + this.tableName);
        TSEventCenter.Instance.unbindDB(DatabaseEvent.OnFindOneDataByObject + this.tableName);
        TSEventCenter.Instance.unbindDB(DatabaseEvent.OnFindAllData + this.tableName);
        TSEventCenter.Instance.unbindDB(DatabaseEvent.OnInsertOneData + this.tableName);
        TSEventCenter.Instance.unbindDB(DatabaseEvent.OnUpdateOneData + this.tableName);
        TSEventCenter.Instance.unbindDB(DatabaseEvent.OnDeleteOneData + this.tableName);
        TSEventCenter.Instance.unbindDB(DatabaseEvent.OnCount + this.tableName);
        TSEventCenter.Instance.unbindDB(DatabaseEvent.OnDistinct + this.tableName);
        clearInterval(this.implementationTimer);
    };

    protected async insertOne(data: any): Promise<any> {
        let newValue: any;
        await this.table.create(data).then((value) => {
            if (value) {
                newValue = value.toObject();
            }
        }).catch((err) => {
            console.error("insert one 数据插入失败:", err, data);
        });
        return newValue;
    }

    protected async findMongokeyOne(cond: any): Promise<any> {
        let data: any = null;
        await this.table.findOne(cond).then((value) => {
            if (value) {
                data = value.toObject();
            }
        }).catch((err) => {
            console.error("find mongo key one 查询失败:", err, cond);
        });

        return data;
    }


    protected async findOne(cond: any): Promise<any> {
        let data: any = null;
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
    protected async findOneByObject(cond: any): Promise<any> {
        let data: any = null;
        await this.table.findOne(cond).then((value) => {
            if (value) {
                data = value.toObject();
            }
        }).catch((err) => {
            console.error("find one by object 查询失败:", err, cond);
        });
        return data;
    }

    protected async findAll(cond: any): Promise<any[]> {
        let data: any[] = [];
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

    protected async updateOne(cond: any, data: any): Promise<boolean> {
        await this.table.updateOne(cond, data).then((value) => {
        }).catch((err) => {
            console.error("update one 更新失败:", err, data);
            return false;
        });

        return true;
    }

    protected async deleteOne(cond: any): Promise<boolean> {
        await this.table.deleteOne(cond).then(() => {
            // errLog("删除成功", username);
        }).catch((err) => {
            console.error("delete one 删除失败:", err, cond);
            return false;
        });

        return true;
    }

    //deleteAll
    protected async deleteAll(cond: any): Promise<boolean> {
        await this.table.deleteMany(cond).lean().then(() => {
            // errLog("删除成功", username);
        }).catch((err) => {
            console.error("delete all 删除失败:", err, cond);
            return false;
        });

        return true;
    }

    protected async countNum(cond: any): Promise<number>{
        let data: number = 0;
        await this.table.count(cond).then((value) => {
            if (value) {
                data = value;
            }
        }).catch((err) => {
            console.error("count  查询失败:", err, cond);
        });
        return data;
    }

    protected async distinctList(field: string, cond: any): Promise<any[]> {
        let data: any[] = [];
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