import mongoose from "mongoose";
import { errLog, errStackLog, getTrack, logInfo, logServerEx } from "../LogTS";
import { allDataLog, app } from "../app";
import { Sigleton } from "../core/Sigleton";
import { DatabaseEvent } from "../event/DatabaseEvent";
import { DBRecoverWriteInfo } from "../util/interfaceDefine";
import { CommonUtils } from "../utils/CommonUtils";
import { DateUtils } from "../utils/DateUtils";
import { SnowDrifting } from "../utils/SnowDrifting";
import { TSEventCenter } from "../utils/TSEventCenter";
import { MathUtils } from "../utils/MathUtils";
import { ServerType } from "../register/route";
import { DataLog } from "./DataLog";


export class BaseTable extends Sigleton {
    // DB恢复配置
    public static listDataLog: Map<string, DataLog> = new Map<string, DataLog>();
    public tableName: string;
    public implementationData(isEnforce?: boolean): void { };

    private insterRecoverData: Map<any, DBRecoverWriteInfo> = new Map();
    private updateRecoverData: Map<any, DBRecoverWriteInfo> = new Map();
    private deleteRecoverData: Map<any, DBRecoverWriteInfo> = new Map();
    private deleteAllRecoverData: Map<any, DBRecoverWriteInfo> = new Map();

    protected dataLog: DataLog = null;
    protected table: mongoose.Model<any, {}, {}>;
    private implementationTimer: NodeJS.Timeout;
    // private doClearTime: number = 0;
    public initInstance() {
        if (app.serverInfo.serverType != ServerType.database) {
            throw this.tableName + "  致命错误，不允许在非数据库服调用Table" + getTrack();
        }
        if (!this.tableName) {
            this.tableName = this.clsName;
        }
        if (!this.tableName) {
            throw this.tableName + "  致命错误，table name is null" + getTrack();
        }
        CommonUtils.assertEx(this.tableName);

        TSEventCenter.Instance.bindDB(DatabaseEvent.OnFindOneData + this.tableName, this, this.findOne);
        TSEventCenter.Instance.bindDB(DatabaseEvent.OnFindOneDataByObject + this.tableName, this, this.findOneByObject);
        TSEventCenter.Instance.bindDB(DatabaseEvent.OnFindAllData + this.tableName, this, this.findAll);
        TSEventCenter.Instance.bindDB(DatabaseEvent.OnInsertOneData + this.tableName, this, this.insertOne);
        TSEventCenter.Instance.bindDB(DatabaseEvent.OnUpdateOneData + this.tableName, this, this.updateOne);
        TSEventCenter.Instance.bindDB(DatabaseEvent.OnDeleteOneData + this.tableName, this, this.deleteOne);
        TSEventCenter.Instance.bindDB(DatabaseEvent.OnDeleteManyData + this.tableName, this, this.deleteAll);
        TSEventCenter.Instance.bindDB(DatabaseEvent.OnGetRowCount + this.tableName, this, this.OnGetRowCount);


        let msTime: number = MathUtils.randomNumber(1000);
        msTime += 60 * 1000;
        this.implementationTimer = setInterval(this.implementationData.bind(this), msTime);
    };

    public destoryInstance() {
        TSEventCenter.Instance.unbindDB(DatabaseEvent.OnFindOneData + this.tableName);
        TSEventCenter.Instance.unbindDB(DatabaseEvent.OnFindOneDataByObject + this.tableName);
        TSEventCenter.Instance.unbindDB(DatabaseEvent.OnFindAllData + this.tableName);
        TSEventCenter.Instance.unbindDB(DatabaseEvent.OnInsertOneData + this.tableName);
        TSEventCenter.Instance.unbindDB(DatabaseEvent.OnUpdateOneData + this.tableName);
        TSEventCenter.Instance.unbindDB(DatabaseEvent.OnDeleteOneData + this.tableName);
        TSEventCenter.Instance.unbindDB(DatabaseEvent.OnGetRowCount + this.tableName);
        clearInterval(this.implementationTimer);
    };

    /**
     * 初始化容灾日志类
     */
    protected static async initDataLog(table: BaseTable): Promise<void> {
        table.dataLog = new DataLog();
        table.dataLog.init(table.tableName);

        let oldLog: DataLog = allDataLog[table.tableName];
        if (oldLog) {
            await table.dataLog.DataRecoverByFiles(oldLog.initTime, table);
            logServerEx(table.tableName + "数据恢复完成");
        }


        allDataLog[table.tableName] = table.dataLog;
    }

    public static initRecoverInfo(datadb: string) {
        if (datadb != null && datadb.length > 0) {

            let tempDataLog = JSON.parse(datadb);
            let keys = Object.keys(tempDataLog);

            for (let key of keys) {
                allDataLog[key] = tempDataLog[key];
            }
        }
    }


    public static GetRecoverInfo() {
        let recoverData: string = JSON.stringify(allDataLog);
        return recoverData;
    }

    /**
     * 写容灾日志（插入）
     * @param mongokey 用于检查数据重复性的条件，是{ xxx:xxx }格式的
     */
    protected insertRecoverOne(data: any, mongokey: any) {

        let insertLog: DBRecoverWriteInfo = { tbName: this.tableName, opType: "insert", seq: SnowDrifting.Instance.getOnlyId(), pushTime: DateUtils.msSysTick, key: mongokey, value: data };
        this.dataLog.logDBOpt(insertLog);
        this.insterRecoverData.set(data, insertLog);
    }

    /**
     * 写容灾日志（更新）
     * @param key 跟finish对应的key
     * @param mongokey 执行mongo的条件语句，因此一定是{ xxx:xxx }格式的
     */
    protected updateRecoverOne(key: any, data: any, mongokey: any) {

        // 先把老数据标记已完成操作
        let up = this.updateRecoverData.get(key);
        if (up) {
            this.dataLog.MarkedOpFinish(up);
        }

        let updateLog: DBRecoverWriteInfo = { tbName: this.tableName, opType: "update", seq: SnowDrifting.Instance.getOnlyId(), pushTime: DateUtils.msSysTick, key: mongokey, value: data };
        this.dataLog.logDBOpt(updateLog);
        this.updateRecoverData.set(key, updateLog);
    }

    /**
     * 写容灾日志（删除一条）
     * @param key 跟finish对应的key
     * @param mongokey 执行mongo的条件语句，因此一定是{ xxx:xxx }格式的
     */
    protected deleteRecoverOne(key: any, mongokey: any) {

        let deleteLog: DBRecoverWriteInfo = { tbName: this.tableName, opType: "delete", seq: SnowDrifting.Instance.getOnlyId(), pushTime: DateUtils.msSysTick, key: mongokey, value: null };
        this.dataLog.logDBOpt(deleteLog);
        this.deleteRecoverData.set(key, deleteLog);
    }

    /**
     * 写容灾日志（删除所有符合条件所有）
     * @param key 跟finish对应的key
     * @param mongokey 执行mongo的条件语句，因此一定是{ xxx:xxx }格式的
     */
    protected deleteAllRecovere(key: any, mongokey: any) {

        let deleteLog: DBRecoverWriteInfo = { tbName: this.tableName, opType: "deleteall", seq: SnowDrifting.Instance.getOnlyId(), pushTime: DateUtils.msSysTick, key: mongokey, value: null };
        this.dataLog.logDBOpt(deleteLog);
        this.deleteAllRecoverData.set(key, deleteLog);
    }

    /**
     * 标记插入完成
     * 该key必须与insertRecoverOne的key一致
     * @param data 
     */
    protected MarkedInsertFinish(data: any) {

        let data2: any = this.insterRecoverData.get(data);
        if (data2) {
            this.dataLog.MarkedOpFinish(data2);
            this.insterRecoverData.delete(data);
        }
    }

    /**
     * 标记更新完成
     * 该key必须与updateRecoverOne的key一致
     * @param key 
     */
    protected MarkedUpdateFinish(key: any) {

        let data: any = this.updateRecoverData.get(key);
        if (data) {
            this.dataLog.MarkedOpFinish(data);
            this.updateRecoverData.delete(key);
        }
    }

    /**
     * 标记删除完成
     * 该key必须与deleteRecoverOne的key一致
     * @param key 
     */
    protected MarkedDeleteFinish(key: any) {

        let data: any = this.deleteRecoverData.get(key);
        if (data) {
            this.dataLog.MarkedOpFinish(data);
            this.deleteRecoverData.delete(key);
        }
    }

    /**
     * 标记删除所有完成
     * 该key必须与deleteAllRecovere的key一致
     * @param key 
     */
    protected MarkedDeleteAllFinish(key: any) {

        let data: any = this.deleteAllRecoverData.get(key);
        if (data) {
            this.dataLog.MarkedOpFinish(data);
            this.deleteAllRecoverData.delete(key);
        }
    }

    /**
     * 恢复数据
     * @param line 
     */
    public RecoverData(line: string): any {
        logServerEx("Recover-----------" + line);
        try {
            let recover: DBRecoverWriteInfo = JSON.parse(line);
            let opResult: any = false;
            if (recover) {
                switch (recover.opType) {
                    case "insert":
                        {
                            opResult = this.insertOneByRecover(recover.key, recover.value);
                            break;
                        }
                    case "update":
                        {
                            opResult = this.updateOneByRecorver(recover.key, recover.value);
                            break;
                        }
                    case "delete":
                        {
                            opResult = this.deleteOneByRecorver(recover.key);
                            break;
                        }
                    case "deleteall":
                        {
                            opResult = this.deleteAllyRecorver(recover.key);
                            break;
                        }
                };

                if (opResult) {
                    this.dataLog.MarkedOpFinish(recover);
                }

                return opResult;
            }
        } catch (err) {
            errStackLog(this.tableName, line, err?.message);
        }
    }

    protected async insertOne(data: any): Promise<any> {

        let newValue: any;
        const data2 = await this.table.create(data).catch((err) => {
            errLog("insert One 数据插入失败:", err, data);
            logServerEx("insert One 数据插入失败:", err, data);
            // errStackLog(err?.message);
        });
        if (data2) {
            newValue = data2.toObject();
        }

        return newValue;
    }

    private async insertOneByRecover(key: any, data: any): Promise<any> {

        let newValue: any;
        if (key) {
            let ret = await this.findMongokeyOne(key);
            if (ret) {
                logInfo("已经存在" + key + "  忽略恢复");
                return ret;
            }
        }
        const data2 = await this.table.create(data).catch((err) => {
            errLog("insert OneByRecover 数据插入失败 :", err, data);
            logServerEx('insert OneByRecover 数据插入失败')
            // errStackLog(err?.message);
        });
        if (data2) {
            newValue = data2.toObject();
        }

        return newValue;
    }

    protected async findMongokeyOne(cond: any): Promise<any> {
        let data: any = null;
        const value = await this.table.findOne(cond).catch((err) => {
            errLog("findMongokey One 查询失败:", err, cond);
            logServerEx("findMongokey One 查询失败:", err, cond);
            // errStackLog(err?.message);
        });
        if (value) {
            data = value.toObject();
        }
        return data;
    }


    protected async findOne(cond: any): Promise<any> {
        let data: any = null;
        const data2 = await this.table.findOne(cond).catch((err) => {
            errLog("find One 查询失败:", cond, err);
            logServerEx("find One 查询失败:", cond, err);
            // errStackLog(err?.message);
        });
        if (data2) {
            data = data2.toObject();
        }
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
        const data2 = await this.table.findOne(cond).catch((err) => {
            errLog("findOne ByObject 查询失败:", cond, err);
            logServerEx("findOne ByObject 查询失败:", cond, err);
            // errStackLog(err?.message);
        });
        if (data2) {
            data = data2.toObject();
        }
        return data;
    }



    protected async findAll(cond: any): Promise<any[]> {
        let data: any[] = [];
        const data2 = await this.table.find(cond).lean().catch((err) => {
            errLog("find all 查询失败:", JSON.stringify(cond), err?.message);
            logServerEx("find all 查询失败:", JSON.stringify(cond), err?.message);
            // errStackLog(err?.message);
        });
        if (data2) {
            data = data2;
        }
        return data;
    }

    protected async updateOne(cond: any, data: any): Promise<boolean> {

        const back = await this.table.updateOne(cond, data).catch((err) => {
            errLog("updateOne 更新失败:", err, JSON.stringify(cond), JSON.stringify(data));
            logServerEx("updateOne 更新失败:", err, JSON.stringify(cond), JSON.stringify(data));
            // errStackLog(err?.message);
        });
        if (!this.isUpdateResultSuccess(back)) {
            return false;
        }
        return true;
    }

    private async updateOneByRecorver(cond: any, data: any): Promise<boolean> {
        const back = await this.table.updateOne(cond, data).catch((err) => {
            errLog("updateOneByRecorver 更新失败:", err, JSON.stringify(cond), JSON.stringify(data));
            logServerEx("updateOneByRecorver 更新失败:", err, JSON.stringify(cond), JSON.stringify(data));
            // errStackLog(err?.message);
        });

        if (!this.isUpdateResultSuccess(back)) {
            return false;
        }

        return true;
    }

    private isUpdateResultSuccess(back: any): boolean {
        if (!back || back.acknowledged === false) {
            return false;
        }
        const modifiedCount = back.modifiedCount ?? back.nModified ?? 0;
        const matchedCount = back.matchedCount ?? back.n ?? 0;
        const upsertedCount = back.upsertedCount ?? 0;
        if (modifiedCount > 0 || matchedCount > 0 || upsertedCount > 0) {
            return true;
        }
        return false;
    }

    protected async deleteOne(cond: any): Promise<boolean> {

        const back = await this.table.deleteOne(cond).catch((err) => {
            errLog("deleteOne 删除失败:", err, cond, JSON.stringify(cond));
            logServerEx("deleteOne 删除失败:", err, cond, JSON.stringify(cond));
            // errStackLog(err?.message);
        });
        if (!back || back.deletedCount <= 0) {
            return false;
        }
        return true;
    }

    private async deleteOneByRecorver(cond: any): Promise<boolean> {

        const back = await this.table.deleteOne(cond).catch((err) => {
            errLog("deleteOneByRecorver 删除失败:", err, JSON.stringify(cond));
            logServerEx("deleteOneByRecorver 删除失败:", err, JSON.stringify(cond));
            // errStackLog(err?.message);
        });
        if (!back || back.deletedCount <= 0) {
            return false;
        }
        return true;
    }


    //deleteAll
    protected async deleteAll(cond: any): Promise<boolean> {

        const back = await this.table.deleteMany(cond).lean().catch((err) => {
            errLog("deleteAll 删除失败:", err, JSON.stringify(cond));
            logServerEx("deleteAll 删除失败:", err, JSON.stringify(cond));
            // errStackLog(err?.message);
        });

        if (!back || back.deletedCount <= 0) {
            return false;
        }
        return true;
    }

    public async OnGetRowCount(cond: any = {}): Promise<number> {
        let cnt = await this.table.countDocuments(cond);
        return cnt;
    }

    // protected async OnGetOnlyNextId(idType: number): Promise<any> {
    //     return true;
    // }

    private async deleteAllyRecorver(cond: any): Promise<boolean> {
        const back = await this.table.deleteMany(cond).lean().catch((err) => {
            errLog("delete AllyRecorver 删除失败:", err, cond);
            logServerEx("delete AllyRecorver 删除失败:", err, cond);
            // errStackLog(err?.message);
        });
        if (!back || back.deletedCount <= 0) {
            return false;
        }
        return true;
    }

    public getTable(): mongoose.Model<any, {}, {}> {
        return this.table;
    }

    // 清除指定角色的缓存
    public deleteRoleCache(uid: number): boolean {
        return true;
    }
}
