import { Sigleton } from "../core/Sigleton";

export class BaseServerLogic extends Sigleton {
    public readonly ServerType: string;//RPC时
    public lockMap: Map<number, boolean> = new Map();

    public getLock(roleUid: number) {
        let lock = this.lockMap.get(roleUid);
        if (lock == null) {
            return false;
        }
        return lock;
    }

    public setLock(roleUid: number, bool: boolean) {
        this.lockMap.set(roleUid, bool);
    }
}