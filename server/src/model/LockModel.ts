import { Sigleton } from "../core/Sigleton";
import { DateUtils } from "../utils/DateUtils";

export enum LockType {
    // 通用
    LT_Defualt = 0,
    LT_Login = 1,
    LT_Item = 2,
    LT_Exp = 3,

    LT_CreateRole = 4,
}

export class LogicLock {
    public constructor(sTimeout: number = 300, freeLockWhenTimeout: boolean = false) {
        this.lockTimeMap = new Map();
        this.msTimeout = sTimeout * 1000;
        this.freeLockWhenTimeout = freeLockWhenTimeout;
    }

    private lockTimeMap: Map<number | string, number> = new Map();
    private msTimeout: number = 0;   //超时时间，单位毫秒
    private freeLockWhenTimeout: boolean = false;   //超时后是否释放锁
    private funcName: string = "";
    private lockFuncNameMap: Map<number | string, string> = new Map();

    // 获取锁: 返回false说明未加锁，可以加锁进行使用；返回true说明已经加锁不可使用
    public getLogicLock(roleUid: number | string) {
        let lock = this.lockTimeMap.get(roleUid);
        if (!lock) {
            return false;
        }

        if (lock) {
            let time = this.lockTimeMap.get(roleUid);
            let now = DateUtils.msSysTick;
            if (now - time > this.msTimeout) {
                lock = 0;
                if (this.freeLockWhenTimeout)
                    this.lockTimeMap.delete(roleUid);
                else
                    this.lockTimeMap.set(roleUid, now);
            }
        }

        return lock;
    }

    public setLock(roleUid: number | string, flagLock: boolean) {
        let msTick = flagLock ? DateUtils.msSysTick : 0;
        this.lockTimeMap.set(roleUid, msTick);
    }

    public deleteLock(roleUid: number | string) {
        this.lockTimeMap.delete(roleUid);
    }

    public setLockFuncName(funcName: string, roleUid: number | string) {
        this.lockFuncNameMap.set(roleUid, funcName);
    }

    public getLockFuncName(roleUid: number | string) {
        let funcName = this.lockFuncNameMap.get(roleUid);
        return funcName;
    }
}


//请不要在Model里写任何逻辑
export class LockModel extends Sigleton {
    public static get Instance(): LockModel {
        return this.getInstance();
    }

    private logicLocks: Map<number, LogicLock> = new Map();

    //当实例初始化时
    public initInstance() {
        this.logicLocks.set(LockType.LT_Defualt, new LogicLock());
        this.logicLocks.set(LockType.LT_Login, new LogicLock(3, true));
        this.logicLocks.set(LockType.LT_Item, new LogicLock());
        this.logicLocks.set(LockType.LT_Exp, new LogicLock());

        this.logicLocks.set(LockType.LT_CreateRole, new LogicLock(10, true));
    };

    // 获取锁: 返回false说明未加锁，可以加锁进行使用；返回true说明已经加锁不可使用
    public getLock(lockType: LockType, roleUid: number | string) {
        let logicLock: LogicLock = this.logicLocks.get(lockType);
        return logicLock.getLogicLock(roleUid);
    }

    public setLock(lockType: LockType, roleUid: number | string, flagLock: boolean, funcName: string) {
        let logicLock: LogicLock = this.logicLocks.get(lockType);
        logicLock.setLockFuncName(funcName, roleUid);
        return logicLock.setLock(roleUid, flagLock);
    }

    public deleteLock(lockType: LockType, roleUid: number | string) {
        let logicLock: LogicLock = this.logicLocks.get(lockType);
        return logicLock.deleteLock(roleUid);
    }

    public getLockFuncName(lockType: LockType, roleUid: number | string) {
        let logicLock: LogicLock = this.logicLocks.get(lockType);
        return logicLock.getLockFuncName(roleUid);
    }
}