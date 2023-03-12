"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TSEventCenter = void 0;
class TSEventCenter {
    constructor() {
        this.map = new Map();
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
    bind(name, thisobj, func) {
        let arr = this.map.get(name);
        if (arr) {
            let len = arr.length;
            for (let i = 0; i < len; i++) {
                if (arr[i][0] == func && arr[i][1] == thisobj) {
                    // warningLog("重复注册事件", name);
                    return;
                }
            }
        }
        else {
            this.map.set(name, []);
            arr = this.map.get(name);
        }
        arr?.push([func, thisobj]);
    }
    unbind(name, thisobj) {
        let arr = this.map.get(name);
        if (arr) {
            let len = arr.length;
            for (let i = len - 1; i >= 0; i--) {
                if (arr[i][1] == thisobj) {
                    arr.splice(i, 1);
                }
            }
        }
        if (arr && arr.length == 0) {
            this.map.delete(name);
        }
    }
    event(name, ...data) {
        let arr = this.map.get(name);
        if (arr) {
            for (let i = arr.length - 1; i >= 0; i--) {
                let f = arr[i][0];
                f.apply(arr[i][1], data);
            }
        }
    }
    async eventAsync(name, ...data) {
        let arr = this.map.get(name);
        let reArr = [];
        if (arr) {
            let promiseArr = [];
            for (let i = arr.length - 1; i >= 0; i--) {
                let f = arr[i][0];
                promiseArr.push(f.apply(arr[i][1], data));
            }
            reArr = await Promise.all(promiseArr);
        }
        return reArr;
    }
}
exports.TSEventCenter = TSEventCenter;
//# sourceMappingURL=TSEventCenter.js.map