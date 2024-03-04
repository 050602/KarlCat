"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDbURL = exports.isFrontend = exports.getNameByMainKey = exports.ServerName = void 0;
var ServerName;
(function (ServerName) {
    ServerName["gate"] = "gate";
    ServerName["logic"] = "logic";
    ServerName["chat"] = "chat";
    ServerName["background"] = "background";
    ServerName["master"] = "master";
    ServerName["rankList"] = "rankList";
    ServerName["fight"] = "fight";
    ServerName["scenarios"] = "scenarios";
})(ServerName = exports.ServerName || (exports.ServerName = {}));
//能获取到字符串的 主协议，为RPC通讯  即，如果return回来的是Null 则是
function getNameByMainKey(mainKey) {
    if (mainKey < 200) {
        return ServerName.gate;
    }
    else if (mainKey < 1000) {
        return ServerName.logic;
    }
}
exports.getNameByMainKey = getNameByMainKey;
function isFrontend(mainKey) {
    if (mainKey < 1000) {
        return true;
    }
    return false;
}
exports.isFrontend = isFrontend;
//每十个服务器，用一个数据库，，实际上可能只使用5个服务器一个数据库， 注意服务器的ID的管理即可
function getDbURL(sid) {
    let index = Math.floor(sid * 0.1);
    return DBURL[index];
}
exports.getDbURL = getDbURL;
//非本地的数据库，需要注意开放端口
const DBURL = ["127.0.0.1:27017"];
//# sourceMappingURL=route.js.map