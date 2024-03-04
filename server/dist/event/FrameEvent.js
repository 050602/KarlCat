"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrameEvent = void 0;
var FrameEvent;
(function (FrameEvent) {
    /**
     * 当当前服务器与其他服务器断开RPC链接时
     */
    FrameEvent[FrameEvent["onRemoveServer"] = 80001] = "onRemoveServer";
    /**
    * 当所有服务器启动完毕,如果需要监听该事件，需要提前注册Main，在正常的注册Main流程，是在起服后
    */
    FrameEvent[FrameEvent["OnStartAll"] = 80002] = "OnStartAll";
    /**
    * 当当前服务器与其他服务器建立链接时,,PS:建立了链接，不代表就马上可以RPC。。。要问为什么，问就是，还没研究好，//TODO
    */
    FrameEvent[FrameEvent["onAddServer"] = 80003] = "onAddServer";
    // StartServer = "StartServer",//启动服务器（物理意义）---正式版本再实现，需要分离Master服才能支持
    // OpenServer = "OpenServer",//开放服务器（对玩家来说）
    // CloseServer = "CloseServer",//关闭服务器（对玩家来说）
    // StopServer = "StopServer",//停止服务器（物理意义）
})(FrameEvent = exports.FrameEvent || (exports.FrameEvent = {}));
//# sourceMappingURL=FrameEvent.js.map