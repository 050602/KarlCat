"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sigleton = void 0;
const app_1 = require("../app");
class Sigleton {
    constructor() {
    }
    //当实例初始化时
    initInstance() {
    }
    ;
    //当实例被销毁时
    destoryInstance() {
    }
    ;
    //当实例被热更新时
    onHotReload() {
    }
    ;
    static getInstance(T) {
        let ins = app_1.app.InstanceMap.get(T.SigletonInsName);
        if (!ins) {
            ins = new T();
            app_1.app.InstanceMap.set(T.SigletonInsName, ins);
            ins.initInstance();
        }
        return ins;
    }
}
exports.Sigleton = Sigleton;
//# sourceMappingURL=Sigleton.js.map