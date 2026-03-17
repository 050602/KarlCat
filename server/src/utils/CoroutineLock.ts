export class CoroutineLock {
    private _lock: boolean = false;
    private _waitList: Array<Function> = [];
    private _rejectList: Array<Function> = [];

    public async lock() {
        if (this._lock) {
            await new Promise((resolve, reject) => {
                this._waitList.push(resolve);
                this._rejectList.push(reject);
            });
        }
        this._lock = true;
    }

    public unlock() {
        this._lock = false;
        if (this._waitList.length > 0) {
            let resolve = this._waitList.shift();
            resolve && resolve();
            this._rejectList.shift();
        }
    }

    public clear() {
        for (let i = 0; i < this._rejectList.length; i++) {
            let reject = this._rejectList[i];
            reject && reject(new Error("CoroutineLock cleared"));
        }
        this._lock = false;
        this._waitList.length = 0;
        this._rejectList.length = 0;
    }

    public isBusy(): boolean {
        return this._lock || this._waitList.length > 0;
    }
}

