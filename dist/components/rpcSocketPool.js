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
     * send messages
     */
    sendMsg(id, msg) {
        let socket = this.rpcSockets[id];
        if (socket) {
            socket.send(msg);
        }
    }
    /**
     * Get socket
     */
    getSocket(id) {
        // for (let i in this.rpcSockets) {
        //     logInfo(i);
        // }
        return this.rpcSockets[id];
    }
}
exports.RpcSocketPool = RpcSocketPool;
//# sourceMappingURL=rpcSocketPool.js.map