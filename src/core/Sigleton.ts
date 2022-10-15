import { app } from "../app";

export abstract class Sigleton {
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
    };

    protected static getInstance(T: any) {
        let ins = app.InstanceMap.get(T.SigletonInsName);
        if (!ins) {
            ins = new T();
            app.InstanceMap.set(T.SigletonInsName, ins);
            ins.initInstance();
        }
        return ins;
    }
}