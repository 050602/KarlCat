import { app } from "../app";
import { BackendServer } from "../components/backendServer";
import { Sigleton } from "../core/Sigleton";
import { ServerName } from "../serverConfig/sys/route";
import GateMain from "../servers/gate/GateMain";
import LoginMain from "../servers/logic/LoginMain";
import { HotReload } from "../utils/HotReload";

//注意：以下请根据字母大小进行排序放置，不然MAYBE有可能有人的强迫症会犯！
export class RegisterSigleton {
    public static initBack(server: any) {
        server.initMsgHandler(HotReload.Instance);
        switch (app.serverInfo.serverType) {
            case ServerName.logic:
                server.initMsgHandler(LoginMain.Instance);
                break;
        }


    }

    public static initForntend(server: any) {
        server.initMsgHandler(HotReload.Instance);
        switch (app.serverInfo.serverType) {
            case ServerName.gate:
                server.initMsgHandler(GateMain.Instance);
                break;
        }
    }

    public static onHotReload(path: string, insName: string) {
        const moudle = require(path);
        let server: BackendServer = app.backendServer;
        let sigleton: Sigleton = moudle[insName].Instance;
        sigleton.onHotReload();
        if (app.serverInfo.frontend == false) {
            server.initMsgHandler(sigleton);
        } else {
            sigleton["ServerType"] = app.serverType;
        }

    }
}