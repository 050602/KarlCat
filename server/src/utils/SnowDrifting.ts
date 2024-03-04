import { app, BigServerId } from "../app";
import { Sigleton } from "../core/Sigleton";
import { DateUtils } from "./DateUtils";

/**
 * @description: 
 * @author: bubao
 */
import SnowDriftingLib from "./SnowDriftingLib.js";
export class SnowDrifting extends Sigleton {
    public static get Instance(): SnowDrifting {
        return this.getInstance();
    }

    private genTool: any;
    public initInstance(): void {
        //最多支持10台机器跨区 因为机器长度最大为64台 目前就是 6线*10区 台
        //需要注意该ID由后台赋值，必定是一个比较大的数字，需要取出末位，需要注意合服后，雪花ID重复的问题
        let bigServer = ((BigServerId - 1) % 10) * 6;
        this.genTool = new SnowDriftingLib({ WorkerId: app.serverInfo.serverId + bigServer }, DateUtils);
    }

    public destoryInstance(): void {
        this.genTool = null;
    }

    public getOnlyId(): number {
        return this.genTool.NextNumber();
    }
}
