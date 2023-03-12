"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDebug = exports.app = void 0;
const protocol_1 = require("./connector/protocol");
const cpuUsage_1 = require("./cpuUsage");
const DataBase_1 = __importDefault(require("./database/DataBase"));
const LogTS_1 = require("./LogTS");
const mydog_1 = require("./mydog");
const route_1 = require("./serverConfig/route");
exports.app = (0, mydog_1.createApp)();
exports.isDebug = true;
let connectorType = mydog_1.connector.Tcp;
if (exports.app.serverInfo.serverType == route_1.ServerName.background) {
    connectorType = mydog_1.connector.Ws;
}
exports.app.setConfig("connector", { "connector": connectorType, "clientOnCb": clientOnCallback, "heartbeat": 20, "clientOffCb": clientOffCallback, "interval": 50 });
// app.setConfig("encodeDecode", getEncodeDecodeFunc());
exports.app.setConfig("logger", (type, level, msg) => {
    if (level === "warn" || level === "error") {
        (0, LogTS_1.errLog)(msg);
    }
});
exports.app.setConfig("rpc", { "interval": 33, "heartbeat": 20 });
exports.app.setConfig("mydogList", () => {
    return [{ "title": "cpu", "value": (0, cpuUsage_1.getCpuUsage)() }];
});
exports.app.configure(route_1.ServerName.gate, () => {
    // 当客户端给后端服务器发消息时，需要提供路由函数以决定该消息发到哪个服务器
    exports.app.route(route_1.ServerName.logic, (session) => {
        //理论上应该调用此路由之前，设置玩家的session 的 serverId
        //此处实际上是分配对应类型的服务器其中一个分配给玩家
        return route_1.ServerName.logic + "-" + session.get("serverId");
    });
    exports.app.route(route_1.ServerName.fight, (session) => {
        //理论上应该调用此路由之前，设置玩家的session 的 serverId
        //此处实际上是分配对应类型的服务器其中一个分配给玩家
        return route_1.ServerName.fight + "-" + session.get("serverId");
    });
    exports.app.route(route_1.ServerName.scenarios, (session) => {
        //理论上应该调用此路由之前，设置玩家的session 的 serverId
        //此处实际上是分配对应类型的服务器其中一个分配给玩家
        return route_1.ServerName.scenarios + "-" + session.get("serverId");
    });
});
exports.app.configure(route_1.ServerName.chat, () => {
    exports.app.route(route_1.ServerName.chat, (session) => {
        return route_1.ServerName.chat + "-" + session.get("serverId");
    });
});
init();
async function init() {
    // await ConfigMgr.init();
    await DataBase_1.default.Instance.init();
    switch (exports.app.serverType) {
        case route_1.ServerName.gate:
            break;
        case route_1.ServerName.logic:
            break;
        case route_1.ServerName.chat:
            break;
        case route_1.ServerName.background:
            break;
        case route_1.ServerName.master:
            break;
    }
    (0, protocol_1.initCheckStruct)();
    exports.app.start();
}
// servers 目录为通信消息入口。
// 如 chat 表示聊天类型服务器，handler目录下接收客户端消息，remote目录下接收服务器之间的rpc调用消息。
// 客户端发送chat.main.chat消息，服务器将会在servers/chat/handler/main.ts文件中的chat方法处收到消息，
// 收到消息后调用next()即可发送数据给客户端。开发者调用 app.rpc("chat-server-1").chat.main.offline()，将会在servers/chat/remote/main.ts文件中的offline方法处收到消息。
// app.ts为程序入口文件
process.on("uncaughtException", function (err) {
    (0, LogTS_1.errLog)("uncaughtException", err);
});
process.on("unhandledRejection", function (err) {
    (0, LogTS_1.errLog)("unhandledRejection", err);
});
function clientOnCallback(session) {
    (0, LogTS_1.logProto)("one client on", session.uid, exports.app.serverInfo);
}
function clientOffCallback(session) {
    (0, LogTS_1.logProto)("one client off", session.uid, exports.app.serverInfo);
}
//# sourceMappingURL=app.js.map