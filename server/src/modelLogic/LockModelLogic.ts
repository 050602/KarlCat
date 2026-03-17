import { LockModel, LockType } from "../model/LockModel";
import { BaseModelLogic } from "./BaseModelLogic";

export class LockModelLogic extends BaseModelLogic {
    public static get Instance(): LockModelLogic {
        return this.getInstance();
    }

    // 获取锁: 返回false说明未加锁，可以加锁进行使用；返回true说明已经加锁不可使用
    public getLock(roleUid: number) {
        return LockModel.Instance.getLock(LockType.LT_Defualt, roleUid);
    }

    public setLock(roleUid: number, flagLock: boolean, funcName: string = null) {
        LockModel.Instance.setLock(LockType.LT_Defualt, roleUid, flagLock, funcName);
    }

    public getLockFuncName(roleUid: number) {
        return LockModel.Instance.getLockFuncName(LockType.LT_Defualt, roleUid);
    }

    public deleteLock(roleUid: number) {
        LockModel.Instance.deleteLock(LockType.LT_Defualt, roleUid);
    }

    public getItemLock(uid: number) {
        return LockModel.Instance.getLock(LockType.LT_Item, uid);
    }

    public setItemLock(roleUid: number, flagLock: boolean, funcName: string = null) {
        LockModel.Instance.setLock(LockType.LT_Item, roleUid, flagLock, funcName);
    }

    public getExpLock(uid: number) {
        return LockModel.Instance.getLock(LockType.LT_Exp, uid);
    }

    public setExpLock(roleUid: number, flagLock: boolean, funcName: string = null) {
        LockModel.Instance.setLock(LockType.LT_Exp, roleUid, flagLock, funcName);
    }

    public getLoginLock(roleUid: number, funcName: string = null) {
        return LockModel.Instance.getLock(LockType.LT_Login, roleUid);
    }

    public setLoginLock(roleUid: number, funcName: string = null) {
        LockModel.Instance.setLock(LockType.LT_Login, roleUid, true, funcName);
    }

    public deleteLoginLock(roleUid: number) {
        LockModel.Instance.deleteLock(LockType.LT_Login, roleUid);
    }

    public getCreateLock(ip: string) {
        return LockModel.Instance.getLock(LockType.LT_CreateRole, ip);
    }

    public setCreateLock(ip: string, flagLock: boolean, funcName: string = null) {
        LockModel.Instance.setLock(LockType.LT_CreateRole, ip, flagLock, funcName);
    }

    public deleteCreateLock(ip: string) {
        LockModel.Instance.deleteLock(LockType.LT_CreateRole, ip);
    }
}