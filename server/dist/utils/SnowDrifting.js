"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnowDrifting = void 0;
const app_1 = require("../app");
const Sigleton_1 = require("../core/Sigleton");
const DateUtils_1 = require("./DateUtils");
/**
 * @description:
 * @author: bubao
 */
const SnowDriftingLib_js_1 = __importDefault(require("./SnowDriftingLib.js"));
class SnowDrifting extends Sigleton_1.Sigleton {
    static get Instance() {
        return this.getInstance();
    }
    initInstance() {
        //最多支持10台机器跨区 因为机器长度最大为64台 目前就是 6线*10区 台
        //需要注意该ID由后台赋值，必定是一个比较大的数字，需要取出末位，需要注意合服后，雪花ID重复的问题
        let bigServer = ((app_1.BigServerId - 1) % 10) * 6;
        this.genTool = new SnowDriftingLib_js_1.default({ WorkerId: app_1.app.serverInfo.serverId + bigServer }, DateUtils_1.DateUtils);
    }
    destoryInstance() {
        this.genTool = null;
    }
    getOnlyId() {
        return this.genTool.NextNumber();
    }
}
exports.SnowDrifting = SnowDrifting;
//# sourceMappingURL=SnowDrifting.js.map