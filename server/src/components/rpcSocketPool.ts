import { rpcOnNewSocket } from "./rpcService";

export class RpcSocketPool {
    private rpcSockets: { [id: string]: I_RpcSocket } = {};

    /**
     * Add socket
     */
    addSocket(id: string, socket: I_RpcSocket) {
        this.rpcSockets[id] = socket;
        rpcOnNewSocket(id);
    }


    /**
     * Remove socket
     */
    removeSocket(id: string) {
        delete this.rpcSockets[id];
    }


    /**
     * 向指定ID的RPC链接发送消息
     */
    sendMsg(id: string, msg: Buffer) {
        let socket = this.rpcSockets[id];
        if (socket) {
            socket.send(msg);
        }
    }

    /**
     * 根据RPCID获取一个RPC链接
     */
    getSocket(id: string) {
        return this.rpcSockets[id];
    }
}

export interface I_RpcSocket {
    send(data: Buffer): void;
}