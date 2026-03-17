import { isDebug } from "../app";
import { errLog } from "../LogTS";
import { TTLBaseCache, TTLBaseCacheConfig } from "./TTLBaseCache";

export interface TTLCacheConfig extends TTLBaseCacheConfig {
    /**
     * 当执行fetch时发现没有值，执行该方法以获取值，如果有获取到值，会把该值set进cache
     * 理论上传进来的方法需要是async方法
     * 该方法的第一个参数必须为cache Key
     */
    fetchMethod: Function,
    /**
     * fetch方法的上下文
     */
    fetchContext: any,
}

/**
 * 根据时间来淘汰过期数据的缓存容器
 */
export class TTLCache<TKey, TValue> extends TTLBaseCache<TKey, TValue>{
    private fetchMethod: Function;
    private fetchContext: any;
    constructor(cfg: TTLCacheConfig) {
        super(cfg);
        this.fetchMethod = cfg.fetchMethod;
        this.fetchContext = cfg.fetchContext;
        if (!this.fetchContext || !this.fetchMethod) {
            if (isDebug) {
                throw new Error("fetchMethod and fetchContext must be set");
            } else {
                errLog("fetchMethod and fetchContext must be set");
            }

        }
    }

    /**
     * 稳健获取一个数据，等于异步的get
     * 当在缓存找不到数据时，通过fetchMethod尝试获取数据，如果获取到就存进cache里，并返回获取到的值
     * @param key 
     * @returns TValue
     */
    public async fetch(key: TKey): Promise<TValue> {
        let data = this.get(key);
        if (!data) {
            data = await this.fetchMethod.apply(this.fetchContext, [key, this.fetchContext]);
            if (data != null) {
                this.set(key, data);
            }
        }
        return data;
    }

    //更新Fetch获取方法
    public updateFetchMethod(fetchContext: any, fetchMethod: Function) {
        this.fetchContext = fetchContext;
        this.fetchMethod = fetchMethod;
    }

    //清理TTL   
    public dispose() {
        super.dispose();
        this.fetchMethod = null;
        this.fetchContext = null;
    }




}