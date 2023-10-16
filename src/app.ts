
import { Session } from "./components/session";
import { initCheckStruct } from "./connector/protocol";
import { getCpuUsage } from "./cpuUsage";
import DataBase from "./database/DataBase";
import { errLog, logProto } from "./LogTS";
import { connector, createApp } from "./mydog";
import { ServerName } from "./serverConfig/route";
export let app = createApp();

export const isDebug = true;


let connectorType = connector.Tcp;
if (app.serverInfo.serverType == ServerName.background) {
    connectorType = connector.Ws;
} 

app.setConfig("connector", { "connector": connectorType, "clientOnCb": clientOnCallback, "heartbeat": 20, "clientOffCb": clientOffCallback, "interval": 50 });

// app.setConfig("encodeDecode", getEncodeDecodeFunc());
app.setConfig("logger", (type: number, level: string, msg: string) => {
    if (level === "warn" || level === "error") {
        errLog(msg);
    }
});
app.setConfig("rpc", { "interval": 33, "heartbeat": 20 });
app.setConfig("mydogList", () => {
    return [{ "title": "cpu", "value": getCpuUsage() }]
})

app.configure(ServerName.gate, () => {
    // 当客户端给后端服务器发消息时，需要提供路由函数以决定该消息发到哪个服务器
    app.route(ServerName.logic, (session: Session) => {
        //理论上应该调用此路由之前，设置玩家的session 的 serverId
        //此处实际上是分配对应类型的服务器其中一个分配给玩家
        return ServerName.logic + "-" + session.get("serverId");
    });

    app.route(ServerName.fight, (session: Session) => {
        //理论上应该调用此路由之前，设置玩家的session 的 serverId
        //此处实际上是分配对应类型的服务器其中一个分配给玩家
        return ServerName.fight + "-" + session.get("serverId");
    });


    app.route(ServerName.scenarios, (session: Session) => {
        //理论上应该调用此路由之前，设置玩家的session 的 serverId
        //此处实际上是分配对应类型的服务器其中一个分配给玩家
        return ServerName.scenarios + "-" + session.get("serverId");
    });



});

app.configure(ServerName.chat, () => {
    app.route(ServerName.chat, (session: Session) => {
        return ServerName.chat + "-" + session.get("serverId");
    });
});

init();


async function init() {
    // await ConfigMgr.init();
    await DataBase.Instance.init();

    switch (app.serverType) {
        case ServerName.gate:
            break;
        case ServerName.logic:
            break;
        case ServerName.chat:
            break;
        case ServerName.background:
            break;
        case ServerName.master:
            break;
    }

    initCheckStruct();

    app.start();
}

// app.ts为程序入口文件

process.on("uncaughtException", function (err: any) {
    errLog( "uncaughtException", err)
});
process.on("unhandledRejection", function (err: any) {
    errLog( "unhandledRejection", err)
});

function clientOnCallback(session: Session) {
    logProto("one client on", session.uid, app.serverInfo);
}

function clientOffCallback(session: Session) {
    logProto("one client off", session.uid, app.serverInfo);
}
