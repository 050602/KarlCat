"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrameEvent = void 0;
var FrameEvent;
(function (FrameEvent) {
    /**
     * 当当前服务器与其他服务器断开RPC链接时
     */
    FrameEvent["onRemoveServer"] = "onRemoveServer";
    /**
    * 当所有服务器启动完毕
    */
    FrameEvent["onStartAll"] = "onStartAll";
    /**
    * 当当前服务器与其他服务器建立RPC链接时
    */
    FrameEvent["onAddServer"] = "onAddServer";
    // StartServer = "StartServer",//启动服务器（物理意义）---正式版本再实现，需要分离Master服才能支持
    // OpenServer = "OpenServer",//开放服务器（对玩家来说）
    // CloseServer = "CloseServer",//关闭服务器（对玩家来说）
    // StopServer = "StopServer",//停止服务器（物理意义）
})(FrameEvent = exports.FrameEvent || (exports.FrameEvent = {}));
//# sourceMappingURL=FrameEvent.js.map