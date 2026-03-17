import { DateUtils } from "./DateUtils";

export interface TTLBaseCacheConfig {
    /**
     * 缓存过期时间
     */
    ttl: number;
    /**
     * 检查TTL过期的间隔 毫秒
     */
    interval: number;
    /**
    * get时是否更新时间
    */
    updateAgeOnGet: boolean;
    /**
    * has时是否更新时间
    */
    updateAgeOnHas: boolean;
}

/**
 * 根据时间来淘汰过期数据的缓存容器
 */
export class TTLBaseCache<TKey, TValue>{
    private valueMap: Map<TKey, TValue>;
    /**
     * 缓存最后更新的时间
     */
    private timeMap: Map<TKey, number>;
    private ttl: number;
    private interval: number;
    private updateAgeOnGet: boolean;
    private updateAgeOnHas: boolean;
    private nowTimesamp: number;
    private timer: NodeJS.Timeout;
    constructor(cfg: TTLBaseCacheConfig) {
        this.valueMap = new Map<TKey, TValue>();
        this.timeMap = new Map<TKey, number>();
        this.ttl = cfg.ttl;
        this.interval = cfg.interval;
        this.updateAgeOnGet = cfg.updateAgeOnGet;
        this.updateAgeOnHas = cfg.updateAgeOnHas;
        this.nowTimesamp = DateUtils.msSysTick;
        this.timer = setInterval(() => {
            this.tick();
        }, this.interval);
    }

    public tick() {
        //更新时间戳
        this.nowTimesamp = DateUtils.msSysTick;

        //进行过期检查
        for (let key of this.timeMap.keys()) {
            let time = this.timeMap.get(key);
            if (this.nowTimesamp - time > this.ttl) {
                this.delete(key);
            }
        }
    }

    public set(key: TKey, value: TValue) {
        this.valueMap.set(key, value);
        this.timeMap.set(key, DateUtils.msSysTick);
    }

    public get(key: TKey): TValue {
        if (this.valueMap.has(key)) {
            if (this.updateAgeOnGet) {
                this.timeMap.set(key, DateUtils.msSysTick);
            }
            return this.valueMap.get(key);
        }
        return null;
    }

    public has(key: TKey): boolean {
        let isHas = this.valueMap.has(key);
        if (isHas && this.updateAgeOnHas) {
            this.timeMap.set(key, DateUtils.msSysTick);
        }
        return isHas;
    }

    public values() {
        return this.valueMap.values();
    }
    public keys() {
        return this.timeMap.keys();
    }

    public delete(key: TKey): void {
        this.timeMap.delete(key);
        this.valueMap.delete(key);
    }

    public clear(): void {
        this.timeMap.clear();
        this.valueMap.clear();
    }

    public size(): number {
        return this.timeMap.size;
    }

    //清理TTL   
    public dispose() {
        this.clear();
        clearInterval(this.timer);
    }




}
