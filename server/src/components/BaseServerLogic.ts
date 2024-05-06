import { Sigleton } from "../core/Sigleton";
import { TSEventCenter } from "../utils/TSEventCenter";

export class BaseServerLogic extends Sigleton {
    registerCmds: number[];
    rpcEvents: number[];
    rpcAwaitEvents: number[];
    timers: NodeJS.Timer[];

    constructor() {
        super()
        this.registerCmds = [];
        this.rpcEvents = [];
        this.rpcAwaitEvents = [];
        this.timers = [];
    }

    public bindCmd(cmd: number, func: Function) {
        TSEventCenter.Instance.bindCMD(cmd, this, func);
        this.registerCmds.push(cmd);
    }


    public bindRpcEvents(name: number, func: Function, flagAwait = false) {
        if (!flagAwait) {
            TSEventCenter.Instance.bind(name, this, func);
            this.rpcEvents.push(name);
        } else {
            this.bindRpcAwaitEvents(name, func);
        }
    }

    public bindRpcAwaitEvents(name: number, func: Function) {
        TSEventCenter.Instance.bindAwait(name, this, func)
        this.rpcAwaitEvents.push(name);
    }

    public setTimer(callback: (args: void) => void, second?: number) {
        let timer: NodeJS.Timer = setInterval(callback, second * 1000);
        this.timers.push(timer);
    }

    public destoryInstance(): void {
        for (let cmd of this.registerCmds) {
            TSEventCenter.Instance.unbindCMD(cmd, this);
        }
        this.rpcEvents.forEach((data) => {
            TSEventCenter.Instance.unbind(data, this);
        });
        this.rpcEvents.length = 0;

        this.rpcAwaitEvents.forEach((data) => {
            TSEventCenter.Instance.unbindAwait(data, this);
        });
        this.rpcAwaitEvents.length = 0;

        this.timers.forEach((timer) => {
            clearInterval(timer);
        });
        this.timers.length = 0;

        this.registerCmds.length = 0;
    }

}