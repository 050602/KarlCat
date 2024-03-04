"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RpcEvent = void 0;
var RpcEvent;
(function (RpcEvent) {
    //登录 角色相关
    RpcEvent[RpcEvent["OnRoleEnterGame"] = 1] = "OnRoleEnterGame";
    RpcEvent[RpcEvent["OnRoleAcitveOutLine"] = 2] = "OnRoleAcitveOutLine";
    RpcEvent[RpcEvent["OnRoleNetDisconnection"] = 3] = "OnRoleNetDisconnection";
    RpcEvent[RpcEvent["OnCreateRole"] = 4] = "OnCreateRole";
    //当socket断开时的rpc处理
    RpcEvent[RpcEvent["OnKillSocketByUid"] = 5] = "OnKillSocketByUid";
    RpcEvent[RpcEvent["OnHotReload"] = 6] = "OnHotReload";
})(RpcEvent = exports.RpcEvent || (exports.RpcEvent = {}));
//# sourceMappingURL=RpcEvent.js.map