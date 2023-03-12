import { app } from "../app";
import { BackendServer } from "../components/backendServer";
import { Sigleton } from "../core/Sigleton";
import { ServerName } from "../serverConfig/route";
import GateMain from "../servers/gate/GateMain";
import LoginMain from "../servers/logic/LoginMain";

//注意：以下请根据字母大小进行排序放置，不然MAYBE有可能有人的强迫症会犯！
export class RegisterSigleton {
    public static initBack(server: any) {
        switch (app.serverInfo.serverType) {
            case ServerName.logic:
                server.initMsgHandler(LoginMain.Instance);
                break;
        }


    }

    public static initForntend(server: any) {
        switch (app.serverInfo.serverType) {
            case ServerName.gate:
                server.initMsgHandler(GateMain.Instance);
                break;
        }
    }

}