"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TSEventCenter = void 0;
const DateUtils_1 = require("./DateUtils");
const app_1 = require("../app");
const route_1 = require("../register/route");
const CoroutineLock_1 = require("./CoroutineLock");
class TSEventCenter {
    constructor() {
        this.cmdMap = new Map();
        // private cmdCache: Map<number, { thisobj: any, func: Function }[]> = new Map();
        this.lockMap = new Map();
        this.rpcMap = new Map();
        this.dbMap = new Map();
        this.awaitMap = new Map();
        //==============================以上是DB的==============================
    }
    static get Instance() {
        if (TSEventCenter._inst == null) {
            TSEventCenter._inst = new TSEventCenter();
            TSEventCenter._inst.initInstance();
        }
        return TSEventCenter._inst;
    }
    initInstance() {
    }
    //==============================以下是CMD的==============================
    bindCMD(cmd, thisobj, func) {
        // let realKey = cmd;
        let arr = this.cmdMap.get(cmd);
        if (arr) {
            console.error("重复注册事件,mainKey:", cmd);
            return false;
        }
        this.cmdMap.set(cmd, { func: func, thisobj: thisobj });
        return true;
    }
    unbindCMD(cmd, thisobj) {
        this.cmdMap.delete(cmd);
    }
    getCMDLock(roleUid) {
        let lock;
        lock = this.lockMap.get(roleUid);
        if (!lock) {
            lock = new CoroutineLock_1.CoroutineLock();
            this.lockMap.set(roleUid, lock);
        }
        return lock;
    }
    clearCMD(roleUid) {
        let lock = this.lockMap.get(roleUid);
        if (lock) {
            lock.clear();
            this.lockMap.delete(roleUid);
        }
    }
    async eventCMDAsync(roleUid, mainKey, sonKey, ...data) {
        let realKey = mainKey * 1000 + sonKey;
        let time = DateUtils_1.DateUtils.timestamp();
        let cmd = this.cmdMap.get(realKey);
        if (!cmd) {
            //没有注册CMD
            return;
        }
        if (roleUid > 0) {
            //战斗服允许不等待协议
            //mainKey + sonKey == 303 302_1 有加速检测，如果之前的协议阻塞了，会导致玩家连续发送302_1而踢下线
            if (app_1.app.serverType == route_1.ServerType.fight || mainKey + sonKey == 303) {
                cmd.func.apply(cmd.thisobj, data);
            }
            else {
                //其他服务器必须进队列里等待
                let lock = this.getCMDLock(roleUid);
                await lock.lock();
                try {
                    await cmd.func.apply(cmd.thisobj, data);
                }
                catch (err) {
                    console.error(err);
                }
                lock.unlock();
            }
        }
        else {
            await cmd.func.apply(cmd.thisobj, data);
        }
    }
    //==============================以上是CMD的==============================
    //==============================以下是RPC的==============================
    bind(name, thisobj, func) {
        let arr = this.rpcMap.get(name);
        if (arr) {
            let len = arr.length;
            for (let i = 0; i < len; i++) {
                if (arr[i][0] == func && arr[i][1] == thisobj) {
                    // warningLog("重复注册事件", name);
                    return false;
                }
            }
        }
        else {
            this.rpcMap.set(name, []);
            arr = this.rpcMap.get(name);
        }
        arr?.push([func, thisobj]);
        return true;
    }
    unbind(name, thisobj) {
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
    bindAwait(name, thisobj, func) {
        let arr = this.awaitMap.get(name);
        if (arr) {
            console.error("同一个进程重复注册了bindAwait事件，请注意检查单例", name);
            return false;
        }
        else {
            this.awaitMap.set(name, [func, thisobj]);
            return true;
        }
        ;
    }
    unbindAwait(name, thisobj) {
        let arr = this.awaitMap.get(name);
        if (arr) {
            this.awaitMap.delete(name);
        }
    }
    event(name, ...data) {
        let time = DateUtils_1.DateUtils.timestamp();
        let arr = this.rpcMap.get(name);
        if (arr) {
            for (let i = arr.length - 1; i >= 0; i--) {
                let f = arr[i][0];
                f.apply(arr[i][1], data);
            }
        }
    }
    async eventAwait(name, ...data) {
        let time = DateUtils_1.DateUtils.timestamp();
        let arr = this.awaitMap.get(name);
        if (arr) {
            let f = arr[0];
            let ret = await f.apply(arr[1], data);
            return ret;
        }
        return null;
    }
    //==============================以上是RPC的==============================
    ///========================以下是DB的===================================
    async eventDB(name, ...data) {
        let time = DateUtils_1.DateUtils.timestamp();
        let arr = this.dbMap.get(name);
        if (arr) {
            let f = arr[0];
            let ret = await f.apply(arr[1], data);
            let time2 = DateUtils_1.DateUtils.timestamp();
            let time3 = time2 - time;
            return ret;
        }
        console.error(name + "  错误，can not find db event process func");
        return null;
    }
    bindDB(name, thisobj, func) {
        let arr = this.dbMap.get(name);
        if (arr) {
            console.error("重复注册数据库事件", name);
            return;
        }
        else {
            this.dbMap.set(name, [func, thisobj]);
        }
    }
    unbindDB(name) {
        let arr = this.dbMap.get(name);
        if (arr) {
            this.dbMap.delete(name);
        }
    }
}
exports.TSEventCenter = TSEventCenter;
//# sourceMappingURL=TSEventCenter.js.map