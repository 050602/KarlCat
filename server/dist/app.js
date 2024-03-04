"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.allDataLog = exports.allTables = exports.language = exports.BigChannelName = exports.OnlyIdRangNum = exports.BigServerId = exports.isDebug = exports.app = void 0;
const kcpProtocol_1 = require("./connector/kcpProtocol");
const DataBase_1 = require("./database/DataBase");
const mydog_1 = require("./mydog");
const RegisterSigleton_1 = require("./register/RegisterSigleton");
const route_1 = require("./register/route");
// import { ServerDataMain } from "./servers/Background/ServerDataMain";
const SocketState_1 = require("./const/SocketState");
const define_1 = require("./util/define");
const CommonUtils_1 = require("./utils/CommonUtils");
const DateUtils_1 = require("./utils/DateUtils");
const GateMain_1 = __importDefault(require("./servers/gate/GateMain"));
exports.app = (0, mydog_1.createApp)();
exports.isDebug = true;
//当然，因为之后会切换后端框架，这个问题不大
exports.BigServerId = 1; //区ID
exports.OnlyIdRangNum = 1000; //唯一ID区间包含ID数
exports.BigChannelName = "aofei"; //区ID
exports.language = "cn"; //当前执行语言环境类型，之后可能读后台吧？
const handleExit = (code, error) => {
    console.error(DateUtils_1.DateUtils.formatFullTime2(DateUtils_1.DateUtils.timestamp()), "handleExit", code, error);
};
exports.allTables = [];
exports.allDataLog = {};
exports.BigServerId = exports.app.zoneConfig.zoneid;
let connectorType = mydog_1.connector.Tcp;
if (exports.app.serverInfo.serverType == route_1.ServerType.background) {
    connectorType = mydog_1.connector.Ws;
    // let bg = ServerDataMain.Instance;//需要监听on start all
}
let connConfig = {
    connector: connectorType,
    clientOnCb: clientOnCallback,
    heartbeat: 2,
    clientOffCb: clientOffCallback,
    interval: 30
};
let rpcConfig = {
    interval: 20,
    heartbeat: 20,
    timeout: 20
};
if (exports.isDebug) {
    //服务器间心跳检测间隔
    define_1.some_config.Time.Rpc_Heart_Beat_Timeout_Time = 2000;
    define_1.some_config.Time.Monitor_Heart_Beat_Time = 2000;
    rpcConfig.heartbeat = 2000;
    rpcConfig.timeout = 2000;
}
exports.app.setConfig("rpc", rpcConfig);
exports.app.setConfig("connector", connConfig);
exports.app.setConfig("logger", (type, level, msg) => {
    if (level === "warn" || level === "error") {
        console.error(msg);
    }
});
// app.setConfig("mydogList", () => {
//     return [{ "title": "cpu", "value": getCpuUsage() }]
// })
if (connectorType == mydog_1.connector.Kcp) {
    exports.app.setConfig("encodeDecode", kcpProtocol_1.kcp_encodeDecode);
}
exports.app.configure(route_1.ServerType.gate, () => {
    // 当客户端给后端服务器发消息时，需要提供路由函数以决定该消息发到哪个服务器
    exports.app.route(route_1.ServerType.logic, (session) => {
        //理论上应该调用此路由之前，设置玩家的session 的 serverId
        //此处实际上是分配对应类型的服务器其中一个分配给玩家
        return route_1.ServerType.logic + "-" + session.get("serverId");
    });
    exports.app.route(route_1.ServerType.fight, (session) => {
        //理论上应该调用此路由之前，设置玩家的session 的 serverId
        //此处实际上是分配对应类型的服务器其中一个分配给玩家
        return route_1.ServerType.fight + "-" + session.get("fightLine");
    });
    exports.app.route(route_1.ServerType.chat, (session) => {
        return route_1.ServerType.chat + "-" + session.get("serverId");
        ;
    });
    exports.app.route(route_1.ServerType.cross, (session) => {
        return route_1.ServerType.cross + "-1";
    });
    exports.app.route(route_1.ServerType.social, (session) => {
        return route_1.ServerType.social + "-1";
    });
});
// app.configure(ServerName.chat, () => {
//     app.route(ServerName.chat, (session: Session) => {
//         return ServerName.chat + "-" + session.get("serverId");
//     });
// });
init();
async function init() {
    if (exports.BigServerId < 1 || exports.BigServerId > 32000) {
        console.error("bigServerId out range:", exports.BigServerId);
        return;
    }
    // await ConfigMgr.Instance.init();
    // setInterval(() => {
    //     console.log("pro", app.serverName, getCpuUsage());
    // }, 5000);
    exports.app.start();
    if (exports.app.serverInfo.serverType != route_1.ServerType.database) {
        await CommonUtils_1.CommonUtils.sleep(8000); // todo2
    }
    RegisterSigleton_1.RegisterSigleton.initMain();
    switch (exports.app.serverType) {
        case route_1.ServerType.line:
            break;
        case route_1.ServerType.gate:
            break;
        case route_1.ServerType.logic:
            break;
        case route_1.ServerType.chat:
            break;
        case route_1.ServerType.background:
            SocketState_1.SocketState.Instance.openClientSocket = true;
            break;
        case route_1.ServerType.master:
            //实例化Master
            break;
        case route_1.ServerType.database:
            //初始化服务器数据
            await DataBase_1.DataBase.Instance.init();
            break;
        case route_1.ServerType.logSave:
            //初始化在线人数
            break;
    }
}
// servers 目录为通信消息入口。
// 如 chat 表示聊天类型服务器，handler目录下接收客户端消息，remote目录下接收服务器之间的rpc调用消息。
// 客户端发送chat.main.chat消息，服务器将会在servers/chat/handler/main.ts文件中的chat方法处收到消息，
// 收到消息后调用next()即可发送数据给客户端。开发者调用 app.rpc("chat-server-1").chat.main.offline()，将会在servers/chat/remote/main.ts文件中的offline方法处收到消息。
// app.ts为程序入口文件
process.on("exit", function (code) {
    console.error(DateUtils_1.DateUtils.formatFullTime2(DateUtils_1.DateUtils.timestamp()), "exit code:", code);
});
process.on("uncaughtException", function (err, origin) {
    console.error(DateUtils_1.DateUtils.formatFullTime2(DateUtils_1.DateUtils.timestamp()), "uncaughtException", err?.stack);
});
process.on("unhandledRejection", function (err, origin) {
    console.error(DateUtils_1.DateUtils.formatFullTime2(DateUtils_1.DateUtils.timestamp()), "unhandledRejection", err?.stack);
});
// 监听各种退出事件
// 按照 POSIX 的规范，我们用 128 + 信号编号 得到最终的退出码
// 信号编号参考下面的图片，大家可以在 linux 系统下执行 kill -l 查看所有的信号编号
process.on('SIGHUP', (err) => handleExit(128 + 1, err));
process.on('SIGINT', (err) => handleExit(128 + 2, err));
process.on('SIGTERM', (err) => handleExit(128 + 15, err));
// windows 下按下 ctrl+break 的退出信号
process.on('SIGBREAK', (err) => handleExit(128 + 21, err));
function clientOnCallback(session) {
    GateMain_1.default.Instance.clientOnCallback(session);
}
async function clientOffCallback(session) {
    console.log("socket 断开 clientOffCallback", session.uid);
}
//# sourceMappingURL=app.js.map