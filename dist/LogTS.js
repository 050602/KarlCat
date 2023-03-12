"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatLog = exports.operationLog = exports.assetLog = exports.errLog = exports.warningLog = exports.logRPC = exports.logProto = exports.logTest = exports.logInfo = exports.LogTS = exports.logFight = exports.logServer = void 0;
const log4js_1 = __importDefault(require("log4js"));
const app_1 = require("./app");
const logger = log4js_1.default.getLogger();
log4js_1.default.configure({
    appenders: {
        production: {
            type: 'dateFile',
            filename: './logs/debug.log',
            alwaysIncludePattern: true,
            keepFileExt: true,
            maxLogSize: 10485760, // 文件最大存储空间 10M
        },
        fight: {
            type: "multiFile",
            base: "./logs/fight/",
            property: "roleUid",
            extension: ".log",
            maxLogSize: 10485760,
            backups: 1,
            compress: true, //压缩
        },
        operation: {
            type: "multiFile",
            base: "./logs/operation/",
            property: "roleUid",
            extension: ".log",
            maxLogSize: 10485760,
            backups: 1,
            compress: true, //压缩
        },
        asset: {
            type: "multiFile",
            base: "./logs/asset/",
            property: "roleUid",
            extension: ".log",
            maxLogSize: 10485760,
            backups: 1,
            compress: true, //压缩
        },
        chat: {
            type: "multiFile",
            base: "./logs/chat/",
            property: "roleUid",
            extension: ".log",
            maxLogSize: 10485760,
            backups: 1,
            compress: true, //压缩
        },
        serverData: {
            type: 'dateFile',
            filename: './logs/serverData/logs.log',
            alwaysIncludePattern: true,
            keepFileExt: true,
            maxLogSize: 10485760, // 文件最大存储空间 10M
        },
    },
    categories: {
        default: { appenders: ['production'], level: 'info' },
        fight: { appenders: ['fight'], level: 'info' },
        operation: { appenders: ['operation'], level: 'info' },
        asset: { appenders: ['asset'], level: 'info' },
        chat: { appenders: ['chat'], level: 'info' },
        serverData: { appenders: ['serverData'], level: 'info' },
    }
});
const serverLogger = log4js_1.default.getLogger("serverData");
let fightLog = new Map(); //key 战斗ID
let assetLogMap = new Map(); //key 战斗ID
let operationLogMap = new Map(); //key 战斗ID
let chatLogMap = new Map(); //key 战斗ID
let logServer = (...data) => {
    serverLogger.info(data);
};
exports.logServer = logServer;
let logFight = (fightId, ...data) => {
    let flogger = fightLog.get(fightId);
    if (!flogger) {
        LogTS.setFightLog(fightId);
        flogger = fightLog.get(fightId);
    }
    flogger.info(data);
};
exports.logFight = logFight;
class LogTS {
    static setFightLog(fightId) {
        let userLogger = log4js_1.default.getLogger("fight");
        userLogger.addContext("roleUid", fightId);
        fightLog.set(fightId, userLogger);
    }
    static setAsset(roleUid) {
        let assetLogger = log4js_1.default.getLogger("asset");
        assetLogger.addContext("roleUid", roleUid);
        assetLogMap.set(roleUid, assetLogger);
    }
    static setOperation(roleUid) {
        let operationLogger = log4js_1.default.getLogger("operation");
        operationLogger.addContext("roleUid", roleUid);
        operationLogMap.set(roleUid, operationLogger);
    }
    static setChat(roleUid) {
        let chatLogger = log4js_1.default.getLogger("chat");
        chatLogger.addContext("roleUid", roleUid);
        chatLogMap.set(roleUid, chatLogger);
    }
}
exports.LogTS = LogTS;
logger.level = log4js_1.default.levels.WARN;
let logInfo = (...data) => {
    // return;
    logger.debug(data);
    if (!app_1.isDebug) {
        return;
    }
    console.log(...data);
};
exports.logInfo = logInfo;
let logTest = (...data) => {
    console.log(...data, "\n", getTrack());
};
exports.logTest = logTest;
let logProto = (...data) => {
    logger.debug(data);
    if (!app_1.isDebug) {
        return;
    }
    console.log(...data);
};
exports.logProto = logProto;
let logRPC = (...data) => {
    serverLogger.info(data);
    if (!app_1.isDebug) {
        return;
    }
    console.log(...data);
};
exports.logRPC = logRPC;
let warningLog = (...data) => {
    logger.warn(data);
    if (!app_1.isDebug) {
        return;
    }
    console.warn(...data, "\n", getTrack());
};
exports.warningLog = warningLog;
let errLog = (...data) => {
    logger.error(data);
    if (!app_1.isDebug) {
        return;
    }
    console.error(...data, "\n", getTrack());
};
exports.errLog = errLog;
let assetLog = (roleUid, ...data) => {
    let assetlogger = assetLogMap.get(roleUid);
    if (!assetlogger) {
        LogTS.setAsset(roleUid);
        assetlogger = assetLogMap.get(roleUid);
    }
    assetlogger.info(data);
    if (!app_1.isDebug) {
        return;
    }
    console.log(...data, "\n", getTrack());
};
exports.assetLog = assetLog;
let operationLog = (roleUid, ...data) => {
    let oplogger = operationLogMap.get(roleUid);
    if (!oplogger) {
        LogTS.setOperation(roleUid);
        oplogger = operationLogMap.get(roleUid);
    }
    oplogger.info(data);
    if (!app_1.isDebug) {
        return;
    }
    console.log(...data, "\n", getTrack());
};
exports.operationLog = operationLog;
let chatLog = (roleUid, ...data) => {
    let chatlogger = chatLogMap.get(roleUid);
    if (!chatlogger) {
        LogTS.setChat(roleUid);
        chatlogger = chatLogMap.get(roleUid);
    }
    chatlogger.info(data);
    if (!app_1.isDebug) {
        return;
    }
    console.log(...data, "\n", getTrack());
};
exports.chatLog = chatLog;
const ENABLE_HYPERLINK = true;
function getTrack() {
    //捕获当前输出的堆栈信息(前三行为此处代码调用的堆栈, 去除后输出)
    let trackInfos = new Error().stack?.replace(/\r\n/g, "\n").split("\n").slice(3);
    if (trackInfos && trackInfos.length > 0) {
        if (ENABLE_HYPERLINK) {
            //1.匹配函数名(可选)    /**([a-zA-z0-9#$._ ]+ \()? */
            //2.匹配文件路径        /**([a-zA-Z0-9:/\\._ ]+(.js|.ts))\:([0-9]+)\:([0-9]+) */
            let regex = /at ([a-zA-z0-9#$._ ]+ \()?([a-zA-Z0-9:/\\._ ]+(.js|.ts))\:([0-9]+)\:([0-9]+)\)?/g;
            for (let i = 0; i < trackInfos.length; i++) {
                regex.lastIndex = 0;
                let match = regex.exec(trackInfos[i]);
                if (!match)
                    continue;
                let path = match[2], line = match[4] ?? "0", column = match[5] ?? "0";
                let search = `${path}:${line}:${column}`;
                trackInfos[i] = trackInfos[i].replace(search, `<a href="${path.replace(/\\/g, "/")}" line="${line}" column="${column}">${search}</a>`);
            }
        }
        return trackInfos.join("\n");
    }
    return "";
}
;
//# sourceMappingURL=LogTS.js.map