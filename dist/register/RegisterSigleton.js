"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterSigleton = void 0;
const app_1 = require("../app");
const route_1 = require("../serverConfig/route");
const GateMain_1 = __importDefault(require("../servers/gate/GateMain"));
const LoginMain_1 = __importDefault(require("../servers/logic/LoginMain"));
//注意：以下请根据字母大小进行排序放置，不然MAYBE有可能有人的强迫症会犯！
class RegisterSigleton {
    static initBack(server) {
        switch (app_1.app.serverInfo.serverType) {
            case route_1.ServerName.logic:
                server.initMsgHandler(LoginMain_1.default.Instance);
                break;
        }
    }
    static initForntend(server) {
        switch (app_1.app.serverInfo.serverType) {
            case route_1.ServerName.gate:
                server.initMsgHandler(GateMain_1.default.Instance);
                break;
        }
    }
}
exports.RegisterSigleton = RegisterSigleton;
//# sourceMappingURL=RegisterSigleton.js.map