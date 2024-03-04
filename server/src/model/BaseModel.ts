import { app } from "../app";
import { Sigleton } from "../core/Sigleton";
import { DatabaseEvent } from "../event/DatabaseEvent";
import { ServerType } from "../register/route";

export interface LRUOptions {
    max?: number,//最大缓存条数,理论上按同时在线玩家的2倍处理即可？理论上单服3000人，那就6000
    dispose?: any,
    //  (value, key) => {
    //     // freeFromMemoryOrWhatever(value)
    // },//当缓存被删除时，执行的回调方法
    ttl?: number,//存活多久 毫秒 如果启用了ttl ，Has判断过期Item时，总是会返回false
    ttlAutopurge?: boolean,
    //在从缓存中移除之前返回过期的项目? LRU
    allowStale: boolean,//如果设置了ttl,当调用get时，是否返回过期的item
    updateAgeOnGet: boolean,//如果设置了ttl,当调用get时，是否更新过期时间戳
    updateAgeOnHas: boolean,//如果设置了ttl,当调用has时，是否更新过期时间戳
    //如果缓存中没有指定值，调用cache.fetch时，会调用以下方法，并把方法的返回值，返回,,,就是说，如果缓存中存在，是不会调用该方法的
    //参数分别为 key,可能是过期值（都获取不到了，为啥还会有旧的值？怀疑是过期值），｛不需要，不需要，上下文(就是下面的fetchContext)｝
    fetchMethod?: any//该方法是异步的才对，理论上传进来的方法需要是async
    fetchContext?: any,//上下文,使用fetchMethod可能会使用到
    ignoreFetchAbort?: boolean,
}

//请不要在Model里写任何逻辑
export class BaseModel extends Sigleton {
    public tableName: string;
    //请不要在Model里写任何逻辑
    protected static dbName: string = ServerType.database + "-1";


    //当实例初始化时
    public initInstance() {
        super.initInstance();
        if (!this.tableName)
            this.tableName = this.clsName.replace('Model', 'Table');
    };

    protected async insertOne(data: any): Promise<any> {
        // console.log('in base model, insert one, table:', this.tableName);
        return app.rpcDB(BaseModel.dbName, DatabaseEvent.OnInsertOneData + this.tableName, data);
    }

    protected async findOne(cond: any): Promise<any> {
        // console.log('in base model, find one, table:', this.tableName);
        return app.rpcDB(BaseModel.dbName, DatabaseEvent.OnFindOneData + this.tableName, cond);
    }


    /**
     * 该方法理论上跟findOne一毛一样，主要用来区分findOne ,让 findOne可以用单一key做Map缓存
     * 此处不能直接调用findOne  因为在子类时，会调用到子类的findOne
     * @param cond
     * @returns 
     */
    protected async findOneByObject(cond: any): Promise<any> {
        // console.log('in base model, find one by object, table:', this.tableName);
        return app.rpcDB(BaseModel.dbName, DatabaseEvent.OnFindOneDataByObject + this.tableName, cond);
    }


    protected async findAll(cond: any): Promise<any[]> {
        return app.rpcDB(BaseModel.dbName, DatabaseEvent.OnFindAllData + this.tableName, cond);
    }

    protected async updateOne(cond: any, data: any): Promise<boolean> {
        return app.rpcDB(BaseModel.dbName, DatabaseEvent.OnUpdateOneData + this.tableName, cond, data);
    }

    protected async deleteOne(cond: any): Promise<boolean> {
        return app.rpcDB(BaseModel.dbName, DatabaseEvent.OnDeleteOneData + this.tableName, cond);
    }

    /**
     * 统计数量
     */
    protected async countNum(cond: any):Promise<number> {
        return app.rpcDB(BaseModel.dbName, DatabaseEvent.OnCount + this.tableName, cond);
    }

    /**
     * 获取唯一字段列表
     */
    protected async distinctList(field: string, cond: any): Promise<any> {
        return app.rpcDB(BaseModel.dbName, DatabaseEvent.OnDistinct + this.tableName, field, cond);
    }
}