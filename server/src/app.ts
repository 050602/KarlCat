
import { Session } from "./components/session";
import { kcp_encodeDecode } from "./connector/kcpProtocol";
import { DataBase } from "./database/DataBase";
import { connector, createApp } from "./mydog";
import { RegisterSigleton } from "./register/RegisterSigleton";
import { ServerType } from "./register/route";
import { DatabaseEvent } from "./event/DatabaseEvent";
// import { ServerDataMain } from "./servers/Background/ServerDataMain";
import { SocketState } from "./const/SocketState";
import { some_config } from "./util/define";
import { I_connectorConfig, I_rpcConfig } from "./util/interfaceDefine";
import { CommonUtils } from "./utils/CommonUtils";
import { DateUtils } from "./utils/DateUtils";
import { TSEventCenter } from "./utils/TSEventCenter";
import GateMain from "./servers/gate/GateMain";
import { CrossRpcClientSocket, removeCrossRPCSocket } from "./components/crossRpcClient";



export let app = createApp();
const DB_READY_CHECK_INTERVAL_MS = 500;
const DB_READY_CHECK_TIMEOUT_MS = 30000;
const SHUTDOWN_FORCE_EXIT_MS = 5000;

export const isDebug = true;
//当然，因为之后会切换后端框架，这个问题不大
export let BigServerId: number = 1;//区ID
export let OnlyIdRangNum: number = 1000;//唯一ID区间包含ID数
export let BigChannelName: string = "aofei";//区ID
export let language: "cn" | "en" = "cn";//当前执行语言环境类型，之后可能读后台吧？


let shutdowning = false;
const handleExit = (code: number, error: any) => {
    void gracefulShutdown(code, error);
};

export let allTables: any[] = [];
export let allDataLog: any = {};
BigServerId = app.zoneConfig.zoneid;

let connectorType = connector.Tcp;
if (app.serverInfo.serverType == ServerType.background) {
    connectorType = connector.Ws;
    // let bg = ServerDataMain.Instance;//需要监听on start all
}
let connConfig: I_connectorConfig = {
    connector: connectorType,
    clientOnCb: clientOnCallback,
    heartbeat: 2,
    clientOffCb: clientOffCallback,
    interval: 30
}


let rpcConfig: I_rpcConfig = {
    interval: 20,
    heartbeat: 20,
    timeout: 20
}

if (isDebug) {
    //服务器间心跳检测间隔
    some_config.Time.Rpc_Heart_Beat_Timeout_Time = 2000;
    some_config.Time.Monitor_Heart_Beat_Time = 2000;
    rpcConfig.heartbeat = 2000;
    rpcConfig.timeout = 2000;
}


app.setConfig("rpc", rpcConfig);
app.setConfig("connector", connConfig);
app.setConfig("logger", (type: number, level: string, msg: string) => {
    if (level === "warn" || level === "error") {
        console.error(msg);
    }
});


// app.setConfig("mydogList", () => {
//     return [{ "title": "cpu", "value": getCpuUsage() }]
// })
if (connectorType == connector.Kcp) {
    app.setConfig("encodeDecode", kcp_encodeDecode);
}

app.configure(ServerType.gate, () => {
    // 当客户端给后端服务器发消息时，需要提供路由函数以决定该消息发到哪个服务器
    app.route(ServerType.logic, (session: Session) => {
        //理论上应该调用此路由之前，设置玩家的session 的 serverId
        //此处实际上是分配对应类型的服务器其中一个分配给玩家
        return ServerType.logic + "-" + session.get("serverId");
    });

    app.route(ServerType.fight, (session: Session) => {
        //理论上应该调用此路由之前，设置玩家的session 的 serverId
        //此处实际上是分配对应类型的服务器其中一个分配给玩家
        return ServerType.fight + "-" + session.get("fightLine");
    });


    app.route(ServerType.chat, (session: Session) => {
        return ServerType.chat + "-" + session.get("serverId");;
    });

    app.route(ServerType.cross, (session: Session) => {
        return ServerType.cross + "-1";
    });
    app.route(ServerType.realCross, (session: Session) => {
        return ServerType.cross + "-1";
    });
    app.route(ServerType.social, (session: Session) => {
        return ServerType.social + "-1";
    });
});

// app.configure(ServerName.chat, () => {
//     app.route(ServerName.chat, (session: Session) => {
//         return ServerName.chat + "-" + session.get("serverId");
//     });
// });

init();
async function init() {
    if (BigServerId < 1 || BigServerId > 32000) {
        console.error("bigServerId out range:", BigServerId);
        return;
    }
    // await ConfigMgr.Instance.init();

    // setInterval(() => {
    //     console.log("pro", app.serverName, getCpuUsage());
    // }, 5000);

    app.start();

    if (app.serverInfo.serverType != ServerType.database) {
        let dbReady = await waitForDatabaseRpcReady();
        if (!dbReady) {
            console.error("database rpc not ready before initMain", app.serverName, DB_READY_CHECK_TIMEOUT_MS);
        }
    }

    RegisterSigleton.initMain();

    switch (app.serverType) {
        case ServerType.line:
            break;
        case ServerType.gate:
            break;
        case ServerType.logic:
            break;
        case ServerType.chat:
            break;
        case ServerType.background:
            SocketState.Instance.openClientSocket = true;
            break;
        case ServerType.master:
            //实例化Master
            break;
        case ServerType.database:
            //初始化服务器数据
            await DataBase.Instance.init();
            break;
        case ServerType.logSave:
            //初始化在线人数
            break;
        case ServerType.cross:
            initCrossProxyToRealCross();
            break;
        case ServerType.realCross:
            break;

    }

}

function initCrossProxyToRealCross() {
    if (app.serverType !== ServerType.cross) {
        return;
    }
    let cfg = (app.zoneConfig as any).realCrossConfig;
    if (!cfg) {
        return;
    }
    let host = cfg.host;
    let port = Number(cfg.port);
    let zoneId = Number(cfg.zoneId);
    if (!host || !port || !zoneId) {
        console.warn("invalid realCrossConfig, skip cross->realCross connect", app.serverName, cfg);
        return;
    }

    let targetName = "CrossNet-" + zoneId;
    app.set("realCrossSocketName", targetName);
    app.set("enableCrossCmdForward", !!cfg.proxyClientCmd);

    removeCrossRPCSocket(targetName);
    new CrossRpcClientSocket(app, {
        serverId: zoneId,
        serverName: targetName,
        host: host,
        port: port,
        frontend: false,
        clientPort: 0,
        serverType: ServerType.realCross,
    } as any);
}

async function waitForDatabaseRpcReady(): Promise<boolean> {
    if (app.serverInfo.serverType == ServerType.master) {
        return true;
    }
    let dbInfos = app.serversConfig[ServerType.database];
    if (!dbInfos || dbInfos.length == 0) {
        console.warn("database server config not found, skip readiness check", app.serverName);
        return true;
    }
    let dbServerName = dbInfos[0].serverName;
    let timeoutAt = Date.now() + DB_READY_CHECK_TIMEOUT_MS;
    while (Date.now() < timeoutAt) {
        if (!app.rpcPool.getSocket(dbServerName)) {
            await CommonUtils.sleep(DB_READY_CHECK_INTERVAL_MS);
            continue;
        }
        if (typeof app.rpcDB != "function") {
            return true;
        }
        try {
            let dbReady = await app.rpcDB(dbServerName, DatabaseEvent.OnHealthCheck);
            if (dbReady === true) {
                return true;
            }
        } catch (err) {
            // keep retrying until timeout
        }
        await CommonUtils.sleep(DB_READY_CHECK_INTERVAL_MS);
    }
    return false;
}

async function gracefulShutdown(code: number, error: any) {
    if (shutdowning) {
        return;
    }
    shutdowning = true;
    console.error(DateUtils.formatFullTime2(DateUtils.msSysTick), "handleExit", code, error);

    let forceTimer = setTimeout(() => {
        console.error("gracefulShutdown timeout, force exit", app.serverName, code);
        process.exit(code);
    }, SHUTDOWN_FORCE_EXIT_MS);

    try {
        TSEventCenter.Instance.clearAllCMDLocks();
        if (app.frontend) {
            app.killAllClients();
        }
        app.rpcPool.closeAllSockets();

        let dbInst = app.InstanceMap.get("DataBase") as DataBase;
        if (dbInst?.db?.disconnect) {
            await dbInst.db.disconnect();
        }
    } catch (err) {
        console.error("gracefulShutdown error", err);
    } finally {
        clearTimeout(forceTimer);
        await CommonUtils.sleep(100);
        process.exit(code);
    }
}


// servers 目录为通信消息入口。
// 如 chat 表示聊天类型服务器，handler目录下接收客户端消息，remote目录下接收服务器之间的rpc调用消息。
// 客户端发送chat.main.chat消息，服务器将会在servers/chat/handler/main.ts文件中的chat方法处收到消息，
// 收到消息后调用next()即可发送数据给客户端。开发者调用 app.rpc("chat-server-1").chat.main.offline()，将会在servers/chat/remote/main.ts文件中的offline方法处收到消息。
// app.ts为程序入口文件

process.on("exit", function (code) {
    console.error(DateUtils.formatFullTime2(DateUtils.msSysTick), "exit code:", code);
});
process.on("uncaughtException", function (err: Error, origin: Promise<any>) {
    console.error(DateUtils.formatFullTime2(DateUtils.msSysTick), "uncaughtException", err?.stack);
});
process.on("unhandledRejection", function (err: Error, origin: Promise<any>) {
    console.error(DateUtils.formatFullTime2(DateUtils.msSysTick), "unhandledRejection", err?.stack);
});

// 监听各种退出事件
// 按照 POSIX 的规范，我们用 128 + 信号编号 得到最终的退出码
// 信号编号参考下面的图片，大家可以在 linux 系统下执行 kill -l 查看所有的信号编号
process.on('SIGHUP', (err: any) => handleExit(128 + 1, err));
process.on('SIGINT', (err: any) => handleExit(128 + 2, err));
process.on('SIGTERM', (err: any) => handleExit(128 + 15, err));
// windows 下按下 ctrl+break 的退出信号
process.on('SIGBREAK', (err: any) => handleExit(128 + 21, err));


function clientOnCallback(session: Session) {
    GateMain.Instance.clientOnCallback(session);

}

async function clientOffCallback(session: Session) {
    console.log("socket 断开 clientOffCallback", session.uid)
}


