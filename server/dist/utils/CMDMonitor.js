"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CMDMonitor = void 0;
const LogTS_1 = require("../LogTS");
const app_1 = require("../app");
const Sigleton_1 = require("../core/Sigleton");
const DateUtils_1 = require("./DateUtils");
class CMDMonitor extends Sigleton_1.Sigleton {
    constructor() {
        super(...arguments);
        //number[]定义：0:次数， 1：总时长 2：最大时长,3:最小时长
        this.cmdCount = new Map();
    }
    static get Instance() {
        return this.getInstance();
    }
    async initInstance() {
        this.setTiming();
    }
    destoryInstance() {
    }
    setAndAddCmdCount(name, time) {
        let data = this.cmdCount.get(name);
        if (!data) {
            this.cmdCount.set(name, [1, time, time, time]);
        }
        else {
            data[0]++;
            data[1] += time;
            if (data[2] < time) {
                data[2] = time;
            }
            if (data[3] > time) {
                data[3] = time;
            }
        }
    }
    setTiming() {
        // let time = DateUtils.timestamp() + 300000
        setInterval(() => {
            // errLog("cmdName    次数    总时长    最大时长    最小时长    平均时长");
            let nowData = DateUtils_1.DateUtils.formatFullTimeByNow();
            let cmdLog = `${nowData}    服务器名    cmdName    次数    总时长    最大时长    最小时长    平均时长`;
            // let cmdLog: string = "服务器名/\t/gcmdName/\t/g次数/\t/g总时长/\t/g最大时长/\t/g最小时长/\t/g平均时长";
            (0, LogTS_1.logCmdMonitor)("Monitor5m", cmdLog);
            for (let key2 of this.cmdCount.entries()) {
                let data = key2[1];
                let line = nowData + "    " + app_1.app.serverInfo.serverName + "    " + key2[0] + "    " + data[0] + "    " + data[1] + "    " + data[2] + "    " + data[3] + "    " + Math.floor(data[1] / data[0]);
                //let line: string = app.serverInfo.serverName + "/\t/g" + key2[0] + "/\t/g" + data[0] + "/\t/g" + data[1] + "/\t/g" + data[2] + "/\t/g" + data[3] + "/\t/g" + Math.floor(data[1] / data[0]);
                (0, LogTS_1.logCmdMonitor)("Monitor5m", line);
                // errLog(key2[0] + " " + data[0] + " " + data[1] + " " + data[2] + " " + data[3] + " " + Math.floor(data[1] / data[0]))
            }
            this.cmdCount.clear();
            (0, LogTS_1.logCmdMonitor)("Monitor5m", "");
            (0, LogTS_1.logCmdMonitor)("Monitor5m", "");
        }, 5 * 60 * 1000);
    }
}
exports.CMDMonitor = CMDMonitor;
//# sourceMappingURL=CMDMonitor.js.map