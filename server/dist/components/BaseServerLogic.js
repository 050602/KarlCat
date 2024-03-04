"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseServerLogic = void 0;
const Sigleton_1 = require("../core/Sigleton");
const TSEventCenter_1 = require("../utils/TSEventCenter");
class BaseServerLogic extends Sigleton_1.Sigleton {
    constructor() {
        super();
        this.registerCmds = [];
        this.rpcEvents = [];
        this.rpcAwaitEvents = [];
    }
    bindCmd(cmd, func) {
        this.registerCmds.push(cmd);
    }
    bindRpcEvents(name, func, flagAwait = false) {
        if (!flagAwait) {
            this.rpcEvents.push(name);
        }
        else {
            this.bindRpcAwaitEvents(name, func);
        }
    }
    bindRpcAwaitEvents(name, func) {
        this.rpcAwaitEvents.push(name);
    }
    setTimer(callback, second) {
        let timer = setInterval(callback, second * 1000);
        this.timers.push(timer);
    }
    destoryInstance() {
        for (let cmd of this.registerCmds) {
            TSEventCenter_1.TSEventCenter.Instance.unbindCMD(cmd, this);
        }
        this.rpcEvents.forEach((data) => {
            TSEventCenter_1.TSEventCenter.Instance.unbind(data, this);
        });
        this.rpcEvents.length = 0;
        this.rpcAwaitEvents.forEach((data) => {
            TSEventCenter_1.TSEventCenter.Instance.unbindAwait(data, this);
        });
        this.rpcAwaitEvents.length = 0;
        this.timers.forEach((timer) => {
            clearInterval(timer);
        });
        this.timers.length = 0;
        this.registerCmds.length = 0;
    }
}
exports.BaseServerLogic = BaseServerLogic;
//# sourceMappingURL=BaseServerLogic.js.map