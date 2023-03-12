"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TickTask = void 0;
const Sigleton_1 = require("../core/Sigleton");
const LogTS_1 = require("../LogTS");
/**
* 定时任务队列
* @author An
*/
class TickTask extends Sigleton_1.Sigleton {
    constructor() {
        super(...arguments);
        this.TaskDic = new Map();
        this.queueArr = [];
        this._pause = false;
        this.isRuning = false;
    }
    static get Instance() {
        return super.getInstance(TickTask);
    }
    /**
     * 定时队列
     * 队列里执行方法的对象,理论上不应被销毁
     */
    initInstance() {
        //设置时间为从服务器获取的时间
        // this._time = setInterval(() => {
        //     TickTask.Instance.update();
        // }, 333);
        // this.isRuning = true;
    }
    ;
    pauseSchedule() {
        this._pause = true;
    }
    resumeSchedule() {
        this._pause = false;
    }
    destoryInstance() {
        this.isRuning = false;
        this.TaskDic.clear();
        this.queueArr = [];
        // TimerTS.Instance.clear(this, this.update);
        if (this._time) {
            clearInterval(this._time);
        }
    }
    /**
     * 增加新的定时任务到队列
     * @param timestamp 需要执行的具体时间戳，单位毫秒
     * @param func 回调执行的方法
     * @param data 回调参数
     */
    pushTask(thisObj, callback, timestamp, ...data) {
        if (thisObj == null || callback == null) {
            // console.log("定时执行的方法不能为空");
            (0, LogTS_1.errLog)("定时执行的对象/方法不能为空");
            return false;
        }
        //任务已过期
        if (isNaN(timestamp) || timestamp < Date.now()) {
            (0, LogTS_1.warningLog)("时间戳非法/该任务已过期", timestamp, Date.now());
            return false;
        }
        let newarr = [];
        newarr.push(thisObj);
        newarr.push(callback);
        newarr.push(data);
        (0, LogTS_1.logServer)("pushTask", newarr);
        let arr = this.TaskDic.get(timestamp);
        if (!arr) {
            arr = [];
            this.queueArr.push(timestamp);
            this.arrDichotomy(this.queueArr);
            this.TaskDic.set(timestamp, arr);
        }
        arr.push(newarr);
        if (!this.isRuning) {
            this._time = setInterval(() => {
                TickTask.Instance.update();
            }, 1000);
            this.isRuning = true;
        }
        return true;
    }
    /**
     * 移除指定任务
     * @param timestamp
     * @param func
     */
    removeTask(thisObj, func, timestamp) {
        let arr = this.TaskDic.get(timestamp);
        if (arr) {
            for (let i = 0; i < arr.length; i++) {
                let obj = arr[i][0];
                let func2 = arr[i][1];
                // let cont2 = dic[i][2];
                if (thisObj == obj && func2 == func) {
                    arr.splice(i, 1);
                    i--;
                }
            }
            if (arr.length == 0) {
                this.TaskDic.delete(timestamp);
                let index = this.queueArr.indexOf(timestamp);
                this.queueArr.splice(index, 1);
            }
        }
    }
    update() {
        // LOG("UpdateNow");
        /**暂停 */
        if (this._pause) {
            return;
        }
        /**servertime == 0 */
        // if (this._timestamp == 0) {
        //     // console.log("未设置时间戳，时间戳非法，请重新设置服务器时间再pushTask");
        //     return;
        // }
        this.checkTask();
    }
    checkTask() {
        // LOG("checkTask", this.queueArr);
        if (this.queueArr.length > 0) {
            let curServerTime = Date.now();
            let second = this.queueArr[0];
            // if (second != 84600000000)
            // logTest("checkTask2", curServerTime, second);
            if (curServerTime >= second) {
                let arr = this.TaskDic.get(this.queueArr[0]);
                if (arr) {
                    for (let key in arr) {
                        let element = arr[key];
                        let thisObj = element[0];
                        let func = element[1];
                        let data = element[2];
                        if (func) {
                            try {
                                if (data) {
                                    func.apply(thisObj, data);
                                }
                                else {
                                    func.apply(thisObj);
                                }
                            }
                            catch (error) {
                                (0, LogTS_1.errLog)("致命错误,TickTask执行的方法里存在错误", second, "\n", error);
                            }
                        }
                    }
                    arr = null;
                }
                this.TaskDic.delete(this.queueArr[0]);
                this.queueArr.splice(0, 1);
                this.checkTask();
            }
        }
        else {
            //当发现无可执行任务时，自行销毁
            clearInterval(this._time);
            this.isRuning = false;
        }
    }
    //二分法排序
    arrDichotomy(array) {
        for (let i = 0; i < array.length; i++) {
            let temp = array[i]; //待插入到前面有序序列的值
            let left = 0; //有序序列的左侧
            let right = i - 1; //有序序列的右侧
            let middle = 0; //有序序列的中间
            while (left <= right) {
                middle = Math.floor((left + right) / 2); //赋值
                middle = (left + right) >> 1; //赋值
                if (temp < array[middle]) {
                    right = middle - 1;
                }
                else {
                    left = middle + 1;
                }
            }
            for (let j = i - 1; j >= left; j--) {
                //从i-1到left依次向后移动一位,等待temp值插入
                array[j + 1] = array[j];
            }
            if (left != i) {
                array[left] = temp;
            }
        }
        return array;
    }
}
exports.TickTask = TickTask;
//# sourceMappingURL=TickTask.js.map