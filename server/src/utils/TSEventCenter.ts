import { DateUtils } from "./DateUtils";
import { app } from "../app";
import { ServerType } from "../register/route";
import { CoroutineLock } from "./CoroutineLock";

export class TSEventCenter {
    private static readonly CMD_LOCK_IDLE_MS = 5 * 60 * 1000;
    private static readonly CMD_LOCK_CLEAN_INTERVAL_MS = 60 * 1000;
    private static _inst: TSEventCenter;
    static get Instance() {
        if (TSEventCenter._inst == null) {
            TSEventCenter._inst = new TSEventCenter();
            TSEventCenter._inst.initInstance();
        }
        return TSEventCenter._inst;
    }
    initInstance() {
        if (!this.lockCleanTimer) {
            this.lockCleanTimer = setInterval(() => {
                this.cleanIdleCMDLocks();
            }, TSEventCenter.CMD_LOCK_CLEAN_INTERVAL_MS);
        }
    }

    private cmdMap: Map<number, { thisobj: any, func: Function }> = new Map();
    // private cmdCache: Map<number, { thisobj: any, func: Function }[]> = new Map();
    private lockMap: Map<number, CoroutineLock> = new Map();
    private lockUseTimeMap: Map<number, number> = new Map();
    private lockCleanTimer: NodeJS.Timeout;
    private rpcMap: Map<number, any[]> = new Map();
    private dbMap: Map<string, any[]> = new Map();
    private awaitMap: Map<number, any[]> = new Map();

    //==============================以下是CMD的==============================
    public bindCMD(cmd: number, thisobj: any, func: Function): boolean {
        // let realKey = cmd;
        let arr = this.cmdMap.get(cmd);
        if (arr) {
            console.error("重复注册事件,mainKey:", cmd);
            return false;
        }
        this.cmdMap.set(cmd, { func: func, thisobj: thisobj });
        return true;
    }


    public unbindCMD(cmd: number, thisobj: any) {
        this.cmdMap.delete(cmd);
    }

    private getCMDLock(roleUid: number): CoroutineLock {
        let lock: CoroutineLock;
        lock = this.lockMap.get(roleUid);
        if (!lock) {
            lock = new CoroutineLock();
            this.lockMap.set(roleUid, lock);
        }
        this.lockUseTimeMap.set(roleUid, Date.now());
        return lock;
    }

    public clearCMD(roleUid: number) {
        let lock = this.lockMap.get(roleUid);
        if (lock) {
            lock.clear();
            this.lockMap.delete(roleUid);
            this.lockUseTimeMap.delete(roleUid);
        }
    }

    public clearAllCMDLocks() {
        for (let lock of this.lockMap.values()) {
            lock.clear();
        }
        this.lockMap.clear();
        this.lockUseTimeMap.clear();
    }

    public async eventCMDAsync(roleUid: number, realKey: number, ...data: any[]): Promise<any> {

        // let time = DateUtils.msSysTick;
        let cmd = this.cmdMap.get(realKey);
        if (!cmd) {
            //没有注册CMD
            return;
        }

        if (roleUid > 0) {
            //战斗服允许不等待协议
            //mainKey + sonKey == 303 302_1 有加速检测，如果之前的协议阻塞了，会导致玩家连续发送302_1而踢下线
            if (app.serverType == ServerType.fight) {
                cmd.func.apply(cmd.thisobj, data);
            } else {
                //其他服务器必须进队列里等待
                let lock: CoroutineLock = this.getCMDLock(roleUid);
                try {
                    await lock.lock();
                } catch (err: any) {
                    console.warn("eventCMDAsync lock cleared", roleUid, realKey, err?.message || err);
                    return;
                }
                try {
                    await cmd.func.apply(cmd.thisobj, data);
                } catch (err) {
                    console.error(err);
                } finally {
                    lock.unlock();
                    this.lockUseTimeMap.set(roleUid, Date.now());
                }
            }
        } else {
            await cmd.func.apply(cmd.thisobj, data);
        }

    }

    //==============================以上是CMD的==============================

    //==============================以下是RPC的==============================
    public bind(name: number, thisobj: any, func: Function): boolean {
        let arr = this.rpcMap.get(name);
        if (arr) {
            let len = arr.length;
            for (let i = 0; i < len; i++) {
                if (arr[i][0] == func && arr[i][1] == thisobj) {
                    // warningLog("重复注册事件", name);
                    return false;
                }
            }
        } else {
            this.rpcMap.set(name, []);
            arr = this.rpcMap.get(name);
        }
        arr?.push([func, thisobj]);
        return true;
    }


    public unbind(name: number, thisobj: any) {
        let arr = this.rpcMap.get(name);
        if (arr) {
            let len = arr.length;
            for (let i = len - 1; i >= 0; i--) {
                if (arr[i][1] == thisobj) {
                    arr.splice(i, 1);
                }
            }
        }
        if (arr && arr.length == 0) {
            this.rpcMap.delete(name);
        }
    }


    public bindAwait(name: number, thisobj: any, func: Function): boolean {
        let arr = this.awaitMap.get(name);
        if (arr) {
            console.error("同一个进程重复注册了bindAwait事件，请注意检查单例", name);
            return false;
        } else {
            this.awaitMap.set(name, [func, thisobj]);
            return true;
        };
    }


    public unbindAwait(name: number, thisobj: any) {
        let arr = this.awaitMap.get(name);
        if (arr) {
            this.awaitMap.delete(name);
        }
    }


    public event(name: number, ...data: any[]): void {
        let time = DateUtils.msSysTick;
        let arr = this.rpcMap.get(name);
        if (arr) {
            for (let i = arr.length - 1; i >= 0; i--) {
                let f: Function = arr[i][0];
                f.apply(arr[i][1], data);
            }
        }
    }


    public async eventAwait(name: number, ...data: any[]): Promise<any[]> {
        let time = DateUtils.msSysTick;
        let arr = this.awaitMap.get(name);
        if (arr) {
            let f: Function = arr[0];
            let ret = await f.apply(arr[1], data);
            return ret;
        }
        return null;
    }

    //==============================以上是RPC的==============================

    ///========================以下是DB的===================================

    public async eventDB(name: string, ...data: any[]): Promise<any> {
        let time = DateUtils.msSysTick;
        let arr = this.dbMap.get(name);
        if (arr) {
            let f: Function = arr[0];
            let ret = await f.apply(arr[1], data);
            let time2 = DateUtils.msSysTick;
            let time3 = time2 - time;
            return ret;
        }
        console.error(name + "  错误，can not find db event process func");
        return null;
    }


    public bindDB(name: string, thisobj: any, func: Function) {
        let arr = this.dbMap.get(name);
        if (arr) {
            console.error("重复注册数据库事件", name);
            return;
        } else {
            this.dbMap.set(name, [func, thisobj]);
        }
    }

    public unbindDB(name: string) {
        let arr = this.dbMap.get(name);
        if (arr) {
            this.dbMap.delete(name);
        }
    }

    private cleanIdleCMDLocks() {
        if (this.lockMap.size <= 0) {
            return;
        }
        let now = Date.now();
        for (let [roleUid, lock] of this.lockMap.entries()) {
            if (lock.isBusy()) {
                continue;
            }
            let lastUse = this.lockUseTimeMap.get(roleUid) ?? now;
            if (now - lastUse >= TSEventCenter.CMD_LOCK_IDLE_MS) {
                this.lockMap.delete(roleUid);
                this.lockUseTimeMap.delete(roleUid);
            }
        }
    }

    //==============================以上是DB的==============================
}
