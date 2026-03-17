import { format } from "util";
import { MathUtils } from "./MathUtils";

export interface FormatTimeDate {
    year: number;
    hours: number;
    minutes: number;
    seconds: number;
    millSeconds: number;
}


/**
* 时间工具
* @author An
*/
export class DateUtils {
    public static initPeriod: number = 0;

    public static secMinute = 60; //一分的秒数, 60
    public static secHour = 60 * this.secMinute; //一个小时的秒数, 3600
    public static sec4Hour = 4 * this.secHour; //4小时的秒数, 14400
    public static sec4Hour_30Minute = 4 * this.secHour + 30 * this.secMinute; //4小时30分钟，单位秒, 16200
    public static sec5Hour = 5 * this.secHour; //5小时，单位秒, 18000
    public static sec5Hour_10Minute = 5 * this.secHour + 10 * this.secMinute; //5小时10分钟，单位秒, 18600
    public static sec6Hour = 6 * this.secHour; //6小时，单位秒, 21600
    public static sec8Hour = 8 * this.secHour; //8小时的秒数, 28800
    public static sec12Hour = 12 * this.secHour; //12小时，单位秒, 43200
    public static sec12Hour_10Sec = 12 * this.secHour + 10; //12小时10秒，单位秒, 43210
    public static secDay = 24 * this.secHour; //一天的秒数, 86400
    public static secDay_10Sec = this.secDay + 10; //一天的秒数+10秒, 86410
    public static secWeek = 7 * this.secDay; //一周的秒数, 604800
    public static secWeek_10Sec = this.secWeek + 10; //一周的秒数+10秒, 604810
    public static sec30Day = this.secDay * 30;  //30天的秒数, 259200；即一月的秒数

    public static msMinute = this.secMinute * 1000; //一分的毫秒数, 60000
    public static msHour = this.secHour * 1000; //一个小时的毫秒数, 3600000
    public static ms4Hour = this.sec4Hour * 1000; //4小时的毫秒数, 14400000
    public static ms4Hour_30Minute = this.sec4Hour_30Minute * 1000; //4小时30分钟的毫秒数, 16200000
    public static ms5Hour = this.sec5Hour * 1000; //5小时的毫秒数, 18000000
    public static ms5Hour_10Minute = this.sec5Hour_10Minute * 1000; //5小时10分钟的毫秒数, 18600000
    public static ms6Hour = this.sec6Hour * 1000; //6小时的毫秒数, 21600000
    public static ms8Hour = this.sec8Hour * 1000; //8小时的毫秒数, 28800000
    public static ms12Hour = this.sec12Hour * 1000; //12小时的毫秒数, 43200000
    public static ms12Hour_10sec = this.sec12Hour_10Sec * 1000; //12小时10秒的毫秒数, 43210000
    public static msDay = this.secDay * 1000; //一天的毫秒数, 86400000
    public static msDay_10Sec = this.secDay_10Sec * 1000; //一天的毫秒数+10秒, 86410000
    public static msWeek = this.secWeek * 1000; //一周的毫秒数, 604800000
    public static msWeek_10Sec = this.secWeek_10Sec * 1000; //一周的毫秒数+10秒, 604810000
    public static ms30Day = this.sec30Day * 1000;  //30天的毫秒数, 259200000；即一月的毫秒数

    public static secOffset: number = 0;
    public static msOffset: number = this.secOffset * 1000;
    public static secNewTimeBegin: number = 0; //超过该时间才可以进入游戏
    /**
     * 获取（指定）时间戳（毫秒）
     * @static
     * @param {*} data
     * @return {*}  {number}
     * @memberof DateUtils
     */
    public static getTimeEx(data: any): number {
        let date: Date = new Date();
        if (data) {
            for (let key in data) {
                let val = data[key];
                switch (key) {
                    case 'y':
                        date.setFullYear(val)
                        break;
                    case 'h':
                        date.setHours(val);
                        break;
                    case 'm':
                        date.setMinutes(val);
                        break;
                    case 's':
                        date.setSeconds(val);
                        break;
                    case 'ms':
                        date.setMilliseconds(val);
                        break;
                }
            }
        }
        let msNewTime = date.getTime() + DateUtils.msOffset;
        return msNewTime;
    }

    // 通用标准时间戳，单位秒
    public static get sysTick(): number {
        return Math.round(DateUtils.msSysTick * 0.001);
    }

    // 通用标准时间戳，单位毫秒
    public static get msSysTick(): number {
        let msTime = Date.now() + DateUtils.msOffset;
        return msTime
    }


    /**
    * 格式化时间: 时:分:秒
    * @param msec 毫秒
    */
    public static numberToTime1(ms: number) {
        let sec = ms * 0.001;
        let str = this.numberToTime2(sec);
        return str;
    }

    /**
     * @author An
     * @param value 秒格式化
     */
    public static formatSeconds(value: number): string {
        let secondTime = value; //parseInt(value);// 秒
        let minuteTime = 0;// 分
        let hourTime = 0;// 小时
        if (secondTime >= 60) {
            //如果秒数大于60，将秒数转换成整数
            //获取分钟，除以60取整数，得到整数分钟
            minuteTime = secondTime / 60;
            //获取秒数，秒数取佘，得到整数秒数
            secondTime = secondTime % 60;
            //如果分钟大于60，将分钟转换成小时
            if (minuteTime >= 60) {
                //获取小时，获取分钟除以60，得到整数小时
                hourTime = minuteTime / 60;
                //获取小时后取佘的分，获取分钟除以60取佘的分
                minuteTime = minuteTime % 60;
            }
        }

        let hs = Math.floor(hourTime).toString();
        let ms = Math.floor(minuteTime).toString();
        let ss = Math.floor(secondTime).toString();
        if (hourTime < 10)
            hs = "0" + hs;
        if (minuteTime < 10)
            ms = "0" + ms;
        if (secondTime < 10)
            ss = "0" + ss;
        let result = hs + ":" + ms + ":" + ss;

        return result;
    }

    /**
     * 格式化时间: 时:分:秒
     * @param sec 秒
     */
    public static numberToTime2(sec: number) {
        let time_str = "";
        let hour = Math.floor(sec / 3600);
        time_str = hour < 10 ? 0 + hour.toString() + ":" : hour.toString() + ":";

        let minute = Math.floor((sec % 3600) / 60);
        time_str = minute < 10 ? time_str + 0 + minute.toString() + ":" : time_str + minute.toString() + ":";
        let second = Math.ceil(sec % 60);
        time_str = second < 10 ? time_str + 0 + second.toString() : time_str + second.toString();

        return time_str;
    }

    /**
      * 根据开始时间和结束时间,判断当前时间是否在指定时间之内
      * @author An
      * @param TimeStamp 当前时间戳,请使用 DateUtils.timestamp()获取的时间戳来计算
      * @param RangeArr 两个时间数组 如：[[23,45],[0,0]]  二维数组，数组左侧是小时，右侧是分钟
      */
    public static isInTheRange(msTimeStamp: number, RangeArr: Array<Array<any>>) {
        let NowDate = DateUtils.getLogicDate();
        NowDate.setTime(msTimeStamp);
        let minHour = RangeArr[0][0];
        let minSec = RangeArr[0][1];
        let maxHour = RangeArr[1][0];
        let maxSec = RangeArr[1][1];

        let d1 = DateUtils.getLogicDate();
        d1.setTime(msTimeStamp);
        d1.setHours(minHour);
        d1.setMinutes(minSec);

        let d2 = DateUtils.getLogicDate();
        d2.setTime(msTimeStamp);
        d2.setMinutes(maxSec);
        if (minHour > maxHour) {
            //跨天
            d2.setHours(maxHour + 24);
        } else {
            d2.setHours(maxHour);
        }

        if (d1.valueOf() < msTimeStamp && d2.valueOf() > msTimeStamp) {
            return true;
        }
    }

    // [[9,14],[9,18]]， 即从9月14日零点到9月17日晚上23:59:59分
    // <=0则不在范围内，>0则表示当天在第几天，如：1表示第一天，2表示第二天
    // 第二、三个参数为活动开始、结束的时间戳，单位秒
    public static isInDayRange(dayRange: number[][]): { day: number, beginTick: number, endTick: number } {
        let msNow = DateUtils.msSysTick;
        const dataNow = new Date(msNow);
        const year = dataNow.getFullYear(); // 获取当前年份  
        let date1 = new Date(year, dayRange[0][0] - 1, dayRange[0][1]); // 月份是从0开始的，所以8代表9月  
        let date2 = new Date(year, dayRange[1][0] - 1, dayRange[1][1], 0, 0, 0);
        let result = { day: 0, beginTick: 0, endTick: 0 };
        if (dataNow.getTime() >= date1.getTime() && dataNow.getTime() < date2.getTime()) {
            let nDiff = this.diffDaysByUnixTime(dataNow.getTime() / 1000, date1.getTime() / 1000);
            result.day = nDiff + 1;
            result.beginTick = date1.getTime() / 1000;
            result.endTick = date2.getTime() / 1000;
            return result;
        }
        return result;
    }

    public static isInDayRanges(dayRanges: number[][][]): { day: number, beginTick: number, endTick: number } {
        for (let single of dayRanges) {
            let result = DateUtils.isInDayRange(single);
            if (result.day > 0)
                return result;
        }

        let defaultResult = { day: 0, beginTick: 0, endTick: 0 };
        return defaultResult;
    }

    // 根据开始时间和结束时间,判断当前时间是否在指定时间之内
    // [[2,23],[2,24]]-[周2的23点开始]，[周2的24点结束]。
    public static isInWeekdayRange(weekdayRanges: number[][]): { beginTick: number, endTick: number } {
        let beginTick = this.convertToUnixTick(weekdayRanges[0]);
        let endTick = this.convertToUnixTick(weekdayRanges[1]);
        let nowTick = DateUtils.sysTick;
        let result = { beginTick: 0, endTick: 0 };
        if (nowTick >= beginTick && nowTick < endTick) {
            result.beginTick = beginTick;
            result.endTick = endTick;
        }
        return result;
    }

    public static isInWeekdayRange_flag(weekdayRanges: number[][]): boolean {
        let result = this.isInWeekdayRange(weekdayRanges);
        return result.beginTick > 0;
    }

    public static isInWeekdayRanges_flag(weekdayRanges: number[][][]): boolean {
        for (let single of weekdayRanges) {
            let flag = this.isInWeekdayRange_flag(single);
            if (flag)
                return true;
        }
        return false;
    }

    /**
     * 按需格式化日期
     * @param NowTimeStamp 
     * @returns 
     */
    public static getDateHourNowTimeStamp(msNowTimeStamp: number): string {
        let tmpDate = new Date(msNowTimeStamp);
        let month: number = tmpDate.getMonth() + 1;
        let day: number = tmpDate.getDate();
        let hour: number = tmpDate.getHours();

        let stringDate: string = format('%d-', tmpDate.getFullYear());
        stringDate = month < 10 ? stringDate + 0 + month.toString() + "-" : stringDate + month.toString() + "-";
        stringDate = day < 10 ? stringDate + 0 + day.toString() + "-" : stringDate + day.toString() + "-";
        stringDate = hour < 10 ? stringDate + 0 + hour.toString() : stringDate + hour.toString();
        return stringDate;
    }

    /**
     * 请使用 DateUtils.timestamp()获取的时间戳来计算
     * 获取到指定日期00：00的毫秒数
    **/
    public static getRenainMilliSecond(msNowTimeStamp: number): number {
        let tmpDate = new Date(msNowTimeStamp);
        let ptime = (DateUtils.getTodayZeroMilliSecond(tmpDate) + 60 * 60 * 24) - tmpDate.getTime();
        return ptime;
    }

    /**
     * 请使用 DateUtils.timestamp()获取的时间戳来计算
     * 今天已过去的秒数
     **/
    public static getTodayPassedSecond(msNowTimeStamp: number): number {
        let tmpDate = new Date(msNowTimeStamp)
        let tdyPassTime = Math.round((tmpDate.getTime() - (new Date(tmpDate.getFullYear(), tmpDate.getMonth(), tmpDate.getDate()).getTime())) * 0.001);
        return tdyPassTime;
    }

    /**
     * 根据时间戳获取日期
     * @param NowTimeStamp
     * @returns 
     */
    public static stampTimeData(msNowTimeStamp: number): Date {
        let tmpDate = new Date(msNowTimeStamp);
        return tmpDate;
    }

    /**
     * 根据时间戳获取日期
     * @param NowTimeStamp
     * @returns 
     */
    public static stampTimeDataSec(secNowTimeStamp: number): Date {
        let tmpDate = DateUtils.stampTimeData(secNowTimeStamp * 1000);
        return tmpDate;
    }

    /**
     * 获取指定日期00:00时刻的秒数
     * @parma 秒
     * @returns {number}
     */
    public static getTodayZeroSecond(tdate?: any): number {
        let tmpDate = DateUtils.getLogicDate(tdate);
        return parseInt(((new Date(tmpDate.getFullYear(), tmpDate.getMonth(), tmpDate.getDate()).getTime()) / 1000).toFixed(0));
    }

    /**
     * 获取今日00:00时刻的毫秒时间戳
     * @parma 毫秒
     * @returns {number}
     */
    public static getTodayZeroMilliSecond(tdate?: Date): number {
        let tmpDate = DateUtils.getLogicDate(tdate);
        let now = new Date(tmpDate.getFullYear(), tmpDate.getMonth(), tmpDate.getDate()).getTime();
        return now;
    }

    /**
     * 获取明日00:00时刻的时间戳
     * @parma 毫秒
     * @returns {number}
     */
    public static getTomorrowZeroMilliSecond(tdate?: Date): number {
        let tmpDate = DateUtils.getLogicDate(tdate);
        let msNow = new Date(tmpDate.getFullYear(), tmpDate.getMonth(), tmpDate.getDate()).getTime();
        msNow += 24 * 60 * 60 * 1000;
        return msNow;
    }

    /**
     * 该方法需要修
     * 获取本周第一天
     * **/
    // public static showWeekFirstDay(NowTimeStamp: number): any {
    //     let Nowdate: any = new Date(NowTimeStamp + DateUtils.cost2020ms);
    //     let day = Nowdate.getDay();
    //     day = day ? day : 7
    //     let WeekFirstDay = new Date(Nowdate - (day - 1) * 86400000);
    //     // var M=Number(WeekFirstDay.getMonth())+1
    //     // return WeekFirstDay.getYear()+"-"+M+"-"+WeekFirstDay.getDate();
    //     return WeekFirstDay;
    // }

    /**
     * 该方法需要修
     * 获取本周最后一天
     * @param 毫秒差
     */
    // public static showWeekLastDay(NowTimeStamp: number) {
    //     // let Nowdate = DateUtils.getLogicDate();
    //     let WeekFirstDay = DateUtils.showWeekFirstDay(NowTimeStamp);
    //     let WeekLastDay = new Date((WeekFirstDay + 6 * 86400000));
    //     // let WeekLastDay = new Date((WeekFirstDay / 1000 + 6 * 86400) * 1000);
    //     // var M=Number(WeekLastDay.getMonth())+1
    //     // return WeekLastDay.getYear()+"-"+M+"-"+WeekLastDay.getDate();
    //     return WeekLastDay;
    // }

    //请使用 DateUtils.timestamp()获取的时间戳来计算
    //获取当月天数
    public static GetMonthDayNum(msNowTimeStamp: number) {
        let date = new Date(msNowTimeStamp);
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let d = new Date(year, month, 0);
        return d.getDate();
    }

    /**
     * 获取下个月一日0点的时间戳
     * @param NowTimeStamp 请使用 DateUtils.timestamp()获取的时间戳来计算
     * @returns 
     */
    public static getNextMoonFirstDayZeroTimeStamp(msNowTimeStamp: number = null) {

        let nowDate: Date;
        if (msNowTimeStamp) {
            nowDate = new Date(msNowTimeStamp);
        } else {
            nowDate = DateUtils.getLogicDate();
        }

        let moon = nowDate.getMonth() + 1;
        let year = nowDate.getFullYear();
        // 新的一年
        if (moon + 1 > 12) {
            year += 1;
            moon = 1;
        }

        let newDate = new Date(year, moon, 1, 0, 0, 1);
        return newDate.getTime();
    }

    /**
     * 获取下个月一日0点的时间戳
     * @param NowTimeStamp 请使用 DateUtils.timestamp()获取的时间戳来计算
     * @returns 
     */
    public static getNextMoonFirstDayZeroTimeStampSec(msNowTimeStamp: number = null) {
        let ms = this.getNextMoonFirstDayZeroTimeStamp(msNowTimeStamp);
        let sec = Math.round(ms * 0.001);
        return sec;
    }

    /**
   * 获取下周一一日0点的时间戳, game tick
   * @param NowTimeStamp 请使用 DateUtils.timestamp()获取的时间戳来计算
   * @returns 
   */
    public static getNextWeekFirstDayZeroTimeStamp(msNowTimeStamp: number = null) {
        let nowDate: Date;
        if (msNowTimeStamp) {
            nowDate = new Date(msNowTimeStamp);
        } else {
            nowDate = DateUtils.getLogicDate();
        }

        let curDay = nowDate.getDay();
        curDay = curDay > 0 ? curDay : 7;
        let difday = 7 - curDay;//用
        let hours = nowDate.getHours();
        let minutes = nowDate.getMinutes();
        let seconds = nowDate.getSeconds();
        let sum = difday * 86400 * 1000 + 86400 * 1000 - (hours * 3600 * 1000 + minutes * 60 * 1000 + seconds * 1000);

        let nextData: Date = new Date(nowDate.getTime() + sum);
        return nextData.getTime();
    }

    /**
* 获取本周一一日0点的时间戳, game tick
* @param NowTimeStamp 请使用 DateUtils.timestamp()获取的时间戳来计算
* @returns 
*/
    public static getWeekFirstDayZeroTimeStamp(msNowTimeStamp: number = null) {
        let msTime = this.getNextWeekFirstDayZeroTimeStamp(msNowTimeStamp);
        return msTime - DateUtils.msWeek;
    }
    // 返回game tick
    public static getWeekFirstDayZeroTime(msNowTimeStamp: number = null) {
        let msTime = this.getWeekFirstDayZeroTimeStamp(msNowTimeStamp);
        return MathUtils.toInteger(msTime / 1000);
    }
    /**
     * 求出当前时间离下周一凌晨0点还差多少毫秒
     * @param 毫秒差
     * **/
    public static calcWeekFirstDay() {
        // var lastDay = showWeekLastDay().getDay();
        // lastDay = lastDay > 0?lastDay:7;
        let Nowdate = DateUtils.getLogicDate();
        let curDay = Nowdate.getDay();
        curDay = curDay > 0 ? curDay : 7;
        let difday = 7 - curDay;//用
        let hours = Nowdate.getHours();
        let minutes = Nowdate.getMinutes();
        let seconds = Nowdate.getSeconds();
        // logInfo("difday = "+difday);
        // logInfo("hours = "+hours);
        // logInfo("minutes = "+minutes);
        // logInfo("seconds = "+seconds);
        let msSum = difday * 86400 * 1000 + 86400 * 1000 - (hours * 3600 * 1000 + minutes * 60 * 1000 + seconds * 1000);
        return msSum;
    }

    /**
     * 格式化当前时间
     * @param  time 请使用 DateUtils.timestamp()获取的时间戳来计算
     * @returns String 2018年12月12日（周二） 12:12
     */
    public static formatFullTime(msTime: number): string {
        let format: string;
        let date: Date = new Date(msTime);
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();
        let weekDay = date.getDay();
        let hour = date.getHours();
        let hourStr;
        if (hour < 10) {
            hourStr = "0" + hour;
        }
        else {
            hourStr = hour.toString();
        }
        let min = date.getMinutes();
        let minStr;
        if (min < 10) {
            minStr = "0" + min;
        }
        else {
            minStr = min.toString();
        }
        let weekDayStr;
        switch (weekDay) {
            case 1:
                weekDayStr = "一";
                break;
            case 2:
                weekDayStr = "二";
                break;
            case 3:
                weekDayStr = "三";
                break;
            case 4:
                weekDayStr = "四";
                break;
            case 5:
                weekDayStr = "五";
                break;
            case 6:
                weekDayStr = "六";
                break;
            case 0:
                weekDayStr = "日";
                break;
        }
        format = year + "年" + month + "月" + day + "日（周" + weekDayStr + "） " + hourStr + ":" + minStr;
        return format;
    }

    /**
  * 格式化当前时间
  * @returns String 2023-03-20-12-27
  */
    public static formatFullTimeByNow(split: string = null): string {
        let format: string;
        let date: Date = DateUtils.getLogicDate();
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();
        // let weekDay = date.getDay();

        let monthStr: string;
        if (month < 10) {
            monthStr = "0" + month;
        } else {
            monthStr = month.toString();
        }

        let dayStr: string;
        if (day < 10) {
            dayStr = "0" + day;
        } else {
            dayStr = day.toString();
        }

        let hour = date.getHours();
        let hourStr: string;
        if (hour < 10) {
            hourStr = "0" + hour;
        } else {
            hourStr = hour.toString();
        }
        let min = date.getMinutes();
        let minStr: string;
        if (min < 10) {
            minStr = "0" + min;
        }
        else {
            minStr = min.toString();
        }
        // let weekDayStr;
        // switch (weekDay) {
        //     case 1:
        //         weekDayStr = "一";
        //         break;
        //     case 2:
        //         weekDayStr = "二";
        //         break;
        //     case 3:
        //         weekDayStr = "三";
        //         break;
        //     case 4:
        //         weekDayStr = "四";
        //         break;
        //     case 5:
        //         weekDayStr = "五";
        //         break;
        //     case 6:
        //         weekDayStr = "六";
        //         break;
        //     case 0:
        //         weekDayStr = "日";
        //         break;
        // }
        if (split != null) {
            format = year + split + monthStr + split + dayStr + split + hourStr + split + minStr;
        } else {
            format = year + monthStr + dayStr + hourStr + minStr;
        }

        return format;
    }

    /**
 * 格式化当前时间
 * @param  time 请使用 DateUtils.timestamp()获取的时间戳来计算
 * @returns String 12月12日 12:12
 */
    public static formatFullTime2(msTime: number): string {
        let format: string;
        let date: Date = new Date(msTime);
        let month = date.getMonth() + 1;
        let day = date.getDate();
        // let weekDay = date.getDay();
        let hour = date.getHours();
        let hourStr: string;
        if (hour < 10) {
            hourStr = "0" + hour;
        }
        else {
            hourStr = hour.toString();
        }
        let min = date.getMinutes();
        let minStr: string;
        if (min < 10) {
            minStr = "0" + min;
        }
        else {
            minStr = min.toString();
        }
        format = month + "月" + day + "日 " + hourStr + ":" + minStr;
        // format = month + "月" + day + "日 " + hourStr + ":" + minStr + ":" + date.getSeconds() + ":" + date.getMilliseconds();
        return format;
    }

    /**格式化时间  格式： y年 初始值为1
     * @param time 时间
     * @returns xxx年
    */
    //  public static FormatTime(time: number) {
    //     let d = new Date(time);
    //     return Lang.getLang(37, 1 + (d.getFullYear() - 1970));//从1970年开始，所以需要减掉1970
    // }

    /**格式化时间  格式： h小时m分钟s秒
     * @param time 时间
     * @returns 数组 [h,m,s]
    */
    public static formatTime2(msTime: number): number[] {
        let d = Math.floor(msTime * 0.001);//取s为单位
        let hour = Math.floor(d / 3600);//获取小时数
        let day = Math.floor(hour / 24);//获取天数
        let min = Math.floor(d % 3600 / 60);//获取分钟数
        let sec = d % 3600 % 60;//获取秒数
        // return [day, hour, min, sec];
        return [hour, min, sec];
    }

    /**格式化天数
    * @param time 时间 毫秒
    * @returns 天数
    */
    public static formatTime3(msTime: number): number {
        let d = Math.floor(msTime * 0.001);//取s为单位
        let hour = Math.floor(d / 3600);//获取小时数
        let day = Math.floor(hour / 24);//获取天数
        return day;
    }

    /**当前几点 值域[0,23]
    * @param time 时间 毫秒
    * @returns 天数
    */
    public static formatTime4(msTime: number): number {
        let d = Math.floor(msTime * 0.001);//取s为单位
        let hour = Math.floor(d / 3600);//获取小时数
        let day = Math.floor(hour / 24);//获取天数
        let clock = Math.floor((msTime - day * 86400000) / 3600000)
        return clock;
    }

    /**获得本周周几，0为周日
    * @param day :时间戳天数
    * @returns 周几
    */
    public static getWeekFromPeriod(day: number): number {
        let data = (day + DateUtils.initPeriod) % 7
        if (data == 0) {
            data = 7
        }
        return data
    }

    public static formatFullTime4(msTime: number): string {
        let format: string;
        let date: Date = new Date(msTime);
        let hour = date.getHours();
        let hourStr: string;
        if (hour < 10) {
            hourStr = "0" + hour;
        }
        else {
            hourStr = hour.toString();
        }
        let min = date.getMinutes();
        let minStr;
        if (min < 10) {
            minStr = "0" + min;
        }
        else {
            minStr = min.toString();
        }

        let Seconds = date.getSeconds();
        let SecondsStr: string;
        if (Seconds < 10) {
            SecondsStr = "0" + Seconds;
        }
        else {
            SecondsStr = Seconds.toString();
        }


        let ms = date.getMilliseconds();
        let msStr;
        if (ms < 10) {
            msStr = "0" + ms;
        }
        else {
            msStr = ms.toString();
        }
        format = hourStr + ":" + minStr + ":" + SecondsStr + ":" + msStr;
        // format = month + "月" + day + "日 " + hourStr + ":" + minStr + ":" + date.getSeconds() + ":" + date.getMilliseconds();
        return format;
    }

    //此处直接使用传入的Time
    public static formatFullTime5(msTime: number): string {
        let format: string;
        let date: Date = new Date(msTime);
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();

        let monthStr: string;
        if (month < 10) {
            monthStr = "0" + month;
        } else {
            monthStr = month.toString();
        }

        let dayStr: string;
        if (day < 10) {
            dayStr = "0" + day;
        } else {
            dayStr = day.toString();
        }
        let hour = date.getHours();
        let hourStr: string;
        if (hour < 10) {
            hourStr = "0" + hour;
        }
        else {
            hourStr = hour.toString();
        }
        let min = date.getMinutes();
        let minStr;
        if (min < 10) {
            minStr = "0" + min;
        }
        else {
            minStr = min.toString();
        }

        let Seconds = date.getSeconds();
        let SecondsStr: string;
        if (Seconds < 10) {
            SecondsStr = "0" + Seconds;
        }
        else {
            SecondsStr = Seconds.toString();
        }

        let ms = date.getMilliseconds();
        let msStr;
        if (ms < 10) {
            msStr = "0" + ms;
        }
        else {
            msStr = ms.toString();
        }
        // format = hourStr + ":" + minStr + ":" + SecondsStr + ":" + msStr;
        format = year + "年" + monthStr + "月" + dayStr + "日 " + hourStr + ":" + minStr + ":" + SecondsStr + ":" + msStr;
        return format;
    }

    public static paddingStr(value: number): string {
        let res = value < 10 ? "0" + value : value.toString();
        return res;
    }

    //返回格式 2023-12-26 14:04:00.000
    public static formatFullTime6(msTime: number = 0): string {
        let format: string;
        if (!msTime)
            msTime = this.msSysTick;

        let date: Date = new Date(msTime);
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();

        let monthStr: string = this.paddingStr(month);
        let dayStr: string = this.paddingStr(day);
        let hourStr: string = this.paddingStr(date.getHours());
        let minStr = this.paddingStr(date.getMinutes());
        let SecondsStr: string = this.paddingStr(date.getSeconds());
        let msStr = date.getMilliseconds();
        format = year + "-" + monthStr + "-" + dayStr + " " + hourStr + ":" + minStr + ":" + SecondsStr + "." + msStr;
        return format;
    }

    //钟数,nextTime:下个小时的某个时间点（输入毫秒数），默认为整点
    public static getNextClock(msNextTime: number = 0): number {
        let nowTime = DateUtils.msSysTick;
        // let d = Math.floor(nowTime * 0.001);//取s为单位
        let Nexthour = Math.ceil(nowTime / 3600000);//获取小时数
        let time = Nexthour * 3600000 + msNextTime
        return time
    }

    /**
    * 判断本日是否有开启该活动
    * @param list 开启日
    * 经验证会导致宝箱奖励有问题，暂时注释掉了，以后找机会起复
    */
    public static judgeTodayCanJoin(list: number[]): boolean {
        let nowTime = DateUtils.msSysTick;//现在时间
        let today = DateUtils.formatTime3(nowTime);//今天是多少号
        let week = DateUtils.getWeekFromPeriod(today);
        if (list.indexOf(week) < 0) {
            return false
        }
        return true
    }

    // 单位秒
    public static diffDaysByUnixTime(sec1: number, sec2: number, initPoint: number = 0 * 60 * 60): number {
        return DateUtils.diffDays(sec1, sec2, initPoint);
    }

    // 根据两个游戏内时间戳 unixtime, 获取相差天数 d1-d2
    public static diffDays(d1: number, d2: number, initPoint: number = 0 * 60 * 60): number {
        let getDay = function (unixtime: number) {
            const date = DateUtils.getLogicDate();
            const offset = date.getTimezoneOffset();
            let timeZone = offset * DateUtils.secMinute;
            return Math.floor((unixtime - timeZone - initPoint) / DateUtils.secDay);
        }
        let cnt = getDay(d1) - getDay(d2);
        return cnt;
    }

    /**根据两个游戏内时间戳 unixtime, 判定是否需要刷新, 刷新条件： 
        1 不在同一天
        2 兼容：gameTick < recordTick，即曾经调到未来时间
    */
    public static todayNeedRefresh(gameTick: number, recordTick: number, initPoint: number = 0 * 60 * 60): boolean {
        let diff = this.diffDays(gameTick, recordTick, initPoint);
        if (diff != 0)
            return true;

        let flag = gameTick < recordTick;
        return flag;
    }

    isDiffWeek(t1: number, t2: number, initPoint: number = 0 * 60 * 60): boolean {
        // 判断是否在同一周内(记星期一为一周中第一天)
        // 因为1970年1月1 是周4  所以（天数+3）/7 取整 就是周数
        // 如果相同就是同一周反之就不是
        let getWeekCnt = function (unixtime: number) {
            const date = DateUtils.getLogicDate();
            const offset = date.getTimezoneOffset();
            let timeZone = offset * DateUtils.secMinute;
            let day = Math.floor((unixtime - timeZone - initPoint) / DateUtils.secDay);
            let cnt = Math.floor((day + 3) / 7);
            return cnt;
        }
        let week1 = getWeekCnt(t1);
        let week2 = getWeekCnt(t2);
        return week1 == week2;
    }
    public static closeTimer(timer: NodeJS.Timeout) {
        if (timer) {
            clearTimeout(timer);
        }
    }

    // 输入格式: 2024-04-08 00:00:00  返回标准时间戳，秒数
    public static getTimestampFromString(timeString: string): number {
        const date = new Date(timeString);
        if (isNaN(date.getTime())) {
            console.error('Invalid time string');
            return 0;
        }
        return date.getTime() * 0.001;
    }

    // 返回今天周几，1为周1,7为周日
    public static getWeekday(): number {
        let nowTime = this.msSysTick;//现在时间
        let today = this.formatTime3(nowTime);//今天是多少号
        let weekday = this.getWeekFromPeriod(today);
        return weekday;
    }

    // 输入：星期集合[[1,3],[4,7]]，或者跨周的[[2,3],[4,1]]
    // 返回：游戏内的标准时间戳，单位秒[开始时间戳，结束时间戳]，如果不在活动时间内，返回[0, 0]
    public static getActTick(strData: string): number[] {
        let array = JSON.parse(strData);
        let weekday = this.getWeekday();
        for (let data of array) {
            if (weekday >= data[0] && weekday <= data[1]) {
                let nowLogicSec = DateUtils.sysTick;
                let tdyPassSec = this.getTodayPassedSecond(nowLogicSec * 1000);
                // 从今天0点开始算，所以加1
                let intervalSec = (data[1] - weekday + 1) * DateUtils.secDay;
                let endTick = nowLogicSec - tdyPassSec + intervalSec;
                let startTick = endTick - (data[1] + 1 - data[0]) * DateUtils.secDay;
                return [startTick, endTick - 1];
            }

            let dayStart = data[0];
            let dayEnd = data[1];
            // 跨周处理,[[2,3],[4,1]]
            if (dayStart > dayEnd) {
                let checkDays: number[][] = [[dayStart, 7], [1, dayEnd]];
                let checkIndex = -1;
                for (let pos in checkDays) {
                    let checkDay: number[] = checkDays[pos];
                    if (weekday >= checkDay[0] && weekday <= checkDay[1]) {
                        checkIndex = Number(pos);
                        break;
                    }
                }
                if (checkIndex >= 0) {
                    let nowLogicSec = DateUtils.sysTick;
                    let tdyPassSec = this.getTodayPassedSecond(nowLogicSec * 1000);
                    let startTick: number;
                    let endTick: number;
                    // [dayStart, 7]
                    let period: number = dayEnd + 7 - dayStart + 1;
                    if (weekday >= dayStart) {
                        // 从今天0点开始算，先算开始时间
                        startTick = nowLogicSec - tdyPassSec - (weekday - dayStart) * DateUtils.secDay;
                        endTick = startTick + period * DateUtils.secDay;
                    } else {
                        // [1, dayEnd]
                        // 从今天0点开始算，先算结束时间
                        endTick = nowLogicSec - tdyPassSec + (dayEnd - weekday + 1) * DateUtils.secDay;
                        startTick = endTick - period * DateUtils.secDay;
                    }
                    console.log(`in get act tick, data:${data},startTick:${startTick}[${DateUtils.unixtimeFormat(startTick, 4)}],endTick:${endTick}[${DateUtils.unixtimeFormat(endTick, 4)}]`);
                    return [startTick, endTick - 1];
                }
            }
        }
        return [0, 0];
    }

    // 输入：星期集合[[1,3],[4,7]]
    // 返回：当天是否在活动时间内
    public static inActTime(strData: string): boolean {
        let logicTickList = this.getActTick(strData);
        return logicTickList.length > 0 && logicTickList[0] > 0;
    }

    // 输入：时间集合[[9,0],[22,0]]
    // 返回：若正在活动期间则返回活动开始和结束时间戳（标准时间戳，秒），否则返回[0]
    public static getActTimeToday(timeList: number[][]): number[] {
        let tmpDate = DateUtils.getLogicDate();
        let date1 = new Date(tmpDate.getFullYear(), tmpDate.getMonth(), tmpDate.getDate(), timeList[0][0], timeList[0][1], 0);
        let date2 = new Date(tmpDate.getFullYear(), tmpDate.getMonth(), tmpDate.getDate(), timeList[1][0], timeList[1][1], 0);
        let msTick = this.msSysTick;
        if (msTick >= date1.getTime() && msTick < date2.getTime())
            return [MathUtils.toInteger(date1.getTime() * 0.001), MathUtils.toInteger(date2.getTime() * 0.001)];
        return [0];
    }

    /**
     * 时间戳格式化 [没有减去cost20230101s]
     * @param unix 秒级时间戳 
     * @param x 返回类型
     */
    public static unixtimeFormat(unix: number, x: number) {
        let time = new Date(unix * 1000),
            year = time.getFullYear().toString(),
            month = (time.getMonth() + 1).toString(),
            dete = time.getDate().toString(),
            hours = time.getHours().toString(),
            minute = time.getMinutes().toString(),
            second = time.getSeconds().toString(),
            milliSec = time.getMilliseconds().toString();

        if (month.length === 1) month = "0" + month;
        if (dete.length === 1) dete = "0" + dete;
        if (hours.length === 1) hours = "0" + hours;
        if (minute.length === 1) minute = "0" + minute;
        if (second.length === 1) second = "0" + second;

        switch (x) {
            case 1: return parseInt(year + month + dete);
            case 2: return parseInt(hours + minute + second);
            case 3: return parseInt(month + dete + hours + minute);
            case 4: return parseInt(year + month + dete + hours + minute + second);
        }
    }

    /**
     * 格式化时间，没有减去cost20230101s
     * @param t 1今天 2昨天 3前天 4大前天
     * @param x  1年月日  2时分秒 3月日时分 4 年月日时分秒
     */
    public static getYmdHis(t: number, x: number) {
        let time = DateUtils.getLogicDate();

        if (t - 1 > 0) {
            time.setTime(time.getTime() - 86400 * 1000 * (t - 1));
        }

        let year = time.getFullYear().toString(),
            month = (time.getMonth() + 1).toString(),
            dete = time.getDate().toString(),
            hours = time.getHours().toString(),
            minute = time.getMinutes().toString(),
            second = time.getSeconds().toString(),
            milliSec = time.getMilliseconds().toString();

        if (month.length === 1) month = "0" + month;
        if (dete.length === 1) dete = "0" + dete;
        if (hours.length === 1) hours = "0" + hours;
        if (minute.length === 1) minute = "0" + minute;
        if (second.length === 1) second = "0" + second;

        switch (x) {
            case 1: return parseInt(year + month + dete);
            case 2: return parseInt(hours + minute + second);
            case 3: return parseInt(month + dete + hours + minute);
            case 4: return parseInt(year + month + dete + hours + minute + second);
        }
    }

    public static getLogicDate(tdate?: Date): Date {
        if (tdate)
            return tdate;

        let date1 = new Date();
        let millTime = date1.getTime() + DateUtils.msOffset;
        let newDate = new Date();
        newDate.setTime(millTime);
        return newDate;
    }

    /**
     * 获取指定日期的明天，
     * @param time 秒级时间戳
     * @returns 秒级时间戳
     */
    public static getTomorrow(time: number): number {
        let unix = time * 1000 ;
        let date = new Date(unix);

        let year = date.getFullYear().toString(),
            month = (date.getMonth() + 1).toString(),
            dete = date.getDate().toString(),
            ymd = year + '/' + month + '/' + dete;

        let tomorrow = (new Date(ymd)).valueOf() + 24 * 60 * 60 * 1000;
        return (tomorrow) / 1000;
    }

    // 传入[2,23], 返回本周2的23:00:00对应的标准时间戳。周1传1，周日传0
    public static convertToUnixTick(time: number[]): number {
        let dayOfWeek: number = time[0] == 0 ? 7 : time[0];
        let hour: number = time[1];
        let baseTick = this.getWeekFirstDayZeroTime();
        let res = baseTick + (dayOfWeek - 1) * this.secDay + hour * this.secHour;
        return res;
    }

    public static scheduleTaskAtMinute30(task: () => void): void {
        // 定义一个函数来检查当前时间是否为第 30 分钟
        let flagProcessed = false;
        function isMinute30(): boolean {
            const now = DateUtils.getLogicDate();
            let flag1 = now.getMinutes() >= 30; // 检查分钟是否为 30
            return flag1;
        }

        // 设置一个定时器，每分钟检查一次
        const interval = setInterval(() => {
            let flag2 = isMinute30();
            if (flag2) {
                if (!flagProcessed) {
                    flagProcessed = true;
                    task(); // 如果是第 30 分钟，执行任务
                }
            } else {
                flagProcessed = false;
            }
        }, 6 * 1000); // 每分钟检查一次（60 秒 * 1000 毫秒）

        console.log("Task scheduler started. It will run at the 30th minute of every hour.", task);
    }
}
