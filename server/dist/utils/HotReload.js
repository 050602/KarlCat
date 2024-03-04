"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotReload = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const vm = __importStar(require("vm"));
const app_1 = require("../app");
const BaseServerLogic_1 = require("../components/BaseServerLogic");
const RpcEvent_1 = require("../event/RpcEvent");
const RegisterSigleton_1 = require("../register/RegisterSigleton");
const route_1 = require("../register/route");
const CoroutineLock_1 = require("./CoroutineLock");
const DateUtils_1 = require("./DateUtils");
const FileUtils_1 = require("./FileUtils");
const TSEventCenter_1 = require("./TSEventCenter");
const hotScriptPath = path.join(__dirname, "../");
//需要热更新功能，请调用以下的 HotReload.loadHandler 
class HotReload extends BaseServerLogic_1.BaseServerLogic {
    static get Instance() {
        return this.getInstance();
    }
    //当实例初始化时
    initInstance() {
        if (app_1.isDebug) {
            this.watchFile();
        }
        if (!app_1.isDebug) {
            //自动GC
            this.timerId = setInterval(() => {
                let last = Date.now();
                global.gc();
                console.log("gc Time(ms):", Date.now() - last);
            }, 10 * 60 * 1000);
        }
    }
    ;
    //当实例被销毁时
    destoryInstance() {
        TSEventCenter_1.TSEventCenter.Instance.unbind(RpcEvent_1.RpcEvent.OnHotReload, this);
        if (this.timerId != null) {
            clearInterval(this.timerId);
        }
    }
    ;
    //以下代码用于热重载
    async watchFile() {
        if (app_1.app.serverType == route_1.ServerType.master) {
            return;
        }
        this.coroutineLock = new CoroutineLock_1.CoroutineLock();
        let _fileList = [];
        let _sheetFileExts = [".js"];
        this.jsFile = new Map();
        FileUtils_1.FileUtils.findFile("./dist/servers", _sheetFileExts, _fileList);
        for (let n = 0; n < _fileList.length; n++) {
            let filePath = _fileList[n];
            let text = await FileUtils_1.FileUtils.readFile(filePath);
            this.jsFile.set(filePath, text);
        }
        _fileList.length = 0;
        FileUtils_1.FileUtils.findFile("./dist/modelLogic", _sheetFileExts, _fileList);
        for (let n = 0; n < _fileList.length; n++) {
            let filePath = _fileList[n];
            let text = await FileUtils_1.FileUtils.readFile(filePath);
            this.jsFile.set(filePath, text);
        }
        this.lock = new Map();
        let flag = true; //作为开关控制是否开启编译
        let t = fs.watch('./dist', {
            recursive: true
        }, ((event, filename) => {
            if (!filename) {
                return;
            }
            let func = async () => {
                await this.coroutineLock.lock();
                try {
                    flag = true;
                    if (filename.endsWith('js')) {
                        flag = false;
                    }
                    const regex = /servers\\/;
                    const regex2 = /modelLogic\\/;
                    if (regex.test(filename) || regex2.test(filename)) {
                    }
                    else {
                        // console.log("不需要处理的文件", filename);
                        this.coroutineLock.unlock();
                        return;
                    }
                    if (flag) {
                        this.coroutineLock.unlock();
                        return; //如果当前文件不是ts文件则不进行编译
                    }
                    // console.log(`检测到文件变化.....变化类型为${event}文件名字是${filename}`);
                    let now = DateUtils_1.DateUtils.timestamp();
                    let lock = this.lock.get(filename);
                    if (lock) {
                        let cha = now - lock;
                        //5秒CD
                        // console.log("cha", cha);
                        if (cha < 5000) {
                            this.coroutineLock.unlock();
                            return;
                        }
                    }
                    let file = await FileUtils_1.FileUtils.readFile(hotScriptPath + filename);
                    let lastFile = this.jsFile.get("dist\\" + filename);
                    if (lastFile != file) {
                        this.makeHotReload(hotScriptPath + filename);
                        this.jsFile.set(filename, file);
                        // console.log(app.serverInfo.serverName, "文件真的发生了变化", filename);
                    }
                    this.lock.set(filename, now);
                }
                catch (err) {
                    console.error(err);
                }
                this.coroutineLock.unlock();
            };
            func();
        }));
    }
    //以下代码用于热重载
    makeHotReload(filename) {
        // console.log(filename + '文件已被编译');
        let regex = /(\w+\.js)/;
        let match = filename.match(regex);
        if (match) {
            let fileName2 = match[1];
            // console.log(fileName2); // 输出：FightClient.js
            let insName = fileName2.split(".")[0];
            let path = filename.split(".")[0];
            //判断是否有实例，没有实例就别瞎几把处理了
            let ins = app_1.app.InstanceMap.get(insName);
            if (ins) {
                HotReload.loadHandler(path, insName);
            }
        }
    }
    // 热更新指定代码
    static loadHandler(filename, insName) {
        let newPath = filename + ".js";
        return new Promise((resolve, reject) => {
            fs.readFile(newPath, async (err, data) => {
                if (err) {
                    console.error("热更新加载文件失败", err);
                    console.log("热更新加载代码文件失败", filename, insName, err);
                    resolve(null);
                }
                else {
                    try {
                        // 使用vm模块的Script方法来预编译发生变化后的文件代码，检查语法错误，提前发现是否存在语法错误等报错
                        new vm.Script(data);
                    }
                    catch (e) {
                        // 语法错误,编译失败
                        reject(e);
                        return;
                    }
                    // 编译通过后，重新require加载最新的代码 doUpdateScript里有执行了resolve 不需要在此执行
                    // resolve(require(newPath));
                    this.doUpdateScript(newPath, insName);
                    RegisterSigleton_1.RegisterSigleton.onHotReload(newPath, insName);
                    // resolve(require(newPath));
                }
            });
        });
    }
    ;
    static async doUpdateScript(filename, insName) {
        let ins = app_1.app.InstanceMap.get(insName);
        if (ins) {
            ins.destoryInstance();
            ins._instance = null;
            app_1.app.InstanceMap.delete(insName);
        }
        else {
            insName = null;
        }
        let targetFile = require.resolve(filename);
        const cacheModule = require.cache[targetFile];
        if (cacheModule && require.main) {
            module.children.splice(module.children.indexOf(cacheModule), 1);
            cacheModule.children = [];
        }
        //以下API已弃用
        // const cacheModule = require.cache[targetFile];
        // if (cacheModule && cacheModule.parent) {
        // 	cacheModule.parent.children.splice(cacheModule.parent.children.indexOf(cacheModule), 1);
        // 	cacheModule.children = [];
        // }
        require.cache[targetFile] = null;
        delete require.cache[targetFile];
        // const code: any = await HotReload.loadHandler(targetFile, insName, ins);
        console.log(app_1.app.serverInfo.serverName, "热重载代码文件：", targetFile);
    }
}
exports.HotReload = HotReload;
//# sourceMappingURL=HotReload.js.map