import log4js from "log4js";
import { DateUtils } from "./utils/DateUtils";
import { app, isDebug } from "./app";
import { ServerType } from "./register/route";

log4js.configure({
  appenders: {
    production: {
      type: "multiFile",
      base: "./logs/",
      property: "key",
      extension: ".log",
      maxLogSize: 104857600,//200M
      backups: 200,//一个备份
      keepFileExt: true, // 日志文件是否始终保持后缀        
      pattern: "yyyyMMddhh", // 用于确定何时滚动日志的模式
      alwaysIncludePattern: true,
      // compress: true,//压缩
      layout: {
        type: "messagePassThrough",
        // pattern: '%d{yyyy-MM-dd-hh-mm-ss}-%m}'
      }
    },
    background: {
      type: "multiFile",
      base: "./logs/bg/",
      property: "key",
      extension: ".log",
      maxLogSize: 104857600,//100M
      backups: 20,//一个备份
      keepFileExt: true, // 日志文件是否始终保持后缀        
      pattern: "yyyyMMddhhmm", // 用于确定何时滚动日志的模式
      alwaysIncludePattern: true,
      // compress: true,//压缩
      layout: {
        type: "messagePassThrough",
        // pattern: '%d{yyyy-MM-dd-hh-mm-ss}-%m}'
      }
    },
    secBackground: {
      type: "multiFile",
      base: "./logs/secBg/",
      property: "key",
      extension: ".log",
      maxLogSize: 104857600,//100M
      backups: 20,//一个备份
      keepFileExt: true, // 日志文件是否始终保持后缀        
      pattern: "yyyyMMdd_hhmmss", // 用于确定何时滚动日志的模式
      alwaysIncludePattern: true,
      // compress: true,//压缩
      layout: {
        type: "messagePassThrough",
        // pattern: '%d{yyyy-MM-dd-hh-mm-ss}-%m}'
      }
    },
    cmdMonitorLog: {
      type: "multiFile",
      base: "./logs/serverData/",
      property: "key",
      extension: ".log",
      maxLogSize: 104857600,//100M
      backups: 20,//一个备份
      keepFileExt: true, // 日志文件是否始终保持后缀        
      pattern: "yyyyMMdd", // 用于确定何时滚动日志的模式
      alwaysIncludePattern: true,
      // compress: true,//压缩
      layout: {
        type: "messagePassThrough",
        // pattern: '%d{yyyy-MM-dd-hh-mm-ss}-%m}'
      }
    },
    fatal: {
      type: 'dateFile', // 日志输出类型,dateFile表示输出到文件
      filename: './logs/fatalLog/fatal.log', // 输出到文件的文件路径，注意，是路径而不是文件名！
      alwaysIncludePattern: true, // 日志文件是否展示预设的模式
      extension: ".log",
      keepFileExt: true, // 日志文件是否始终保持后缀
      maxLogSize: 504857600, // 文件最大存储空间 500M
      layout: {
        type: "messagePassThrough",
        pattern: '%d{yyyy-MM-dd-hh-mm-ss}-%m}'
      }
    },
    serverData: {
      type: "multiFile",
      base: "./logs/serverData/",
      property: "key",
      extension: ".log",
      maxLogSize: 104857600,//200M
      backups: 200,//一个备份
      keepFileExt: true, // 日志文件是否始终保持后缀        
      pattern: "yyyyMMddhh", // 用于确定何时滚动日志的模式
      alwaysIncludePattern: true,
      // compress: true,//压缩
      layout: {
        type: "messagePassThrough",
        // pattern: '%d{yyyy-MM-dd-hh-mm-ss}-%m}'
      }
    },
    database: {
      type: 'dateFile', // 日志输出类型,dateFile表示输出到文件
      filename: './logs/database/logs.log', // 输出到文件的文件路径，注意，是路径而不是文件名！
      alwaysIncludePattern: true, // 日志文件是否展示预设的模式
      keepFileExt: true, // 日志文件是否始终保持后缀
      maxLogSize: 504857600, // 文件最大存储空间 500M
      layout: {
        type: "messagePassThrough",
      }
    },
    // DBLogRecovery: {
    //   type: "dateFile",
    //   filename: "./logs/DBLogRecovery/dbrecover.log",     
    //   maxLogSize: 100 * 1024 * 1024,//100M      
    //   alwaysIncludePattern: true, // 日志文件是否展示预设的模式
    //   keepFileExt: true, // 日志文件是否始终保持后缀      
    //   layout: {
    //     type: "messagePassThrough",
    //     pattern: ".yyyy-MM-dd-hh", // 用于确定何时滚动日志的模式
    //   }
    // },
    DBLogRecovery: {
      type: "multiFile",
      base: "./logs/DBLogRecovery/",
      property: "tbName",
      extension: ".log",
      maxLogSize: 100 * 1024 * 1024,//100M
      backups: 300,//仅保留最新的72个日志文件    
      keepFileExt: true, // 日志文件是否始终保持后缀        
      pattern: "yyyy-MM-dd-hh", // 用于确定何时滚动日志的模式
      alwaysIncludePattern: true,
      layout: {
        type: "messagePassThrough",
      }
    },
  },
  categories: {
    default: { appenders: ['production'], level: 'info' },
    serverData: { appenders: ['serverData'], level: 'info' },
    background: { appenders: ['background'], level: 'info' },
    secBackground: { appenders: ['secBackground'], level: 'info' },
    database: { appenders: ['database'], level: 'info' },
    fatal: { appenders: ['fatal'], level: 'info' },
    DBLogRecovery: { appenders: ['DBLogRecovery'], level: 'info' },
    cmdMonitorLog: { appenders: ['cmdMonitorLog'], level: 'info' },
  }
});

const databaseLogger = log4js.getLogger("database");
const fatalLogger = log4js.getLogger("fatal");

let dbRecoverLogMap: Map<string, log4js.Logger> = new Map();
let defaultLogMap: Map<string, log4js.Logger> = new Map();
let serverDataLogMap: Map<string, log4js.Logger> = new Map();
let cmdMonitorLogMap: Map<string, log4js.Logger> = new Map();
let backgroundMap: Map<string, log4js.Logger> = new Map();
let secBackgroundMap: Map<string, log4js.Logger> = new Map();


export let logServerReal = (data: any) => {
  let oplogger = serverDataLogMap.get("serverData");
  if (!oplogger) {
    LogTS.setServerData("serverData");
    oplogger = serverDataLogMap.get("serverData");
  }

  // oplogger.info(DateUtils.formatFullTime4(DateUtils.timestamp()), data);
  oplogger.info(data);
  // if (!isDebug) {
  return;
  // }

  console.log(DateUtils.formatFullTime6(), ...data);
}

export let logDBRecover = (tbName: string, data: any) => {
  // dbRecoverLogger.info(data);
  let oplogger = dbRecoverLogMap.get(tbName);
  if (!oplogger) {
    LogTS.setDBRecover(tbName);
    oplogger = dbRecoverLogMap.get(tbName);
  }
  // let time = DateUtils.unixtime();
  let json = JSON.stringify(data);
  let compressStr = json.replace(/\r\n/g, '').replace(/\n/g, '').replace(/\s+/g, '');
  oplogger.info(compressStr);
};


export let logCmdMonitorReal = (MonitorType: string, data: any) => {
  // dbRecoverLogger.info(data);
  let oplogger = cmdMonitorLogMap.get(MonitorType);
  if (!oplogger) {
    LogTS.setCmdMonitor(MonitorType);
    oplogger = cmdMonitorLogMap.get(MonitorType);
  }

  oplogger.info(data);
};

export let logDatabase = (...data: any[]) => {
  // databaseLogger.info(DateUtils.formatFullTime4(DateUtils.timestamp()) + "-" + data);
  // app.rpc(ServerType.logSave + "-1", null, LogRpcEvent.SaveDatabase as any, data);

}

export let doTestLog = (...data: any[]) => {
  console.log(data);
  // databaseLogger.info(DateUtils.forlmatFullTime4(DateUtils.timestamp()) + "-" + data);
}

export let logDatabaseSave = (...data: any[]) => {
  databaseLogger.info(DateUtils.formatFullTime6() + "-" + data);
}

export let logFatal = (...data: any[]) => {
  let str = DateUtils.formatFullTime6() + " error " + data;
  console.log(str);
  fatalLogger.fatal(str);
}

export class LogTS {
  public static setBgLog(key: string) {
    let bgLogger = log4js.getLogger("background");
    bgLogger.addContext("key", key);
    backgroundMap.set(key, bgLogger);
    logKeys.push(key);
  }

  public static setSecBgLog(key: string) {
    let bgSecLogger = log4js.getLogger("secBackground");
    bgSecLogger.addContext("key", key);
    secBackgroundMap.set(key, bgSecLogger);
    logKeys.push(key);
  }

  public static setDBRecover(tbName: string) {
    let loginLogger = log4js.getLogger("DBLogRecovery");
    loginLogger.addContext("tbName", tbName);
    dbRecoverLogMap.set(tbName, loginLogger);
  }

  public static setDefault(tbName: string) {
    let tmpLogger = log4js.getLogger("production");
    tmpLogger.addContext("key", tbName);
    defaultLogMap.set(tbName, tmpLogger);
  }

  public static setServerData(tbName: string) {
    let tmpLogger = log4js.getLogger("serverData");
    tmpLogger.addContext("key", tbName);
    serverDataLogMap.set(tbName, tmpLogger);
  }

  public static setCmdMonitor(MonitorType: string) {
    let loginLogger = log4js.getLogger("cmdMonitorLog");
    loginLogger.addContext("key", MonitorType);
    cmdMonitorLogMap.set(MonitorType, loginLogger);
  }
}

let logKeys: string[] = [];

export let deleteLogCache = () => {
  // let bgLogger = log4js.getLogger("background");
  for (let i = 0; i < logKeys.length; i++) {
    // bgLogger.removeContext(logKeys[i]);
    let logger = backgroundMap.get(logKeys[i]);
    if (logger) {
      logger.clearContext();
    }
    backgroundMap.delete(logKeys[i]);
  }
  logKeys = [];
}

// logger.level = log4js.levels.WARN;

export let logInfo = (...data: any[]) => {
  if (!isDebug)
    return;
  let oplogger = defaultLogMap.get("debug");
  if (!oplogger) {
    LogTS.setDefault("debug");
    oplogger = defaultLogMap.get("debug");
  }
  oplogger.debug(DateUtils.formatFullTime6(), data);
  // if (!isDebug) {
  //   return;
  // }

  console.log(DateUtils.formatFullTime6(), ...data);
}

export let logError = (...data: any[]) => {
  let oplogger = defaultLogMap.get("debug");
  if (!oplogger) {
    LogTS.setDefault("debug");
    oplogger = defaultLogMap.get("debug");
  }
  oplogger.error(DateUtils.formatFullTime6(), data);
  console.log(DateUtils.formatFullTime6(), ...data);
}

// 输出带serverId error日志
export let logSid = (...data: any[]) => {
  data = [`[server id:${app.serverInfo.serverId}]`].concat(data);
  return logError(...data);
}

export let logAbyss = (cfgId: number, ...data: any[]) => {
  data = [`[abyss, cfgId: ${cfgId}]`].concat(data);
  return logSid(...data);
}

export let logRoleError = (roleUid: number, ...data: any[]) => {
  data = [`[find error in ${app.serverName}, role uid:${roleUid}]`].concat(data);
  logError(...data);
}

export let logRolePs = (roleUid: number, addNum: number, tip: string) => {
  let data = `ps change, role uid:${roleUid}, add num:${addNum}, ${tip}`;
  logError(data);
}

export let logRoleAct = (roleUid: number, activityType: string | number, tip: string) => {
  let data = `act type:${activityType}, role uid:${roleUid}, ${tip}`;
  logError(data);
}


export let logFight2 = (roleUid: number, ...data: any[]) => {
  let prefix = `[fight info, ${roleUid}]`;
  console.log(DateUtils.formatFullTime6(), prefix, ...data);
}

export let logRedEnv = (redId: number, roleUid: number, ...data: any[]) => {
  data = [`[red env, redId:${redId}, ${roleUid}]`].concat(data);
  logError(...data);
}

export let logRedTask = (msg: { uid: number, flagPersonal: boolean }, ...data: any[]) => {
  data = [`red task uid:${msg.uid},flagPersonal:${msg.flagPersonal}`].concat(data);
  let tip = data.join(", ");
  logError(tip);
}


export let logTest = (...data: any[]) => {
  // logger.debug(data);
  console.log(...data, "\n", getTrack());
}

export let logProto = (...data: any[]) => {
  // return;
  let oplogger = defaultLogMap.get("debug");
  if (!oplogger) {
    LogTS.setDefault("debug");
    oplogger = defaultLogMap.get("debug");
  }
  oplogger.debug(DateUtils.formatFullTime6(), data);
  if (!isDebug) {
    return;
  }
  console.log(DateUtils.formatFullTime6(), JSON.stringify(data));
}

export let logRPC = (...data: any[]) => {
  return;
  let oplogger = serverDataLogMap.get("serverData");
  if (!oplogger) {
    LogTS.setServerData("serverData");
    oplogger = serverDataLogMap.get("serverData");
  }

  oplogger.debug(DateUtils.formatFullTime6(), data);
  // if (!isDebug) {
  //   return;
  // }
  console.log(data);
}

export let gzaLog = (...data: any[]) => {
  // return;
  // logger.debug(data);
  if (!isDebug) {
    return;
  }
  console.log(DateUtils.formatFullTime6(), data);
};

export let warningLog = (...data: any[]) => {
  // let oplogger = defaultLogMap.get("debug");
  // if (!oplogger) {
  //   LogTS.setDefault("debug");
  //   oplogger = defaultLogMap.get("debug");
  // }

  // oplogger.warn(DateUtils.formatFullTime4(DateUtils.timestamp()), data);

  // if (!isDebug) {
  //   return;
  // }
  console.warn(...data);
  // app.rpc && app.rpc(ServerType.localLog + "-1", LocalLogRpcEvent.LocalLogWarning, DateUtils.formatFullTime6(), ...data);
  console.warn(DateUtils.formatFullTime6(), data, "\n", getTrack());
};

export let warningLogReal = (data: any) => {
  let oplogger = defaultLogMap.get("debug");
  if (!oplogger) {
    LogTS.setDefault("debug");
    oplogger = defaultLogMap.get("debug");
  }

  oplogger.warn(data);

  // if (!isDebug) {
  //   return;
  // }
  // console.warn(DateUtils.formatFullTime4(DateUtils.timestamp()), data, "\n", getTrack());
};

export let errLog = (...data: any[]) => {
  // let oplogger = defaultLogMap.get("debug");
  // if (!oplogger) {
  //   LogTS.setDefault("debug");
  //   oplogger = defaultLogMap.get("debug");
  // }

  // oplogger.error(DateUtils.formatFullTime4(DateUtils.timestamp()), data);
  // if (!isDebug) {
  //   return;
  // }
  console.error(DateUtils.formatFullTime6(), data.join(), "\n", getTrack());
  // if (app.serverType !== ServerType.master) {
    // app.rpc && app.rpc(ServerType.localLog + "-1", LocalLogRpcEvent.LocalErrLog, DateUtils.formatFullTime6(), ...data);
  // }
};

export let errLogReal = (data: any) => {
  let oplogger = defaultLogMap.get("debug");
  if (!oplogger) {
    LogTS.setDefault("debug");
    oplogger = defaultLogMap.get("debug");
  }

  oplogger.error(data);
  // if (!isDebug) {
  //   return;
  // }
  // console.error(DateUtils.formatFullTime4(DateUtils.timestamp()), data, "\n", getTrack());
};

export let errStackLog = (...data: any[]) => {
  let errorStack: string = getTrack();

  // app.rpc && app.rpc(ServerType.localLog + "-1", LocalLogRpcEvent.LocalLogErrStackLog, DateUtils.formatFullTime6(), ...data, errorStack);
  console.error(DateUtils.formatFullTime6(), data, "\n", errorStack);

  // app.rpc && app.rpc(
  //   ServerType.logSave + "-1",
  //   LogRpcEvent.SaveBgErrorLog as any,
  //   "errStack",
  //   JSON.stringify(data).replace(/\n/g, '<br>').replace(/\r\n/g, '').replace(/\s+/g, '-'),
  //   errorStack.replace(/\n/g, '<br>').replace(/\r\n/g, '').replace(/\s+/g, '-')
  // );
};

export let errStackLogReal = (data: any) => {
  let oplogger = defaultLogMap.get("debug");
  if (!oplogger) {
    LogTS.setDefault("debug");
    oplogger = defaultLogMap.get("debug");
  }

  // let errorStack: string = getTrack();

  oplogger.error(data);
  // console.error(DateUtils.formatFullTime4(DateUtils.timestamp()), data, "\n", errorStack);
};

// export let rebootLog = () => {
//   let msg = `reboot process: ${app.serverName}`;
//   app.rpc && app.rpc(ServerType.logSave + "-1", LogRpcEvent.SaveBgErrorLog as any, "errStack", msg);
// }

// export let reloadLog = (msg: string) => {
//   let tips = `reload process: ${app.serverName}, detail: ${msg}`;
//   console.log(tips);
//   app.rpc && app.rpc(ServerType.logSave + "-1", LogRpcEvent.SaveBgErrorLog as any, "errStack", tips);
// }

// export let reloadDetailLog = (msg: string) => {
//   let tips = `reload md5 detail: ${app.serverName}, detail: ${msg}`;
//   console.log(tips);
//   app.rpc && app.rpc(ServerType.logSave + "-1", LogRpcEvent.SaveBgErrorLog as any, "errStack", tips);
// }

// export let bgErrorLog = (msg: string) => {
//   let tips = `bg error: ${app.serverName}, detail: ${msg}`;
//   console.log(tips);
//   logServer(tips);
//   app.rpc && app.rpc(ServerType.logSave + "-1", LogRpcEvent.SaveBgErrorLog as any, "errStack", tips);
// }

export let logServerEx = (...data: any[]) => {
  console.log(DateUtils.formatFullTime6(), ...data);
  // let tmp = app;
  // let rpc = app?.rpc;
  // rpc && rpc(ServerType.localLog + "-1", LocalLogRpcEvent.LocalLogServer, DateUtils.formatFullTime6(), ...data);
}


export let bgLogSave = (key: string, str: string) => {
  let oplogger = backgroundMap.get(key);
  if (!oplogger) {
    LogTS.setBgLog(key);
    oplogger = backgroundMap.get(key);
  }
  oplogger.info(str);
};

export let secBgLogSave = (key: string, str: string) => {
  let oplogger = secBackgroundMap.get(key);
  if (!oplogger) {
    LogTS.setSecBgLog(key);
    oplogger = secBackgroundMap.get(key);
  }
  oplogger.info(str);
};

export let bgLogSaveAll = (str: string) => {
  for (let key of backgroundMap.keys()) {
    let oplogger = backgroundMap.get(key);
    if (!oplogger) {
      LogTS.setBgLog(key);
      oplogger = backgroundMap.get(key);
    }
    oplogger.info(str);
  }
};

const ENABLE_HYPERLINK = true;

export let getTrack = () => {
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
        let search = `${path}: ${line}: ${column}`;

        trackInfos[i] = trackInfos[i].replace(search, `< a href = "${path.replace(/\\/g, " / ")}" line = "${line}" column = "${column}" > ${search} < /a>`);
      }
    }
    return trackInfos.join("\n");
  }
  return "";

};