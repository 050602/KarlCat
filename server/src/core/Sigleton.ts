import { assert } from "console";
import { app } from "../app";

export abstract class Sigleton {
    private _clsName: string;
    private _instance: any;

    constructor() {
    }

    //当实例初始化时
    public initInstance() {
    };

    //当实例被销毁时
    public destoryInstance() {
    };

    //当实例被热更新时
    public onHotReload() {
        // this._clsName = "";
        this._instance = this;
    };

    public get clsName(): string {
        assert(this._clsName);
        return this._clsName;
    }

    static cnt = 0;
    protected static getInstance<T extends {}>(this: new () => T): T {
        // console.log(Date.now(), 'get instance 1.0', (<any>this).name, Sigleton.cnt);
        // Sigleton.cnt += 1;
        let inst = (<any>this)._instance;
        // inst和getInst不一致？
        if (inst) {
            let instMap = app.InstanceMap;
            let name = inst.clsName;
            let getInst = instMap.get(name);
            if (getInst)
                return getInst;
        }

        if (!(<any>this)._instance) {
            let name = (<any>this).name;
            let t: any = new this();
            t._clsName = name;
            t.initInstance();
            app.InstanceMap.set(name, t);

            (<any>this)._instance = t;
        }
        // Sigleton.cnt -= 1;
        // console.log(Date.now(), 'get instance 1.1', (<any>this).name, Sigleton.cnt);
        return (<any>this)._instance;
    }

    // protected static getInstance(T: any) {
    //     if (T.SigletonInsName == null || T.SigletonInsName.length == 0) {
    //         throw ("单例名称不能为空！！！类名/方法名:" + T.name);
    //     }
    //     let ins = app.InstanceMap.get(T.SigletonInsName);
    //     if (!ins) {
    //         ins = new T();
    //         app.InstanceMap.set(T.SigletonInsName, ins);
    //         ins.initInstance();
    //     }
    //     return ins;
    // }
}