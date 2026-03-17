import { assert } from "console";
import mongoose from "mongoose";
import { allTables } from "../app";
import { CommonUtils } from "../utils/CommonUtils";
import { TTLBaseCache } from "../utils/TTLBaseCache";
import { BaseTable } from "./BaseTable";


// 玩家角色表基类，需要数据表以玩家id（且字段名为roleUid）为唯一key
export class Base2Table extends BaseTable {
    protected schema: mongoose.Schema;
    public init(db: mongoose.Mongoose) {
        this.schema = this.initSchema();
        this.table = db.model(this.tableName, this.schema);
        allTables.push(this);
        BaseTable.initDataLog(this);

        this._cacheInsert = this.getFlag_cacheInsert();
        this._cacheUpdate = this.getFlag_cacheUpdate();
    }
    protected initSchema(): mongoose.Schema {
        assert(false)
        return null;
    }

    // 子类可以根据需要改写缓存参数
    protected getLRUOptions() {
        // let options2 = {
        //     // max: 8000,//最大缓存条数,理论上按同时在线玩家的2倍处理即可？理论上单服3000人，那就6000
        //     ttl: 1000 * 60 * 180,//存活多久 毫秒 如果启用了ttl ，Has判断过期Item时，总是会返回false
        //     ttlAutopurge: true,
        //     allowStale: false,//如果设置了ttl,当调用get时，是否返回过期的item
        //     updateAgeOnGet: true,//如果设置了ttl,当调用get时，是否更新过期时间戳
        //     updateAgeOnHas: false,//如果设置了ttl,当调用has时，是否更新过期时间戳
        //     ignoreFetchAbort: true,//忽略淘汰时的异常中止
        //     //如果缓存中没有指定值，调用cache.fetch时，会调用以下方法，并把方法的返回值，返回,,,就是说，如果缓存中存在，是不会调用该方法的; ps:该方法会自动把返回值设置进缓存内
        //     // fetchMethod: this.fetchData,//该方法是异步的才对，理论上传进来的方法需要是async
        //     // fetchContext: this,
        // }

        let options2 = {
            ttl: 1000 * 60 * 180,
            interval: 1000 * 60,
            updateAgeOnGet: true,
            updateAgeOnHas: false
        }
        return options2;
    }

    // 默认插入时缓存，子类可以根据需要改写
    protected getFlag_cacheInsert() {
        return true;
    }

    // 默认更新时缓存，子类可以根据需要改写
    protected getFlag_cacheUpdate() {
        return true;
    }

    private insterData: Set<any> = new Set();
    private updateData: Map<number, any> = new Map();
    protected dictData: TTLBaseCache<number, any>;

    private _cacheInsert: boolean = true;
    private _cacheUpdate: boolean = true;

    public initInstance(): void {
        super.initInstance();
        // TSEventCenter.Instance.bind(RpcEvent.OnDeleteDBCache, this, this.clearDBCache);
        let options2 = this.getLRUOptions();
        this.dictData = new TTLBaseCache(options2);
    }

    public destoryInstance(): void {
        super.destoryInstance();
        // TSEventCenter.Instance.unbind(RpcEvent.OnDeleteDBCache, this);;
        this.dictData.clear();
    }

    //数据库数据落地
    public async implementationData(isEnforce: boolean) {
        // let now = DateUtils.timestamp();
        // logDatabasenow + this.tableName + "imp");
        for (let data of this.insterData) {
            // if (super.insertOne(data)) {
            //     this.insterData.delete(data);
            //     this.MarkedInsertFinish(data);
            // } else {
            //     return;
            // }
            // let func = async () => {
            //     this.insterData.delete(data);
            //     await super.insertOne(data);
            //     super.MarkedInsertFinish(data);
            // }
            // func();
            this.doInsertOne(data);

        }
        if (this._cacheInsert)
            await CommonUtils.sleep(1000);

        for (let data of this.updateData) {
            // console.log("update",data);
            // if (super.updateOne({ roleUid: data[0] }, data[1])) {
            //     this.updateData.delete(data[0]);
            //     this.MarkedUpdateFinish(data[0]);
            // } else {
            //     return;
            // }
            // let func = async () => {
            //     this.updateData.delete(data[0]);
            //     await super.updateOne({ roleUid: data[0] }, data[1]);
            //     super.MarkedUpdateFinish(data[0]);
            // }
            // func();
            this.doUpdateOne(data);
        }

        if (this.dataLog) {
            this.dataLog.updateLastWriteTime();
        }
    }

    async doInsertOne(data) {
        this.insterData.delete(data);
        await super.insertOne(data);
        super.MarkedInsertFinish(data);
    }

    async doUpdateOne(data) {
        this.updateData.delete(data[0]);
        await super.updateOne({ roleUid: data[0] }, data[1]);
        super.MarkedUpdateFinish(data[0]);
    }


    public async insertOne(data: any): Promise<any> {
        super.insertRecoverOne(data, { roleUid: data.roleUid });
        if (this._cacheInsert) {
            this.insterData.add(data);
            this.dictData.set(data.roleUid, data);
            return data;
        }

        let insertData = await super.insertOne(data);
        if (insertData) {
            super.MarkedInsertFinish(data);
            if (this.dataLog) {
                this.dataLog.updateLastWriteTime();
            }
        }

        this.dictData.set(data.roleUid, insertData);
        return insertData;
    }

    public async updateOneAtOnce(roleUid: number, data: any): Promise<boolean> {
        super.updateRecoverOne(roleUid, data, { roleUid: roleUid });
        let ret = await super.updateOne({ roleUid: roleUid }, data);
        if (ret) {
            super.MarkedUpdateFinish(roleUid);
            if (this.dataLog) {
                this.dataLog.updateLastWriteTime();
            }
        }

        let cacheData = this.dictData.get(roleUid);
        if (cacheData) {
            for (let key in data) {
                if (data.hasOwnProperty(key)) {
                    cacheData[key] = data[key];
                }
            }
        }

        return true;
    }

    public async updateOne(uid: number, data: any): Promise<boolean> {
        if (!this._cacheUpdate) {
            return await this.updateOneAtOnce(uid, data);
        }

        let up = this.updateData.get(uid);
        if (up) {
            for (let key in data) {
                if (data.hasOwnProperty(key)) {
                    up[key] = data[key];
                }
            }
            super.updateRecoverOne(uid, up, { roleUid: uid });
        } else {
            super.updateRecoverOne(uid, data, { roleUid: uid });

            this.updateData.set(uid, data);
        }

        let last = this.dictData.get(uid);
        if (last) {
            for (let key in data) {
                if (data.hasOwnProperty(key)) {
                    last[key] = data[key];
                }
            }
        }

        return true;
        //logDatabase(now + this.tableName + "upE");
    }

    public async findOne(roleUid: number): Promise<any> {
        let data: any = this.dictData.get(roleUid);
        if (!data) {
            data = await super.findOne({ roleUid: roleUid });
            if (data) {
                this.dictData.set(roleUid, data);
            }
        }
        return data;
        // return super.findOne({ roleUid: roleUid });
    }

    /**
     * 清除指定角色的缓存
     * @param uids 
     * @returns 
     */
    public deleteRoleCache(uid: number): boolean {
        if (this.dictData.has(uid)) {
            this.dictData.delete(uid);
        }

        return true;
    }
}