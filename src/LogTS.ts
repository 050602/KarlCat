

import log4js from "log4js";
import { isDebug } from "./app";
const logger = log4js.getLogger();


log4js.configure({
  appenders: {
    production: {
      type: 'dateFile', // 日志输出类型,dateFile表示输出到文件
      filename: './logs/debug.log', // 输出到文件的文件路径，注意，是路径而不是文件名！
      alwaysIncludePattern: true, // 日志文件是否展示预设的模式
      keepFileExt: true, // 日志文件是否始终保持后缀
      maxLogSize: 10485760, // 文件最大存储空间 10M
    },
    fight: {
      type: "multiFile",
      base: "./logs/fight/",
      property: "roleUid",
      extension: ".log",
      maxLogSize: 10485760,//10M
      backups: 1,//一个备份
      compress: true,//压缩
    },
    operation: {
      type: "multiFile",
      base: "./logs/operation/",
      property: "roleUid",
      extension: ".log",
      maxLogSize: 10485760,//10M
      backups: 1,//一个备份
      compress: true,//压缩
    },
    asset: {
      type: "multiFile",
      base: "./logs/asset/",
      property: "roleUid",
      extension: ".log",
      maxLogSize: 10485760,//10M
      backups: 1,//一个备份
      compress: true,//压缩
    },
    chat: {
      type: "multiFile",
      base: "./logs/chat/",
      property: "roleUid",
      extension: ".log",
      maxLogSize: 10485760,//10M
      backups: 1,//一个备份
      compress: true,//压缩
    },
    serverData: {
      type: 'dateFile', // 日志输出类型,dateFile表示输出到文件
      filename: './logs/serverData/logs.log', // 输出到文件的文件路径，注意，是路径而不是文件名！
      alwaysIncludePattern: true, // 日志文件是否展示预设的模式
      keepFileExt: true, // 日志文件是否始终保持后缀
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

const serverLogger = log4js.getLogger("serverData");


let fightLog: Map<string, log4js.Logger> = new Map();//key 战斗ID
let assetLogMap: Map<number, log4js.Logger> = new Map();//key 战斗ID
let operationLogMap: Map<number, log4js.Logger> = new Map();//key 战斗ID
let chatLogMap: Map<number, log4js.Logger> = new Map();//key 战斗ID

export let logServer = (...data: any[]) => {
  serverLogger.info(data);
}


export let logFight = (fightId: string, ...data: any[]) => {
  let flogger = fightLog.get(fightId);
  if (!flogger) {
    LogTS.setFightLog(fightId);
    flogger = fightLog.get(fightId);
  }
  flogger.info(data);
}

export class LogTS {
  public static setFightLog(fightId: string) {
    let userLogger = log4js.getLogger("fight");
    userLogger.addContext("roleUid", fightId);
    fightLog.set(fightId, userLogger);
  }

  public static setAsset(roleUid: number) {
    let assetLogger = log4js.getLogger("asset");
    assetLogger.addContext("roleUid", roleUid);
    assetLogMap.set(roleUid, assetLogger);
  }

  public static setOperation(roleUid: number) {
    let operationLogger = log4js.getLogger("operation");
    operationLogger.addContext("roleUid", roleUid);
    operationLogMap.set(roleUid, operationLogger);
  }

  public static setChat(roleUid: number) {
    let chatLogger = log4js.getLogger("chat");
    chatLogger.addContext("roleUid", roleUid);
    chatLogMap.set(roleUid, chatLogger);
  }
}

logger.level = log4js.levels.WARN;

export let logInfo = (...data: any[]) => {
  // return;
  logger.debug(data);
  if (!isDebug) {
    return;
  }

  console.log(...data);
}

export let logTest = (...data: any[]) => {
  console.log(...data, "\n", getTrack());
}

export let logProto = (...data: any[]) => {
  logger.debug(data);
  if (!isDebug) {
    return;
  }
  console.log(...data);
}

export let logRPC = (...data: any[]) => {
  serverLogger.info(data);
  if (!isDebug) {
    return;
  }
  console.log(...data);
}

export let gzaLog = (...data: any[]) => {
  // return;
  if (!isDebug) {
    return;
  }
  console.log(...data, "\n", getTrack());
};

export let warningLog = (...data: any[]) => {
  logger.warn(data);
  if (!isDebug) {
    return;
  }
  console.warn(...data, "\n", getTrack());
};
export let errLog = (...data: any[]) => {
  logger.error(data);
  if (!isDebug) {
    return;
  }
  console.error(...data, "\n", getTrack());
};

export let assetLog = (roleUid: number, ...data: any[]) => {
  let assetlogger = assetLogMap.get(roleUid);
  if (!assetlogger) {
    LogTS.setAsset(roleUid);
    assetlogger = assetLogMap.get(roleUid);
  }
  assetlogger.info(data);
  if (!isDebug) {
    return;
  }
  console.log(...data, "\n", getTrack());
};

export let operationLog = (roleUid: number, ...data: any[]) => {
  let oplogger = operationLogMap.get(roleUid);
  if (!oplogger) {
    LogTS.setOperation(roleUid);
    oplogger = operationLogMap.get(roleUid);
  }
  oplogger.info(data);
  if (!isDebug) {
    return;
  }
  console.log(...data, "\n", getTrack());
};

export let chatLog = (roleUid: number, ...data: any[]) => {
  let chatlogger = chatLogMap.get(roleUid);
  if (!chatlogger) {
    LogTS.setChat(roleUid);
    chatlogger = chatLogMap.get(roleUid);
  }
  chatlogger.info(data);
  if (!isDebug) {
    return;
  }
  console.log(...data, "\n", getTrack());
};





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
};


