import { isDebug } from "../app";
import { BaseServerLogic } from "../components/BaseServerLogic";

export class SocketState extends BaseServerLogic {
    public static get Instance(): SocketState {
        return this.getInstance();
    }
    public openClientSocket = isDebug ? true : false;
}