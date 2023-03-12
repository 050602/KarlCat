

import { Application } from "../application";
import { BackendServer } from "../components/backendServer";
import { FrontendServer } from "../components/frontendServer";
import * as master from "../components/master";
import * as monitor from "../components/monitor";
import { msgCoderSetApp } from "../components/msgCoder";
import * as rpcServer from "../components/rpcServer";
import * as rpcService from "../components/rpcService";
import { errLog } from "../LogTS";
import { masterConfig } from "../serverConfig/master";
import { serversConfig } from "../serverConfig/servers";
import { ServerInfo } from "./interfaceDefine";
const BSON = require('bson');
const Long = BSON.Long;



/**
 * Load configuration
 * @param app 
 */
export function defaultConfiguration(app: Application) {
    let args = parseArgs(process.argv);
    app.env = args.env || "development";
    loadBaseConfig(app);
    processArgs(app, args);
}

/**
 * Start the server
 * @param app 
 */
export function startServer(app: Application) {
    startPng(app);
    msgCoderSetApp(app);
    // console.log("启动服务器", app.serverName);
    if (app.serverType === "master") {
        console.log("启动master服", app.serverName);
        master.start(app);
    } else if (app.frontend) {
        console.log("启动前端服", app.serverName);
        rpcService.init(app);
        app.frontendServer = new FrontendServer(app);
        rpcServer.start(app, function () {
            app.frontendServer.start(function () {
                monitor.start(app);
            });
        });

    } else {
        console.log("启动后端服", app.serverName);
        rpcService.init(app);
        app.backendServer = new BackendServer(app);
        rpcServer.start(app, function () {
            app.backendServer.init();
            monitor.start(app);
            // TSEventCenter.Instance.event(KalrEvent.OnServerStart);
        });
    }
};


export function getNoRpcKey(t1: string, t2: string) {
    if (t1 <= t2) {
        return t1 + "_" + t2;
    } else {
        return t2 + "_" + t1;
    }
}

let parseArgs = function (args: any[]) {
    let argsMap = {} as any;
    let mainPos = 1;

    while (args[mainPos].indexOf('--') > 0) {
        mainPos++;
    }
    argsMap.main = args[mainPos];

    for (let i = (mainPos + 1); i < args.length; i++) {
        let arg = args[i];
        let sep = arg.indexOf('=');
        let key = arg.slice(0, sep);
        let value = arg.slice(sep + 1);
        if (!isNaN(Number(value)) && (value.indexOf('.') < 0)) {
            value = Number(value);
        } else if (value === "true") {
            value = true;
        } else if (value === "false") {
            value = false;
        }
        argsMap[key] = value;
    }

    return argsMap;
};


let loadBaseConfig = function (app: Application) {
    // loadConfigBaseApp(app, "masterConfig");
    // loadConfigBaseApp(app, "serversConfig");
    let env = app.env;
    app.masterConfig = masterConfig[env];
    app.serversConfig = serversConfig[env];
    parseServersConfig(app.serversConfig);
};

/** Parse the servers configuration */
function parseServersConfig(info: { [serverType: string]: ServerInfo[] }) {
    for (let svrT in info) {
        let arr = info[svrT];
        for (let i = 0; i < arr.length;) {
            if ((arr[i].port as any) instanceof Array) {
                let one = arr[i];
                let newArr: ServerInfo[] = [];
                let idStart = one.idStart || 0;
                let port = (one.port as any)[0];
                let len = (one.port as any)[1] - (one.port as any)[0] + 1;
                for (let j = 0; j < len; j++) {
                    let tmpOne: any = BSON.deserialize(BSON.serialize(one));
                    tmpOne.id = one.serverName + (idStart + j).toString();
                    tmpOne.port = port + j;
                    if (one.clientPort) {
                        tmpOne.clientPort = one.clientPort + j;
                    }
                    newArr.push(tmpOne);
                }
                arr.splice(i, 1, ...newArr);
                i += len;
            } else {
                i++;
            }
        }
    }
}


let processArgs = function (app: Application, args: { main: string, serverName: string, isDaemon: string, startMode: string }) {
    app.main = args.main;
    let startAlone = !!args.serverName;
    app.serverName = args.serverName || app.masterConfig.serverName;
    app.isDaemon = !!args.isDaemon;
    if (app.serverName === app.masterConfig.serverName) {
        app.serverInfo = BSON.deserialize(BSON.serialize(app.masterConfig)) as ServerInfo;
        (app.serverInfo as any).serverType = "master";
        app.serverType = "master";
        app.startMode = startAlone ? "alone" : "all";
    } else {
        app.startMode = args.startMode === "all" ? "all" : "alone";
        let serverConfig: ServerInfo = null as any;
        for (let serverType in app.serversConfig) {
            for (let one of app.serversConfig[serverType]) {
                if (one.serverName === app.serverName) {
                    serverConfig = BSON.deserialize(BSON.serialize(one)) as ServerInfo;
                    (serverConfig as any).serverType = serverType;
                    app.serverType = serverType;
                    break;
                }
            }
            if (serverConfig) {
                break;
            }
        }
        if (!serverConfig) {
            errLog("ERROR-- no such server: " + app.serverName);
            process.exit();
        }
        app.serverInfo = serverConfig;
        app.frontend = !!serverConfig.frontend;

        let servers: { [serverType: string]: ServerInfo[] } = {};
        servers[app.serverType] = [];
        servers[app.serverType].push(serverConfig);
        app.servers = servers;
        app.serversNameMap[serverConfig.serverName] = serverConfig;
    }
};

function startPng(app: Application) {
    if (app.serverType !== "master" && app.startMode === "all") {
        return;
    }
    let lines = [
        "  ※----------------------※",
        "  ※   ----------------   ※",
        "  ※  ( karlcat   @aan )  ※",
        "  ※   ----------------   ※",
        "  ※                      ※",
        "  ※                      ※",
        "  ※----------------------※",
    ];
    let version = require("../mydog").version;
    version = "Ver: " + version;
    console.log("      ");
    for (let i = 0; i < lines.length; i++) {
        if (i === 5) {
            let j;
            let chars = lines[i].split('');
            let len = chars.length - 2 - version.length;
            len = Math.floor(len / 2);
            let index = 2 + len;
            for (j = 0; j < version.length; j++) {
                chars[index + j] = version[j];
            }
            lines[i] = chars.join('');
        }
        console.log(lines[i]);
    }
    console.log("  ");
}
