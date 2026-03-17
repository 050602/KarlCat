import { app } from "../app";
import { hotScriptPath } from "../const/PathConst";
import { Sigleton } from "../core/Sigleton";
import { logError } from "../LogTS";
import { DatabaseEvent } from "../event/DatabaseEvent";
import { ServerType } from "../register/route";
import { CommonUtils } from "../utils/CommonUtils";
import { TTLCache, TTLCacheConfig } from "../utils/TTLCache";

// 请不要在Model里写任何逻辑
export class BaseModel extends Sigleton {
    public tableName: string;
    public modelCache: TTLCache<any, any>; // 支持任意 key 类型的缓存
    protected static dbName: string = ServerType.database + "-1";

    // 当实例初始化时
    public initInstance() {
        super.initInstance();
        if (!this.tableName)
            this.tableName = this.clsName.replace('Model', 'Table');

        // 根据开关决定是否启用缓存
        if (this.enableCache()) {
            let options = this.getLRUOptions();
            this.modelCache = new TTLCache(options);
        }
    }

    // 缓存开关：子类覆盖此方法返回 true 启用缓存
    protected enableCache(): boolean {
        return false;
    }

    // 缓存配置：子类可覆盖
    protected getLRUOptions(): TTLCacheConfig {
        let ttl: number = this.getLRU_ttl() * 1000;
        let fetchMethod = this.getFetchMethod();
        let fetchContext = this.getFetchContext();
        let options = {
            ttl: ttl, // 存活多久 毫秒
            interval: 1000 * 60, // 清理过期Item的间隔 毫秒
            ttlAutopurge: true,
            updateAgeOnGet: true, // 如果设置了ttl,当调用get时，是否更新过期时间戳
            updateAgeOnHas: false, // 如果设置了ttl,当调用has时，是否更新过期时间戳
            fetchMethod: fetchMethod, // 该方法是异步的才对，理论上传进来的方法需要是async
            fetchContext: fetchContext,
        }
        return options;
    }

    // 缓存TTL配置（单位：秒），子类可覆盖
    protected getLRU_ttl(): number {
        return 60 * 180; // 默认3小时
    }

    protected getFetchMethod(): any {
        return this.getFetchContext().fetchData;
    }

    protected getFetchContext(): any {
        let modelLogicName = `${this.clsName}Logic`;
        let modelLogicCls = app.InstanceMap.get(modelLogicName);
        if (!modelLogicCls) {
            try {
                let path = `${hotScriptPath}//modelLogic//${modelLogicName}.js`;
                const moudle = require(path);
                let sigleton: Sigleton = moudle[modelLogicName].Instance;
                if (sigleton) {
                    sigleton.onHotReload();
                }
                modelLogicCls = app.InstanceMap.get(modelLogicName);
                CommonUtils.assertEx(modelLogicCls, `${modelLogicName} 单例未找到，需要先实例化该类`);
            } catch (error) {
                logError("error:", error);
            }
        }
        return modelLogicCls;
    }

    public async insertOne(data: any): Promise<any> {
        // console.log('in base model, insert one, table:', this.tableName);
        return app.rpcDB(BaseModel.dbName, DatabaseEvent.OnInsertOneData + this.tableName, data);
    }

    public async findOne(cond: any): Promise<any> {
        // console.log('in base model, find one, table:', this.tableName);
        return app.rpcDB(BaseModel.dbName, DatabaseEvent.OnFindOneData + this.tableName, cond);
    }


    /**
     * 该方法理论上跟findOne一毛一样，主要用来区分findOne ,让 findOne可以用单一key做Map缓存
     * 此处不能直接调用findOne  因为在子类时，会调用到子类的findOne
     * @param cond
     * @returns 
     */
    public async findOneByObject(cond: any): Promise<any> {
        // console.log('in base model, find one by object, table:', this.tableName);
        return app.rpcDB(BaseModel.dbName, DatabaseEvent.OnFindOneDataByObject + this.tableName, cond);
    }


    public async findAll(cond: any): Promise<any[]> {
        return app.rpcDB(BaseModel.dbName, DatabaseEvent.OnFindAllData + this.tableName, cond);
    }

    public async countDocuments(cond: any = {}): Promise<number> {
        return app.rpcDB(BaseModel.dbName, DatabaseEvent.OnGetRowCount + this.tableName, cond);
    }

    public async updateOne(cond: any, data: any): Promise<boolean> {
        return app.rpcDB(BaseModel.dbName, DatabaseEvent.OnUpdateOneData + this.tableName, cond, data);
    }

    public async deleteOne(cond: any): Promise<boolean> {
        return app.rpcDB(BaseModel.dbName, DatabaseEvent.OnDeleteOneData + this.tableName, cond);
    }
}
