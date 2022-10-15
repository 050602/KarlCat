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
     * send messages
     */
    sendMsg(id: string, msg: Buffer) {
        let socket = this.rpcSockets[id];
        if (socket) {
            socket.send(msg);
        }
    }

    /**
     * Get socket
     */
    getSocket(id: string) {
        // for (let i in this.rpcSockets) {
        //     logInfo(i);
        // }

        return this.rpcSockets[id];
    }
}

export interface I_RpcSocket {
    send(data: Buffer): void;
}