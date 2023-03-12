"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNoRpcKey = exports.startServer = exports.defaultConfiguration = void 0;
const backendServer_1 = require("../components/backendServer");
const frontendServer_1 = require("../components/frontendServer");
const master = __importStar(require("../components/master"));
const monitor = __importStar(require("../components/monitor"));
const msgCoder_1 = require("../components/msgCoder");
const rpcServer = __importStar(require("../components/rpcServer"));
const rpcService = __importStar(require("../components/rpcService"));
const LogTS_1 = require("../LogTS");
const master_1 = require("../serverConfig/master");
const servers_1 = require("../serverConfig/servers");
const BSON = require('bson');
const Long = BSON.Long;
/**
 * Load configuration
 * @param app
 */
function defaultConfiguration(app) {
    let args = parseArgs(process.argv);
    app.env = args.env || "development";
    loadBaseConfig(app);
    processArgs(app, args);
}
exports.defaultConfiguration = defaultConfiguration;
/**
 * Start the server
 * @param app
 */
function startServer(app) {
    startPng(app);
    (0, msgCoder_1.msgCoderSetApp)(app);
    // console.log("启动服务器", app.serverName);
    if (app.serverType === "master") {
        console.log("启动master服", app.serverName);
        master.start(app);
    }
    else if (app.frontend) {
        console.log("启动前端服", app.serverName);
        rpcService.init(app);
        app.frontendServer = new frontendServer_1.FrontendServer(app);
        rpcServer.start(app, function () {
            app.frontendServer.start(function () {
                monitor.start(app);
            });
        });
    }
    else {
        console.log("启动后端服", app.serverName);
        rpcService.init(app);
        app.backendServer = new backendServer_1.BackendServer(app);
        rpcServer.start(app, function () {
            app.backendServer.init();
            monitor.start(app);
            // TSEventCenter.Instance.event(KalrEvent.OnServerStart);
        });
    }
}
exports.startServer = startServer;
;
function getNoRpcKey(t1, t2) {
    if (t1 <= t2) {
        return t1 + "_" + t2;
    }
    else {
        return t2 + "_" + t1;
    }
}
exports.getNoRpcKey = getNoRpcKey;
let parseArgs = function (args) {
    let argsMap = {};
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
        }
        else if (value === "true") {
            value = true;
        }
        else if (value === "false") {
            value = false;
        }
        argsMap[key] = value;
    }
    return argsMap;
};
let loadBaseConfig = function (app) {
    // loadConfigBaseApp(app, "masterConfig");
    // loadConfigBaseApp(app, "serversConfig");
    let env = app.env;
    app.masterConfig = master_1.masterConfig[env];
    app.serversConfig = servers_1.serversConfig[env];
    parseServersConfig(app.serversConfig);
};
/** Parse the servers configuration */
function parseServersConfig(info) {
    for (let svrT in info) {
        let arr = info[svrT];
        for (let i = 0; i < arr.length;) {
            if (arr[i].port instanceof Array) {
                let one = arr[i];
                let newArr = [];
                let idStart = one.idStart || 0;
                let port = one.port[0];
                let len = one.port[1] - one.port[0] + 1;
                for (let j = 0; j < len; j++) {
                    let tmpOne = BSON.deserialize(BSON.serialize(one));
                    tmpOne.id = one.serverName + (idStart + j).toString();
                    tmpOne.port = port + j;
                    if (one.clientPort) {
                        tmpOne.clientPort = one.clientPort + j;
                    }
                    newArr.push(tmpOne);
                }
                arr.splice(i, 1, ...newArr);
                i += len;
            }
            else {
                i++;
            }
        }
    }
}
let processArgs = function (app, args) {
    app.main = args.main;
    let startAlone = !!args.serverName;
    app.serverName = args.serverName || app.masterConfig.serverName;
    app.isDaemon = !!args.isDaemon;
    if (app.serverName === app.masterConfig.serverName) {
        app.serverInfo = BSON.deserialize(BSON.serialize(app.masterConfig));
        app.serverInfo.serverType = "master";
        app.serverType = "master";
        app.startMode = startAlone ? "alone" : "all";
    }
    else {
        app.startMode = args.startMode === "all" ? "all" : "alone";
        let serverConfig = null;
        for (let serverType in app.serversConfig) {
            for (let one of app.serversConfig[serverType]) {
                if (one.serverName === app.serverName) {
                    serverConfig = BSON.deserialize(BSON.serialize(one));
                    serverConfig.serverType = serverType;
                    app.serverType = serverType;
                    break;
                }
            }
            if (serverConfig) {
                break;
            }
        }
        if (!serverConfig) {
            (0, LogTS_1.errLog)("ERROR-- no such server: " + app.serverName);
            process.exit();
        }
        app.serverInfo = serverConfig;
        app.frontend = !!serverConfig.frontend;
        let servers = {};
        servers[app.serverType] = [];
        servers[app.serverType].push(serverConfig);
        app.servers = servers;
        app.serversNameMap[serverConfig.serverName] = serverConfig;
    }
};
function startPng(app) {
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
//# sourceMappingURL=appUtil.js.map