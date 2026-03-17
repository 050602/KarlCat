import { app } from "../app";
import { UserData } from "../database/UserTable";
import { ServerType } from "../register/route";
import { TTLCache } from "../utils/TTLCache";
import { BaseModel } from "./BaseModel";

// UserModel：主键是 lastMd5（字符串），使用 BaseModel 的缓存功能
export class UserModel extends BaseModel {
    public static get Instance(): UserModel {
        return this.getInstance();
    }

    // 登录专用缓存：用于 MD5 key 的短时缓存
    public userDataLoginCache: TTLCache<string, UserData>;

    // 启用缓存
    protected enableCache(): boolean {
        return true;
    }

    public initInstance() {
        super.initInstance(); // 初始化 modelCache (roleUid -> UserData)

        // Gate 服务器需要额外的登录缓存（MD5 -> UserData）
        if (app.serverType == ServerType.gate) {
            this.userDataLoginCache = new TTLCache({
                ttl: 1000 * 10, // 10秒短期缓存
                interval: 1000 * 60,
                updateAgeOnGet: true,
                updateAgeOnHas: false,
                fetchMethod: this.fetchDataByMd5,
                fetchContext: this,
            });
        }
    }

    // 覆盖基类的 TTL 配置（5分钟）
    protected getLRU_ttl(): number {
        return 60 * 5;
    }

    // 按 MD5 主键查找用户
    public async findByMD5(lastMd5: string): Promise<UserData> {
        return this.findOne({ lastMd5: lastMd5 });
    }

    // 按 roleUid 查找用户（使用缓存）
    public async findByRoleUid(roleUid: number): Promise<UserData> {
        return this.modelCache.fetch(roleUid);
    }

    // 插入新用户
    public async insert(data: UserData): Promise<UserData> {
        return this.insertOne(data);
    }

    // 更新用户数据
    public async update(userName: string, data: any): Promise<boolean> {
        return this.updateOne({ userName }, data);
    }

    // 统计指定条件的用户数
    public async count(type: string, val: string): Promise<number> {
        let cond: any = null;
        switch (type) {
            case 'ip': cond = { lastLoginIP: val }; break;
            case 'dev': cond = { mobileUid: val }; break;
        }
        if (!cond) {
            return 0;
        }
        return this.countDocuments(cond);
    }

    // MD5 缓存的 fetch 方法
    private async fetchDataByMd5(key: string, context: UserModel): Promise<UserData> {
        return context.findOne({ lastMd5: key });
    }
}
