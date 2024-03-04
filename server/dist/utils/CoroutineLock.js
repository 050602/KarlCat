"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoroutineLock = void 0;
const DateUtils_1 = require("./DateUtils");
class CoroutineLock {
    constructor() {
        this._lock = false;
        this._waitList = [];
    }
    async lock() {
        if (this._lock) {
            let now = DateUtils_1.DateUtils.timestamp();
            this.checkReleaseLock(now);
            await new Promise((resolve, reject) => {
                let info = {
                    resolve: resolve,
                    reject: reject,
                    time: now,
                };
                this._waitList.push(info);
            });
            // .catch((error) => {//使用catch不会中止方法，还是需要把它抛出
            //     console.log("CoroutineLock reject:", error);
            // });
        }
        this._lock = true;
    }
    unlock() {
        if (this._waitList.length > 0) {
            let info = this._waitList.shift();
            let resolve = info.resolve;
            resolve && resolve();
            if (!this._waitList.length) {
                this._lock = false;
            }
            else {
                let now = DateUtils_1.DateUtils.timestamp();
                this.checkReleaseLock(now);
            }
        }
        else {
            this._lock = false;
        }
    }
    checkReleaseLock(now) {
        if (this._waitList.length) {
            let fristInfo = this._waitList[0];
            if (now - fristInfo.time > 20000) {
                // 20秒后自动释放
                this._waitList.shift();
                fristInfo.reject("timeout reject");
                if (!this._waitList.length) {
                    this._lock = false;
                }
                else {
                    this.checkReleaseLock(now);
                }
            }
        }
    }
    clear() {
        for (let i = 0; i < this._waitList.length; i++) {
            let info = this._waitList[i];
            let reject = info.reject;
            reject && reject("clear cmd lock");
        }
        this._waitList.length = 0;
        this._lock = false;
    }
}
exports.CoroutineLock = CoroutineLock;
//# sourceMappingURL=CoroutineLock.js.map