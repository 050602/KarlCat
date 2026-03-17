import { errLog } from "../LogTS";
import { app, isDebug } from "../app";
// import { ConfigMgr } from "../config/ConfigMgr";
import { Sigleton } from "../core/Sigleton";
import { ServerType } from "../register/route";

export class ConfigLoader extends Sigleton {
    public static get Instance(): ConfigLoader {
        return this.getInstance();
    }

    /**
     * 按需加载配置表
     */
    public async initConfig() {
        // await ConfigMgr.Instance.init();
        const configSuffixs: string[] = [];
        switch (app.serverType) {
            case ServerType.logic:
            case ServerType.fight:
            case ServerType.social:
            //魔王试练  每日重置 邮件 公会 领地战 语言表 cabala  公会战
            case ServerType.cross:
            case ServerType.realCross:
            case ServerType.rankList:
            case ServerType.background:
                configSuffixs.push("KV");
                configSuffixs.push("Role");
                configSuffixs.push("Lang");
                configSuffixs.push("Assets1");
                configSuffixs.push("Unpacked");
                configSuffixs.push("Cross");
                break;
            case ServerType.gate:
                // role，kv
                configSuffixs.push("KV");
                configSuffixs.push("Role");
                break;
            case ServerType.database:
            case ServerType.line:
                // KV
                configSuffixs.push("KV");
                break;
            case ServerType.logSave:
                configSuffixs.push("Lang");
                configSuffixs.push("Assets1");
                //gameAsset
                break;
            case ServerType.master:
            case ServerType.localLog:
                //不需要
                break;
        }
        //FIXME
        // for (let i = 0; i < configSuffixs.length; i++) {
        //     await ConfigMgr.Instance.loadSuffixs(configSuffixs[i]).catch((err) => {
        //         if (isDebug) {
        //             throw "初始化配置表异常:" + app.serverName + " config:" + configSuffixs[i] + "  error:" + err;
        //         }
        //         errLog("初始化配置表异常:" + app.serverName + " config:" + configSuffixs[i] + "  error:" + err);
        //     });;
        // }
    }
}
