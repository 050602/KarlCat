import { BaseTable } from "./BaseTable";

//**功能：全局表数据表基类，支持缓存
export class BaseCacheTable<T> extends BaseTable {
    private cacheData: T;

    private updateKey: any = {};
    private updateData: any = {};
    //数据库数据落地
    public async implementationData(isEnforce: boolean) {
        if (this.updateData != null) {
            if (await super.updateOne(this.updateKey, this.updateData)) {
                this.updateData = null;
                super.MarkedUpdateFinish(this.updateKey);
            } else {
                return;
            }
        }

        if (this.dataLog) {
            this.dataLog.updateLastWriteTime();
        }
    }

    public async insertOne(data: T): Promise<T> {
        super.insertRecoverOne(data, this.updateKey);
        let data2 = await super.insertOne(data);
        if (data2) {
            super.MarkedInsertFinish(data);
            if (this.dataLog) {
                this.dataLog.updateLastWriteTime();
            }
        }

        this.cacheData = data2;
        return data2;
    }

    public async updateOne(cond: any, data: any): Promise<boolean> {
        if (data) {
            if (!this.updateData) {
                this.updateData = {};
            }
            if (this.cacheData) {
                for (let key in data) {
                    if (data.hasOwnProperty(key)) {
                        this.updateData[key] = data[key];
                        this.cacheData[key] = data[key];
                    }
                }
            } else {
                for (let key in data) {
                    if (data.hasOwnProperty(key)) {
                        this.updateData[key] = data[key];
                    }
                }
            }
            super.updateRecoverOne(this.updateKey, this.updateData, this.updateKey);
        }

        return true;
    }

    public async findOne(): Promise<T> {
        if (!this.cacheData) {
            this.cacheData = await super.findOne({});
        }
        return this.cacheData;
    }
} 