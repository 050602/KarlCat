"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sigleton = void 0;
const console_1 = require("console");
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
        // this._clsName = "";
        this._instance = this;
    }
    ;
    get clsName() {
        (0, console_1.assert)(this._clsName);
        return this._clsName;
    }
    static getInstance() {
        // console.log(Date.now(), 'get instance 1.0', (<any>this).name, Sigleton.cnt);
        // Sigleton.cnt += 1;
        let inst = this._instance;
        // inst和getInst不一致？
        if (inst) {
            let instMap = app_1.app.InstanceMap;
            let name = inst.clsName;
            let getInst = instMap.get(name);
            if (getInst)
                return getInst;
        }
        if (!this._instance) {
            let name = this.name;
            let t = new this();
            t._clsName = name;
            t.initInstance();
            app_1.app.InstanceMap.set(name, t);
            this._instance = t;
        }
        // Sigleton.cnt -= 1;
        // console.log(Date.now(), 'get instance 1.1', (<any>this).name, Sigleton.cnt);
        return this._instance;
    }
}
exports.Sigleton = Sigleton;
Sigleton.cnt = 0;
//# sourceMappingURL=Sigleton.js.map