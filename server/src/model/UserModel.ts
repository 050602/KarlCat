import LRUCache from "lru-cache";
import { app } from "../app";
import { UserData } from "../database/UserTable";
import { UserModelLogic } from "../modelLogic/UserModelLogic";
import { ServerType } from "../register/route";
import { BaseModel } from "./BaseModel";


//请不要在Model里写任何逻辑
export class UserModel extends BaseModel {
    public static SigletonInsName = "UserModel";
    public static get Instance(): UserModel {
        return this.getInstance();
    }

    public initInstance() {
        //新增的缓存，需要在RoleRpcMain 的 updateOnlineCache 方法处理一次get 避免因为在线很久，把缓存清除了
        let options = {
            // max: 3333,//最大缓存条数,理论上按同时在线玩家的2倍处理即可？理论上单服3000人，那就6000
            ttl: 1000 * 60 * 5,//存活多久 毫秒 如果启用了ttl ，Has判断过期Item时，总是会返回false
            ttlAutopurge: true,
            //在从缓存中移除之前返回过期的项目? LRU
            allowStale: false,//如果设置了ttl,当调用get时，是否返回过期的item
            updateAgeOnGet: true,//如果设置了ttl,当调用get时，是否更新过期时间戳
            updateAgeOnHas: false,//如果设置了ttl,当调用has时，是否更新过期时间戳
            ignoreFetchAbort: true,//忽略淘汰时的异常中止
            //如果缓存中没有指定值，调用cache.fetch时，会调用以下方法，并把方法的返回值，返回,,,就是说，如果缓存中存在，是不会调用该方法的; ps:该方法会自动把返回值设置进缓存内
            fetchMethod: UserModelLogic.Instance.fetchData,//该方法是异步的才对，理论上传进来的方法需要是async
            fetchContext: UserModelLogic.Instance,
        }

        this.userDataCache = new LRUCache(options);

        //在gate时，缩短缓存时间
        if (app.serverType == ServerType.gate) {
            let options2 = {
                // max: 8000,//最大缓存条数,理论上按同时在线玩家的2倍处理即可？理论上单服3000人，那就6000
                ttl: 1000 * 10,//存活多久 毫秒 如果启用了ttl ，Has判断过期Item时，总是会返回false
                ttlAutopurge: true,
                //在从缓存中移除之前返回过期的项目? LRU
                allowStale: false,//如果设置了ttl,当调用get时，是否返回过期的item
                updateAgeOnGet: true,//如果设置了ttl,当调用get时，是否更新过期时间戳
                updateAgeOnHas: false,//如果设置了ttl,当调用has时，是否更新过期时间戳
                ignoreFetchAbort: true,//忽略淘汰时的异常中止
                //如果缓存中没有指定值，调用cache.fetch时，会调用以下方法，并把方法的返回值，返回,,,就是说，如果缓存中存在，是不会调用该方法的; ps:该方法会自动把返回值设置进缓存内
                fetchMethod: UserModelLogic.Instance.fetchDataString,//该方法是异步的才对，理论上传进来的方法需要是async
                fetchContext: UserModelLogic.Instance,
            }
            this.userDataLoginCache = new LRUCache(options2)
        }
    };

    //禁止在逻辑类直接操作该变量 
    public userDataCache: LRUCache<number, UserData>;
    public userDataLoginCache: LRUCache<string, UserData>;

    public destoryInstance() {
    };


    public async insert(data: UserData): Promise<UserData> {
        return super.insertOne(data);
    }

    public async find(username: string): Promise<UserData> {
        return super.findOne(username);
    }


    public async findByRoleUid(roleUid: number): Promise<UserData> {
        return super.findOneByObject({ roleUid: roleUid });
    }

    /**
     * 该方法理论上跟findOne一毛一样，主要用来区分findOne ,让 findOne可以用单一key做Map缓存
     * 此处不能直接调用findOne  因为在子类时，会调用到子类的findOne 该方法无法保证取到最新的数据，因为数据需要落地
     * @param cond
     * @returns 
     */
    public async findByObject(cond: any): Promise<UserData> {
        return super.findOneByObject(cond);
    }


    public async findAllByAny(cond: any): Promise<UserData[]> {
        return super.findAll(cond);
    }

    public async deleteOne(username: string): Promise<boolean> {
        return super.deleteOne(username) as any;
    }

    public async update(userName: string, data: any): Promise<boolean> {
        return super.updateOne(userName, data);
    }

}