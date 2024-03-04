import { Sigleton } from "../core/Sigleton";
import { DateUtils } from "./DateUtils";

/**
* 定时任务队列
* @author An
*/
export class TickTask extends Sigleton {
    private TaskDic: Map<number, any[][]> = new Map(); //Key 时间戳， Value 任务 [上下文，回调方法，参数]
    private queueArr: Array<number> = [];//执行任务的时间戳 队列



    private _pause = false;//是否暂停Tick
    private isRuning = false;//是否运行中

    public static get Instance(): TickTask {
        return this.getInstance();
    }

    private _time: NodeJS.Timer;
    /**
     * 定时队列
     * 队列里执行方法的对象,理论上不应被销毁
     */
    public initInstance() {
        super.initInstance();
    };

    public pauseSchedule() {
        this._pause = true;
    }

    public resumeSchedule() {
        this._pause = false;
    }

    public destoryInstance() {
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
     * @param callback 回调执行的方法
     * @param data 回调参数
     */
    public pushTask(thisObj: any, callback: Function, timestamp: number, ...data: any[]) {
        if (thisObj == null || callback == null) {
            // gzalog("定时执行的方法不能为空");
            console.error("定时执行的对象/方法不能为空");
            return false;
        }

        //任务已过期
        if (isNaN(timestamp) || timestamp < DateUtils.timestamp()) {
            console.error("时间戳非法/该任务已过期", timestamp, DateUtils.timestamp());

            // let date = new Date();
            // date.setTime(timestamp);
            // gzalog("传入时间戳", date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
            // date.setTime(this._timestamp);
            // gzalog("当前时间戳", date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
            return false;
        }

        if (typeof (timestamp) != "number") {
            timestamp = parseInt(timestamp);
            console.error("时间戳是一个字符串，请注意", timestamp);
        }

        let newarr = [];
        newarr.push(thisObj);
        newarr.push(callback);
        newarr.push(data);

        console.error("pushTask", newarr, timestamp, DateUtils.formatFullTime4(timestamp));

        //从字典获取该时间戳是否存在任务队列
        let arr = this.TaskDic.get(timestamp);
        if (!arr) {
            arr = [];
            //没有的话，set一个，把时间戳放到 时间戳队列里
            this.queueArr.push(timestamp);
            //执行时间戳排序
            this.arrDichotomy(this.queueArr);
            //根据时间戳存放队列任务数组
            this.TaskDic.set(timestamp, arr);
        }

        //把任务 推进任务数组
        arr.push(newarr);

        //当前没有在运行的定时器时，起一个定时器
        if (!this.isRuning) {
            this._time = setInterval(() => {
                this.update();
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
    public removeTask(thisObj: any, func: Function, timestamp: number) {
        let arr: Array<any> = this.TaskDic.get(timestamp);
        if (arr) {
            for (let i = 0; i < arr.length; i++) {
                let obj = arr[i][0];
                let func2 = arr[i][1];
                // let cont2 = dic[i][2];

                if (thisObj == obj && func2 == func) {
                    console.error("removeTask", timestamp, arr[i]);
                    arr.splice(i, 1);
                    i--;
                }
            }

            if (arr.length == 0) {
                this.TaskDic.delete(timestamp);
                let index = this.queueArr.indexOf(timestamp);
                if (index != -1) {
                    this.queueArr.splice(index, 1);
                }
            }
        }

    }


    public hasTask(thisObj: any, func: Function, timestamp: number) {
        let arr: Array<any> = this.TaskDic.get(timestamp);
        if (arr) {
            for (let i = 0; i < arr.length; i++) {
                let obj = arr[i][0];
                let func2 = arr[i][1];

                if (thisObj == obj && func2 == func) {
                    return true;
                }
            }
        }
        return false;
    }

    private update() {
        // LOG("UpdateNow");
        /**暂停 */
        if (this._pause) {
            return;
        }

        /**servertime == 0 */
        // if (this._timestamp == 0) {
        //     // gzalog("未设置时间戳，时间戳非法，请重新设置服务器时间再pushTask");
        //     return;
        // }

        if (this.queueArr.length > 0) {
            let curServerTime = DateUtils.timestamp();
            this.checkTask(this.queueArr[0], curServerTime);
        }
    }

    private checkTask(taskTime: number, curServerTime: number) {
        // LOG("checkTask", this.queueArr);
        //从时间戳队列里取出最前面的时间戳
        if (this.queueArr.length > 0) {
            // let second = this.queueArr[0];
            // if (second != 84600000000)
            // logTest("checkTask2", curServerTime, second);
            // 如果当前时间大于任务队列时间戳，则开始执行 对应时间戳的 任务队列数组
            if (curServerTime > taskTime) {
                let arr = this.TaskDic.get(taskTime);
                if (arr) {
                    console.error("doTask", curServerTime, taskTime, this.queueArr[0]);
                    this.queueArr.splice(0, 1);
                    for (let key in arr) {
                        let element = arr[key];
                        console.error("doTask Func", element);
                        let thisObj: Function = element[0];
                        let func: Function = element[1];
                        let data = element[2];
                        if (func) {
                            try {
                                // logServer("check", thisObj, func);
                                if (data) {
                                    func.apply(thisObj, data);
                                } else {
                                    func.apply(thisObj);
                                }
                            } catch (error) {
                                console.error("致命错误,TickTask执行的方法里存在错误", taskTime, "\n", error);
                            }
                        }
                    }
                    arr = null;
                }
                this.TaskDic.delete(taskTime);
                console.error("checkTaskRemoveTask", curServerTime, taskTime);
                if (this.queueArr.length > 0) {
                    this.checkTask(this.queueArr[0], curServerTime);
                }
            }
        } else {
            //当发现无可执行任务时，自行销毁
            clearInterval(this._time);
            this.isRuning = false;
        }
    }


    //二分法排序
    public arrDichotomy(array: any[]) {
        for (let i = 0; i < array.length; i++) {
            let temp = array[i];//待插入到前面有序序列的值
            let left = 0;//有序序列的左侧
            let right = i - 1;//有序序列的右侧
            let middle = 0;//有序序列的中间
            while (left <= right) {
                middle = Math.floor((left + right) / 2);//赋值
                middle = (left + right) >> 1;//赋值
                if (temp < array[middle]) {
                    right = middle - 1;
                } else {
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