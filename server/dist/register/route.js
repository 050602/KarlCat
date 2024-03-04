"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServerTypeByMainKey = exports.ServerType = void 0;
var ServerType;
(function (ServerType) {
    ServerType["database"] = "database";
    ServerType["gate"] = "gate";
    ServerType["logic"] = "logic";
    ServerType["chat"] = "chat";
    ServerType["background"] = "background";
    ServerType["master"] = "master";
    ServerType["rankList"] = "rankList";
    ServerType["fight"] = "fight";
    ServerType["logSave"] = "logSave";
    ServerType["social"] = "social";
    ServerType["line"] = "line";
    ServerType["cross"] = "cross";
    ServerType["middleground"] = "middleground";
    ServerType["router"] = "router";
    ServerType["localLog"] = "localLog";
})(ServerType = exports.ServerType || (exports.ServerType = {}));
//能获取到字符串的 主协议，为RPC通讯  即，如果return回来的是Null 则是
//根据协议ID 获取路由到的服务器类型
function getServerTypeByMainKey(mainKey) {
    if (mainKey < 300) {
        return ServerType.logic;
    }
    else if (mainKey < 310) {
        return ServerType.router;
    }
    else if (mainKey < 320) {
        return ServerType.line;
    }
    else if (mainKey < 340) {
        return ServerType.fight;
    }
    else if (mainKey < 360) {
        return ServerType.background;
    }
    else if (mainKey < 380) {
        return ServerType.cross;
    }
    else if (mainKey < 400) {
        return ServerType.middleground;
    }
    else if (mainKey < 420) {
        return ServerType.social;
    }
    else {
        return "";
    }
}
exports.getServerTypeByMainKey = getServerTypeByMainKey;
//# sourceMappingURL=route.js.map