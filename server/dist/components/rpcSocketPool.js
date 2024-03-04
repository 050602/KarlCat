"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RpcSocketPool = void 0;
const rpcService_1 = require("./rpcService");
class RpcSocketPool {
    constructor() {
        this.rpcSockets = {};
    }
    /**
     * Add socket
     */
    addSocket(id, socket) {
        this.rpcSockets[id] = socket;
        (0, rpcService_1.rpcOnNewSocket)(id);
    }
    /**
     * Remove socket
     */
    removeSocket(id) {
        delete this.rpcSockets[id];
    }
    /**
     * 向指定ID的RPC链接发送消息
     */
    sendMsg(id, msg) {
        let socket = this.rpcSockets[id];
        if (socket) {
            socket.send(msg);
        }
    }
    /**
     * 根据RPCID获取一个RPC链接
     */
    getSocket(id) {
        return this.rpcSockets[id];
    }
}
exports.RpcSocketPool = RpcSocketPool;
//# sourceMappingURL=rpcSocketPool.js.map