import LRUCache from "lru-cache";
import mongoose from "mongoose";
import { BaseTable } from "./BaseTable";


export class UserData {
    userName: string;
    roleUid:number;
}

export class UserTable extends BaseTable {
    public static get Instance(): UserTable {
        return this.getInstance();
    }

    private userDic: LRUCache<string, UserData> // key:userName
    private schema: mongoose.Schema;
    public async init(db: mongoose.Mongoose) {
        this.schema = new mongoose.Schema({
            subChannelID: String,
            userName: { //taptap下，此值为unionID
                required: true, //表示这个数据是否是必须输入
                type: String,//类型
                default: "",//默认值
                index: true,
                // max: 10, //最大值, 用于Number
                // min: 1, //最小值, 用于Number
                // enum: ['connect', 'uncoonect'], //枚举类型，标识值只能是connect或者uncoonect,只能用于//String类型中
                unique: true, //创建唯一索引，如果两个name值相同则会报错
                // match: /^\d{11}$/, //输入的数据必须符合正则规则，用于String
                // maxlength: 20, //输入的最大长度,用于String
                // minlength: 10, //输入的最小长度用于String
                // lowercase: true, // 全部小写
                // uppercase: true, // 全部大写
                //自定义验证器，通过则可以增加数据，反之不能
                // validate: function (desc) {
                //     return desc.length >= 10;
                // },
                // set(val) {
                //     return `${val}岁`
                // },
                // get(val) {
                //     return `今年${val}`
                // }
            },
        });

        UserTable.Instance.table = db.model(this.tableName, this.schema);
    }

    public async initInstance() {
        super.initInstance();//Warning 必须
        let options2 = {
            // max: 8000,//最大缓存条数,理论上按同时在线玩家的2倍处理即可？理论上单服3000人，那就6000
            ttl: 1000 * 60 * 180,//存活多久 毫秒 如果启用了ttl ，Has判断过期Item时，总是会返回false
            ttlAutopurge: true,
            allowStale: false,//如果设置了ttl,当调用get时，是否返回过期的item
            updateAgeOnGet: true,//如果设置了ttl,当调用get时，是否更新过期时间戳
            updateAgeOnHas: false,//如果设置了ttl,当调用has时，是否更新过期时间戳
            ignoreFetchAbort: true,//忽略淘汰时的异常中止
            //如果缓存中没有指定值，调用cache.fetch时，会调用以下方法，并把方法的返回值，返回,,,就是说，如果缓存中存在，是不会调用该方法的; ps:该方法会自动把返回值设置进缓存内
            // fetchMethod: this.fetchData,//该方法是异步的才对，理论上传进来的方法需要是async
            // fetchContext: this,
        }

        this.userDic = new LRUCache(options2);
    }

    public async destoryInstance() {
        super.destoryInstance();//Warning 必须
        this.userDic.clear();
    }

    public async insertOne(data: UserData): Promise<UserData> {
        let oldData: UserData = await this.findOne(data.userName);
        if (oldData) {
            return oldData;
        }

        oldData = this.userDic.get(data.userName);
        if (oldData) {
            return oldData;
        }

        this.userDic.set(data.userName, data);

        let insertData = await super.insertOne(data);
        if (!insertData) {
            this.userDic.delete(data.userName);
        }

        return insertData;
    }

    /**
     * @param userName string
     * @returns UserData
     */
    public async findOne(userName: string): Promise<UserData> {
        let oldData: UserData = this.userDic.get(userName);
        if (oldData) {
            return oldData;
        }

        let data: UserData = await super.findOne({ userName: userName });
        if (data) {
            this.userDic.set(userName, data);
        }
        return data;
    }

    /**
    * 该方法理论上跟findOne一毛一样，主要用来区分findOne ,让 findOne可以用单一key做Map缓存
    * 该方法，不应处理缓存问题,同时，该方法无法保证取到最新的数据，因为数据需要落地
    * @param cond 
    * @returns UserData
    */
    public async findOneByObject(cond: any): Promise<UserData> {
        return super.findOneByObject(cond);
    }

    public async findAll(cond: any): Promise<UserData[]> {
        return super.findAll(cond);
    }

    public async deleteOne(username: string): Promise<any> {
        let oldData: UserData = this.userDic.get(username);
        if (oldData) {
            this.userDic.delete(username)
        }
        let ret = await super.deleteOne({ userName: username });
        return ret;
    }

    public async updateOne(userName: string, data: any): Promise<boolean> {
        let ret = await super.updateOne({ userName: userName }, data);
        let oldData: UserData = this.userDic.get(userName);
        if (oldData) {
            for (let datakey in data) {
                if (data.hasOwnProperty(datakey)) {
                    oldData[datakey] = data[datakey];
                }
            }
        }
        return ret;
    }

} 