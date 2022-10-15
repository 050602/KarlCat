import { isDebug } from "../app";
import { BaseServerLogic } from "../components/BaseServerLogic";

export class SocketState extends BaseServerLogic {
    public static SigletonInsName = "SocketState";
    public static get Instance(): SocketState {
        return super.getInstance(SocketState);
    }
    public openClientSocket = isDebug ? true : false;
}