import mongoose from "mongoose";
import { allTables } from "../app";
import { TTLBaseCache } from "../utils/TTLBaseCache";
import { BaseTable } from "./BaseTable";


export class BaseOneKeyTable extends BaseTable {
    public static get Instance(): BaseOneKeyTable {
        return this.getInstance();
    }

    public tableTTLCache: TTLBaseCache<number, any>;
    protected uniqueKey: string = "";
    protected table: mongoose.Model<any, {}, {}>;
    protected schema: mongoose.Schema;

    public init(db: mongoose.Mongoose) {
        this.schema = this.initSchema();
        this.uniqueKey = this.getUniqueKey();

        this.table = db.model(this.tableName, this.schema);
        allTables.push(this);
        BaseTable.initDataLog(this);

        let options2 = {
            ttl: 1000 * 60 * 180,
            interval: 1000 * 60,
            updateAgeOnGet: true,
            updateAgeOnHas: false
        };
        this.tableTTLCache = new TTLBaseCache<number, any>(options2);
    }

    protected initSchema(): mongoose.Schema {
        throw new Error("need implemented in subclass");
    }

    protected getUniqueKey(): string {
        throw new Error("need implemented in subclass");
    }

    //数据库数据落地
    public async implementationData(isEnforce: boolean) {
    }

    public async findOne(uniqueId: number): Promise<any> {
        let data: any = this.tableTTLCache.get(uniqueId);
        if (!data) {
            data = await super.findOne({ [this.uniqueKey]: uniqueId });
            if (data) {
                this.tableTTLCache.set(uniqueId, data);
            }
        }
        return data;
    }

    public async findAll(cond: any = {}): Promise<any[]> {
        let data: any[];
        data = await super.findAll(cond);
        return data;
    }

    public async insertOne(data: any): Promise<any> {
        super.insertRecoverOne(data, { [this.uniqueKey]: data[this.uniqueKey] });
        let insertData = await super.insertOne(data);
        if (insertData) {
            super.MarkedInsertFinish(data);
            this.dataLog.updateLastWriteTime();
        }
        this.tableTTLCache.set(data[this.uniqueKey], insertData);
        return insertData;
    }

    public async updateOne(uniqueId: number, data: any): Promise<boolean> {
        super.updateRecoverOne(this.uniqueKey, data, { [this.uniqueKey]: uniqueId });
        let updateResult: boolean = await super.updateOne({ [this.uniqueKey]: uniqueId }, data);
        if (updateResult) {
            super.MarkedUpdateFinish(uniqueId);
            this.dataLog.updateLastWriteTime();
        }

        let last = this.tableTTLCache.get(uniqueId);
        if (last) {
            for (let key in data) {
                if (data.hasOwnProperty(key)) {
                    last[key] = data[key];
                }
            }
        }
        return updateResult;
    }

    public async deleteOne(uniqueId: number): Promise<boolean> {
        super.deleteRecoverOne(uniqueId, { [this.uniqueKey]: uniqueId })
        if (await super.deleteOne({ [this.uniqueKey]: uniqueId })) {
            let last = this.tableTTLCache.get(uniqueId);
            if (last) {
                this.tableTTLCache.delete(uniqueId);
            }
            super.MarkedDeleteFinish(uniqueId);
            this.dataLog.updateLastWriteTime();
            return true;
        }
        return false;
    }
}
