
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
    realCross = "realCross",//跨服中心权威服
    middleground = "middleground",//中台 负责处理一下全服广播事宜，比如邮件群发 跑马灯 聊天等
    router = "router",//路由服务器 -- 暂时没用
    localLog = "localLog",//本地日志写入
}

const MAIN_KEY_ROUTE_RULES: { maxExclusive: number, serverType: ServerType }[] = [
    { maxExclusive: 300, serverType: ServerType.logic },
    { maxExclusive: 310, serverType: ServerType.router },
    { maxExclusive: 320, serverType: ServerType.line },
    { maxExclusive: 340, serverType: ServerType.fight },
    { maxExclusive: 360, serverType: ServerType.background },
    { maxExclusive: 380, serverType: ServerType.cross },
    { maxExclusive: 400, serverType: ServerType.middleground },
    { maxExclusive: 420, serverType: ServerType.social },
    { maxExclusive: 440, serverType: ServerType.realCross },
];

//能获取到字符串的 主协议，为RPC通讯  即，如果return回来的是Null 则是
//根据协议ID 获取路由到的服务器类型
export function getServerTypeByMainKey(mainKey: number): string {
    for (let i = 0; i < MAIN_KEY_ROUTE_RULES.length; i++) {
        const rule = MAIN_KEY_ROUTE_RULES[i];
        if (mainKey < rule.maxExclusive) {
            return rule.serverType;
        }
    }
    return "";
}
