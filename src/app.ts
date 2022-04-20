
import { getCpuUsage } from "./cpuUsage";
import { getEncodeDecodeFunc } from "./proto/encode_decode";
import { lanlu } from "./proto/protobuf/proto.js";
import { connector, createApp } from "./mydog";
import { Session } from "./components/session";
import { ServerName } from "./config/sys/protoToServerName";
import { gzaLog } from "./LogTS";
export let app = createApp();

app.setConfig("connector", { "connector": connector.Tcp, "clientOnCb": clientOnCallback, "heartbeat": 20, "clientOffCb": clientOffCallback, "interval": 50 });
// app.setConfig("encodeDecode", getEncodeDecodeFunc());
app.setConfig("logger", (type: number, level: string, msg: string) => {
    if (level === "warn" || level === "error") {
        console.log(msg);
    }
});
app.setConfig("rpc", { "interval": 33, "heartbeat": 20 });
app.setConfig("mydogList", () => {
    return [{ "title": "cpu", "value": getCpuUsage() }]
})

//如果当前是ServerName.connector（第一个），则路由到ServerName.connector（第二个）
app.configure(ServerName.gate, () => {
    app.route(ServerName.connector, (session: Session) => {
        //理论上应该调用此路由之前，设置玩家的session 的 serverId
        return ServerName.connector + "-1";
        return ServerName.connector + "-" + session.get("serverId");
    });
});


app.start();

// servers 目录为通信消息入口。
// 如 chat 表示聊天类型服务器，handler目录下接收客户端消息，remote目录下接收服务器之间的rpc调用消息。
// 客户端发送chat.main.chat消息，服务器将会在servers/chat/handler/main.ts文件中的chat方法处收到消息，
// 收到消息后调用next()即可发送数据给客户端。开发者调用 app.rpc("chat-server-1").chat.main.offline()，将会在servers/chat/remote/main.ts文件中的offline方法处收到消息。
// app.ts为程序入口文件

process.on("uncaughtException", function (err: any) {
    console.log(err)
});


// function msgDecode(cmd: number, msg: Buffer): any {
//     let msgStr = msg.toString();
//     console.log("↑ ", app.routeConfig[cmd], msgStr);
//     return JSON.parse(msgStr);
// }

// function msgEncode(cmd: number, msg: any): Buffer {
//     let msgStr = JSON.stringify(msg);
//     console.log(" ↓", app.routeConfig[cmd], msgStr);
//     return Buffer.from(msgStr);
// }


function clientOnCallback(session: Session) {
    console.log("one client on");
}

function clientOffCallback(session: Session) {
    console.log("one client off");
}