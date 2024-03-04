
export enum ServerType {
    database = "database",
    gate = "gate",
    logic = "logic",
    chat = "chat",//
    background = "background",//管理后台过来的数据
    master = "master",
    rankList = "rankList",//排行榜不直接与客户端交互
    fight = "fight",
    logSave = "logSave",//后台日志
    social = "social",//社交服/公会服 与其他人打交道的
    line = "line",//排队 在线服
    cross = "cross",//跨服玩法
    middleground = "middleground",//中台 负责处理一下全服广播事宜，比如邮件群发 跑马灯 聊天等
    router = "router",//路由服务器 -- 暂时没用
    localLog = "localLog",//本地日志写入
}

//能获取到字符串的 主协议，为RPC通讯  即，如果return回来的是Null 则是
//根据协议ID 获取路由到的服务器类型
export function getServerTypeByMainKey(mainKey: number): string {
    if (mainKey < 300) {
        return ServerType.logic;
    } else if (mainKey < 310) {
        return ServerType.router;
    } else if (mainKey < 320) {
        return ServerType.line;
    } else if (mainKey < 340) {
        return ServerType.fight;
    } else if (mainKey < 360) {
        return ServerType.background;
    } else if (mainKey < 380) {
        return ServerType.cross;
    } else if (mainKey < 400) {
        return ServerType.middleground;
    } else if (mainKey < 420) {
        return ServerType.social;
    }
    else {
        return "";
    }
}
