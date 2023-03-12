
export enum ServerName {
    gate = "gate",
    logic = "logic",
    chat = "chat",
    background = "background",
    master = "master",
    rankList = "rankList",//排行榜不直接与客户端交互
    fight = "fight",
    scenarios = "scenarios",


}

//能获取到字符串的 主协议，为RPC通讯  即，如果return回来的是Null 则是
export function getNameByMainKey(mainKey: number): string {
    if (mainKey < 200) {
        return ServerName.gate;
    } else if (mainKey < 1000) {
        return ServerName.logic;
    }

}

export function isFrontend(mainKey: number): boolean {
    if (mainKey < 1000) {
        return true;
    }
    return false;
}

//每十个服务器，用一个数据库，，实际上可能只使用5个服务器一个数据库， 注意服务器的ID的管理即可
export function getDbURL(sid: number) {
    let index = Math.floor(sid * 0.1);
    return DBURL[index];
}

//非本地的数据库，需要注意开放端口
const DBURL: string[] = ["127.0.0.1:27017"];