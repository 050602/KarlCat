"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterSigleton = void 0;
const app_1 = require("../app");
const route_1 = require("./route");
// import { BGUserMgrMain } from "../servers/Background/BGUserMgrMain";
// import { BackgroundMain } from "../servers/Background/BackgroundMain";
// import { BgActivity } from "../servers/Background/BgActivity";
// import { BgCharge } from "../servers/Background/BgCharge";
// import { BgHotReload } from "../servers/Background/BgHotReload";
// import { BgLogMain } from "../servers/Background/BgLogMain";
// import { BgMail } from "../servers/Background/BgMail";
// import { RunNoticeMain } from "../servers/Background/RunNoticeMain";
// import { ServerDataMain } from "../servers/Background/ServerDataMain";
const HotReload_1 = require("../utils/HotReload");
const GateMain_1 = __importDefault(require("../servers/gate/GateMain"));
const LoginMain_1 = __importDefault(require("../servers/logic/LoginMain"));
//注意：以下请根据字母大小进行排序放置，不然MAYBE有可能有人的强迫症会犯！
class RegisterSigleton {
    static initMain() {
        HotReload_1.HotReload.Instance;
        switch (app_1.app.serverInfo.serverType) {
            case route_1.ServerType.logic:
                LoginMain_1.default.Instance;
                break;
            case route_1.ServerType.rankList:
                break;
            case route_1.ServerType.fight:
                break;
            case route_1.ServerType.chat:
                break;
            case route_1.ServerType.database:
                break;
            case route_1.ServerType.logSave:
                break;
            case route_1.ServerType.cross:
                break;
            case route_1.ServerType.background:
                break;
            case route_1.ServerType.gate:
                GateMain_1.default.Instance;
                break;
            case route_1.ServerType.line:
                break;
            case route_1.ServerType.social:
                break;
        }
    }
    static onHotReload(path, insName) {
        const moudle = require(path);
        let sigleton = moudle[insName].Instance;
        if (sigleton) {
            sigleton.onHotReload();
        }
    }
}
exports.RegisterSigleton = RegisterSigleton;
//# sourceMappingURL=RegisterSigleton.js.map