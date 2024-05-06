import { app } from "../app";
import { Sigleton } from "../core/Sigleton";
import { ServerType } from "./route";
import { HotReload } from "../utils/HotReload";
import GateMain from "../servers/gate/GateMain";
import LoginMain from "../servers/logic/LoginMain";

//注意：以下请根据字母大小进行排序放置，不然MAYBE有可能有人的强迫症会犯！
export class RegisterSigleton {
    public static initMain() {
        HotReload.Instance;
        switch (app.serverInfo.serverType) {
            case ServerType.logic:
                LoginMain.Instance;
                break;
            case ServerType.rankList:
                break;
            case ServerType.fight:
                break;
            case ServerType.chat:
                break;
            case ServerType.database:
                break;
            case ServerType.logSave:
                break;
            case ServerType.cross:
                break;
            case ServerType.background:
                break;
            case ServerType.gate:
                GateMain.Instance;
                break;
            case ServerType.line:
                break;
            case ServerType.social:
                break;
        }
    }



    public static onHotReload(path: string, insName: string) {
        const moudle = require(path);
        let sigleton: Sigleton = moudle[insName].Instance;
        if (sigleton) {
            sigleton.onHotReload();
        }
    }
}