"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateUtils = void 0;
const util_1 = require("util");
/**
* 时间工具
* @author An
*/
class DateUtils {
    /**
     * 获取（指定）时间戳（毫秒）
     * @static
     * @param {*} data
     * @return {*}  {number}
     * @memberof DateUtils
     */
    static getTimeEx(data) {
        let date = new Date();
        if (data) {
            for (let key in data) {
                let val = data[key];
                switch (key) {
                    case 'y':
                        date.setFullYear(val);
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
        let msNewTime = date.getTime() + DateUtils.msOffset - DateUtils.cost20230101ms;
        return msNewTime;
    }
    static get sysTick() {
        return Math.round(DateUtils.msSysTick * 0.001);
    }
    static get msSysTick() {
        let date = new Date();
        let msTime = date.getTime() + DateUtils.msOffset;
        return msTime;
    }
    /**
  * 获取时间戳：逻辑时间戳
  * @static
  * @param {boolean}
  * @param {*} data
  * @return {*}  {number} 毫秒
  * @memberof DateUtils
  */
    static timestamp() {
        let msTime = DateUtils.msSysTick - DateUtils.cost20230101ms; //1970年到2023年的毫秒差
        return msTime;
    }
    /**
     * 获取Unix时间戳
     * @static
     * @param {boolean} [returnMs=false] 返回秒
     * @param {*} data
     * @return {*}  {number}
     * @memberof DateUtils
     */
    static unixtime() {
        let result = this.timestamp();
        return Math.round(result * 0.001);
    }
    /**
    * 格式化时间: 时:分:秒
    * @param msec 毫秒
    */
    static numberToTime1(ms) {
        let sec = ms * 0.001;
        let str = this.numberToTime2(sec);
        return str;
    }
    /**
     * @author An
     * @param value 秒格式化
     */
    static formatSeconds(value) {
        let secondTime = value; //parseInt(value);// 秒
        let minuteTime = 0; // 分
        let hourTime = 0; // 小时
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
    static numberToTime2(sec) {
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
    static isInTheRange(msTimeStamp, RangeArr) {
        let NowDate = new Date();
        NowDate.setTime(msTimeStamp + DateUtils.cost20230101ms);
        let minHour = RangeArr[0][0];
        let minSec = RangeArr[0][1];
        let maxHour = RangeArr[1][0];
        let maxSec = RangeArr[1][1];
        let d1 = new Date();
        d1.setTime(msTimeStamp);
        d1.setHours(minHour);
        d1.setMinutes(minSec);
        let d2 = new Date();
        d2.setTime(msTimeStamp);
        d2.setMinutes(maxSec);
        if (minHour > maxHour) {
            //跨天
            d2.setHours(maxHour + 24);
        }
        else {
            d2.setHours(maxHour);
        }
        if (d1.valueOf() < msTimeStamp && d2.valueOf() > msTimeStamp) {
            return true;
        }
    }
    /**
     * 按需格式化日期
     * @param NowTimeStamp
     * @returns
     */
    static getDateHourNowTimeStamp(msNowTimeStamp) {
        let tmpDate = new Date(msNowTimeStamp + DateUtils.cost20230101ms);
        let month = tmpDate.getMonth() + 1;
        let day = tmpDate.getDate();
        let hour = tmpDate.getHours();
        let stringDate = (0, util_1.format)('%d-', tmpDate.getFullYear());
        stringDate = month < 10 ? stringDate + 0 + month.toString() + "-" : stringDate + month.toString() + "-";
        stringDate = day < 10 ? stringDate + 0 + day.toString() + "-" : stringDate + day.toString() + "-";
        stringDate = hour < 10 ? stringDate + 0 + hour.toString() : stringDate + hour.toString();
        return stringDate;
    }
    /**
     * 请使用 DateUtils.timestamp()获取的时间戳来计算
     * 获取到指定日期00：00的毫秒数
    **/
    static getRenainMilliSecond(msNowTimeStamp) {
        let tmpDate = new Date(msNowTimeStamp + DateUtils.cost20230101ms);
        let ptime = (DateUtils.getTodayZeroMilliSecond(tmpDate) + 60 * 60 * 24) - tmpDate.getTime();
        return ptime;
    }
    /**
     * 请使用 DateUtils.timestamp()获取的时间戳来计算
     * 今天已过去的秒数
     **/
    static getTodayPassedSecond(msNowTimeStamp) {
        let tmpDate = new Date(msNowTimeStamp + DateUtils.cost20230101ms);
        let tdyPassTime = ((tmpDate.getTime() - (new Date(tmpDate.getFullYear(), tmpDate.getMonth(), tmpDate.getDate()).getTime())));
        return tdyPassTime;
    }
    /**
     * 根据时间戳获取日期
     * @param NowTimeStamp
     * @returns
     */
    static stampTimeData(msNowTimeStamp) {
        let tmpDate = new Date(msNowTimeStamp + DateUtils.cost20230101ms);
        return tmpDate;
    }
    /**
     * 根据时间戳获取日期
     * @param NowTimeStamp
     * @returns
     */
    static stampTimeDataSec(secNowTimeStamp) {
        let tmpDate = DateUtils.stampTimeData(secNowTimeStamp * 1000);
        return tmpDate;
    }
    /**
     * 获取指定日期00:00时刻的秒数
     * @parma 秒
     * @returns {number}
     */
    static getTodayZeroSecond(tdate) {
        let tmpDate = tdate ? tdate : new Date();
        return parseInt(((new Date(tmpDate.getFullYear(), tmpDate.getMonth(), tmpDate.getDate()).getTime()) / 1000).toFixed(0)) - DateUtils.cost20230101s;
    }
    /**
     * 获取今日00:00时刻的毫秒时间戳
     * @parma 毫秒
     * @returns {number}
     */
    static getTodayZeroMilliSecond(tdate) {
        let tmpDate = tdate ? tdate : new Date();
        let now = new Date(tmpDate.getFullYear(), tmpDate.getMonth(), tmpDate.getDate()).getTime();
        now -= DateUtils.cost20230101ms;
        return now;
    }
    /**
     * 获取明日00:00时刻的时间戳
     * @parma 毫秒
     * @returns {number}
     */
    static getTomorrowZeroMilliSecond(tdate) {
        let tmpDate = tdate ? tdate : new Date();
        let msNow = new Date(tmpDate.getFullYear(), tmpDate.getMonth(), tmpDate.getDate()).getTime();
        msNow += 24 * 60 * 60 * 1000;
        msNow -= DateUtils.cost20230101ms;
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
    //     // let Nowdate = new Date();
    //     let WeekFirstDay = DateUtils.showWeekFirstDay(NowTimeStamp);
    //     let WeekLastDay = new Date((WeekFirstDay + 6 * 86400000));
    //     // let WeekLastDay = new Date((WeekFirstDay / 1000 + 6 * 86400) * 1000);
    //     // var M=Number(WeekLastDay.getMonth())+1
    //     // return WeekLastDay.getYear()+"-"+M+"-"+WeekLastDay.getDate();
    //     return WeekLastDay;
    // }
    //请使用 DateUtils.timestamp()获取的时间戳来计算
    //获取当月天数
    static GetMonthDayNum(msNowTimeStamp) {
        let date = new Date(msNowTimeStamp + DateUtils.cost20230101ms);
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
    static getNextMoonFirstDayZeroTimeStamp(msNowTimeStamp = null) {
        let nowDate;
        if (msNowTimeStamp) {
            nowDate = new Date(msNowTimeStamp + DateUtils.cost20230101ms);
        }
        else {
            nowDate = new Date();
        }
        let moon = nowDate.getMonth() + 1;
        let year = nowDate.getFullYear();
        // 新的一年
        if (moon + 1 > 12) {
            year += 1;
            moon = 1;
        }
        let newDate = new Date(year, moon, 1, 0, 0, 1);
        return newDate.getTime() - DateUtils.cost20230101ms;
    }
    /**
     * 获取下个月一日0点的时间戳
     * @param NowTimeStamp 请使用 DateUtils.timestamp()获取的时间戳来计算
     * @returns
     */
    static getNextMoonFirstDayZeroTimeStampSec(msNowTimeStamp = null) {
        let ms = this.getNextMoonFirstDayZeroTimeStamp(msNowTimeStamp);
        let sec = Math.round(ms * 0.001);
        return sec;
    }
    /**
   * 获取下周一一日0点的时间戳
   * @param NowTimeStamp 请使用 DateUtils.timestamp()获取的时间戳来计算
   * @returns
   */
    static getNextWeekFirstDayZeroTimeStamp(msNowTimeStamp = null) {
        let nowDate;
        if (msNowTimeStamp) {
            nowDate = new Date(msNowTimeStamp + DateUtils.cost20230101ms);
        }
        else {
            nowDate = new Date();
        }
        let curDay = nowDate.getDay();
        curDay = curDay > 0 ? curDay : 7;
        let difday = 7 - curDay; //用
        let hours = nowDate.getHours();
        let minutes = nowDate.getMinutes();
        let seconds = nowDate.getSeconds();
        let sum = difday * 86400 * 1000 + 86400 * 1000 - (hours * 3600 * 1000 + minutes * 60 * 1000 + seconds * 1000);
        let nextData = new Date(nowDate.getTime() + sum);
        return nextData.getTime() - DateUtils.cost20230101ms;
    }
    /**
* 获取本周一一日0点的时间戳
* @param NowTimeStamp 请使用 DateUtils.timestamp()获取的时间戳来计算
* @returns
*/
    static getWeekFirstDayZeroTimeStamp(msNowTimeStamp = null) {
        let msTime = this.getNextWeekFirstDayZeroTimeStamp(msNowTimeStamp);
        return msTime - 604800000;
    }
    /**
     * 求出当前时间离下周一凌晨0点还差多少毫秒
     * @param 毫秒差
     * **/
    static calcWeekFirstDay() {
        // var lastDay = showWeekLastDay().getDay();
        // lastDay = lastDay > 0?lastDay:7;
        let Nowdate = new Date();
        let curDay = Nowdate.getDay();
        curDay = curDay > 0 ? curDay : 7;
        let difday = 7 - curDay; //用
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
    static formatFullTime(msTime) {
        let format;
        let date = new Date(msTime + DateUtils.cost20230101ms);
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
    static formatFullTimeByNow(split = null) {
        let format;
        let date = new Date();
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();
        // let weekDay = date.getDay();
        let monthStr;
        if (month < 10) {
            monthStr = "0" + month;
        }
        else {
            monthStr = month.toString();
        }
        let dayStr;
        if (day < 10) {
            dayStr = "0" + day;
        }
        else {
            dayStr = day.toString();
        }
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
        }
        else {
            format = year + monthStr + dayStr + hourStr + minStr;
        }
        return format;
    }
    /**
 * 格式化当前时间
 * @param  time 请使用 DateUtils.timestamp()获取的时间戳来计算
 * @returns String 12月12日 12:12
 */
    static formatFullTime2(msTime) {
        let format;
        let date = new Date(msTime + DateUtils.cost20230101ms);
        let month = date.getMonth() + 1;
        let day = date.getDate();
        // let weekDay = date.getDay();
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
    static formatTime2(msTime) {
        let d = Math.floor(msTime * 0.001); //取s为单位
        let hour = Math.floor(d / 3600); //获取小时数
        let day = Math.floor(hour / 24); //获取天数
        let min = Math.floor(d % 3600 / 60); //获取分钟数
        let sec = d % 3600 % 60; //获取秒数
        // return [day, hour, min, sec];
        return [hour, min, sec];
    }
    /**格式化天数
    * @param time 时间 毫秒
    * @returns 天数
    */
    static formatTime3(msTime) {
        let d = Math.floor(msTime * 0.001); //取s为单位
        let hour = Math.floor(d / 3600); //获取小时数
        let day = Math.floor(hour / 24); //获取天数
        return day;
    }
    /**当前几点
    * @param time 时间 毫秒
    * @returns 天数
    */
    static formatTime4(msTime) {
        let d = Math.floor(msTime * 0.001); //取s为单位
        let hour = Math.floor(d / 3600); //获取小时数
        let day = Math.floor(hour / 24); //获取天数
        let clock = Math.floor((msTime - day * 86400000) / 3600000);
        return clock;
    }
    /**获得本周周几，0为周日
    * @param day :时间戳天数
    * @returns 周几
    */
    static getWeekFromPeriod(day) {
        let data = (day + DateUtils.initPeriod) % 7;
        if (data == 0) {
            data = 7;
        }
        return data;
    }
    static formatFullTime4(msTime) {
        let format;
        let date = new Date(msTime + DateUtils.cost20230101ms);
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
        let Seconds = date.getSeconds();
        let SecondsStr;
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
    static formatFullTime5(msTime) {
        let format;
        let date = new Date(msTime);
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();
        let monthStr;
        if (month < 10) {
            monthStr = "0" + month;
        }
        else {
            monthStr = month.toString();
        }
        let dayStr;
        if (day < 10) {
            dayStr = "0" + day;
        }
        else {
            dayStr = day.toString();
        }
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
        let Seconds = date.getSeconds();
        let SecondsStr;
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
    //钟数,nextTime:下个小时的某个时间点（输入毫秒数），默认为整点
    static getNextClock(msNextTime = 0) {
        let nowTime = DateUtils.timestamp();
        // let d = Math.floor(nowTime * 0.001);//取s为单位
        let Nexthour = Math.ceil(nowTime / 3600000); //获取小时数
        let time = Nexthour * 3600000 + msNextTime;
        return time;
    }
    /**
    * 判断本日是否有开启该活动
    * @param list 开启日
    * 经验证会导致宝箱奖励有问题，暂时注释掉了，以后找机会起复
    */
    static judgeTodayCanJoin(list) {
        let nowTime = DateUtils.timestamp(); //现在时间
        let today = DateUtils.formatTime3(nowTime); //今天是多少号
        let week = DateUtils.getWeekFromPeriod(today);
        if (list.indexOf(week) < 0) {
            return false;
        }
        return true;
    }
}
exports.DateUtils = DateUtils;
_a = DateUtils;
// 删档后改为 2023年1月1日 0点0分的时间戳，需要前后端配合
DateUtils.cost20230101s = 1672502400;
DateUtils.cost20230101ms = DateUtils.cost20230101s * 1000;
//时间戳日期为周几，被安总坑过？懂，周日=0，需为上面日期的周几+1，
DateUtils.initPeriod = 0;
DateUtils.secOneMinute = 60; //一分的秒数
DateUtils.secOneHour = 60 * _a.secOneMinute; //一个小时的秒数
DateUtils.sec5Hour = 5 * _a.secOneHour; //一周的秒数
DateUtils.secOneDay = 24 * _a.secOneHour; //一天的秒数
DateUtils.secOneWeek = 7 * _a.secOneDay; //一周的秒数
DateUtils.secOffset = 0;
DateUtils.msOffset = _a.secOffset * 1000;
//# sourceMappingURL=DateUtils.js.map