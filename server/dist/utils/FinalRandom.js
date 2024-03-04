"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinalRandom = void 0;
class FinalRandom {
    /**
     * 创建一个随机数生成器
     */
    constructor(seed) {
        this.seed = seed;
        if (!this.seed && this.seed != 0) {
            this.seed = new Date().getTime();
        }
    }
    /**
     * 返回一个随机数，在0.0～1.0之间
     */
    get value() {
        return this.range(0, 1);
    }
    /**
     * 返回一个在min和max之间的随机浮点数
     */
    range(min, max) {
        if (!this.seed && this.seed != 0) {
            this.seed = new Date().getTime();
        }
        max = max || 1;
        min = min || 0;
        this.seed = (this.seed * 9301 + 49297) % 233280;
        var rnd = this.seed / 233280.0;
        return min + rnd * (max - min);
    }
    /**
     * 返回一个随机数，在0.0～1.0之间
     */
    static get value() {
        return this.range(0, 1);
    }
    /**
     * 返回一个在min和max之间的随机浮点数
     */
    static range(min, max) {
        if (!this.seed || this.seed == 0) {
            this.seed = new Date().getTime();
        }
        this.seed = 2045 * (this.seed) + 1;
        this.seed = this.seed - Math.floor((this.seed / 1048576)) * 1048576;
        var t = (this.seed) / 1048576.0;
        t = min + (max - min) * t;
        return t;
        // max = max || 1;
        // min = min || 0;
        // this.seed = (this.seed * 9301 + 49297) % 4999297;
        // var rnd = this.seed / 4999297.0;
        // return min + rnd * (max - min);
    }
    /**
     * 返回一个在[0,max)之间的整数
     * @param max
     */
    static RandInt(max) {
        return Math.floor(FinalRandom.range(0, max));
    }
    /**
     * 返回一个在[min,max)之间的整数
     * @param min
     * @param max
     */
    static RandIntBetween(min, max) {
        let per = 1;
        if (max < 100000) {
            max = 10000 * max;
            min = 10000 * min;
            per = 10000;
        }
        return Math.floor(FinalRandom.range(min, max) / per);
    }
    /**
     * 返回一个在[0，max)之间的浮点数
     * @param max 最大数
     */
    static RandFloat(max) {
        return FinalRandom.range(0, max);
    }
    /**
     * 返回一个在[min,max)之间的浮点数
     * @param min
     * @param max
     */
    static RandFloatBetween(min, max) {
        return FinalRandom.range(min, max);
    }
    // /**
    //  * 均匀的计算随机数     
    //  * @param maxSpeed 
    //  * @param minSpeed 
    //  * @returns 
    //  */
    // public static RandIntBetween(minSpeed: number, maxSpeed: number) {
    //     let per:number = 1;
    //     if (maxSpeed < 100000) {
    //         maxSpeed = 10000 * maxSpeed;
    //         minSpeed = 10000 * minSpeed;
    //         per = 10000;
    //     }
    //     // if (maxSpeed < 100) {
    //     //     per = 100.0 / maxSpeed;
    //     // }
    //     // return Utils.randomNumber(maxSpeed, minSpeed);
    //     //先把数值拆分为若干个10等份
    //     let arr = [];
    //     let max = maxSpeed / 10;
    //     let min = minSpeed / 10;
    //     let probability = [];
    //     for (let i = min; i < max; i++) {
    //         let item = [];
    //         arr.push(item);
    //         probability.push(1);
    //         for (let j = 0; j <= 10; j++) {
    //             item.push((i * 10) + j);
    //         }
    //     }
    //     // cc.log(" max ", max, " min ", min, arr);
    //     //均匀地选择其中一份
    //     let item = arr[this.probabilityNumber(probability)];
    //     //这种做法还是不均匀
    //     // return item[Utils.randomNumber(item.length - 1, 0)];
    //     //改用概率算法
    //     //这种做法很均匀，但是效率低一点
    //     return item[this.probabilityNumber([1, 1, 1, 1, 1, 1, 1, 1, 1, 1])] / per;
    // }
    // private static probabilityNumber(arr: number[]) {
    //     let max = 0;
    //     let itemArray: { max: number, min: number, probability: number }[] = [];
    //     let min = 1;
    //     for (let i = 0; i < arr.length; i++) {
    //         let value = arr[i] * 100;
    //         let item = {
    //             max: min + value - 1,
    //             min: min,
    //             probability: value,
    //         };
    //         min = item.max + 1;
    //         max += value;
    //         itemArray.push(item);
    //     }
    //     // cc.log("probabilityNumber ",itemArray, max);
    //     let randomNum = this.randomNumber(max, 1);
    //     for (let i = 0; i < itemArray.length; i++) {
    //         let item = itemArray[i];
    //         if (randomNum >= item.min && randomNum <= item.max) {
    //             return i;
    //         }
    //     }
    //     throw new Error("unknow error");
    // }
    // private static randomNumber(max: number, min: number): number {
    //     return Math.round(Math.random() * (min - max) + max);
    // }
    static async randTest() {
        let arr = [];
        let arrLian = [];
        let old = 0;
        for (let i = 0; i < 10000; i++) {
            let num = this.RandIntBetween(5, 69);
            // await CommonUtils.sleep(10);
            // cc.log(num);
            let index = num;
            !arr[index] ? arr[index] = 0 : "";
            !arrLian[index] ? arrLian[index] = 0 : "";
            arr[index]++;
            if (old == num) {
                arrLian[index]++;
            }
            else {
                // arrLian[index] = 0;
            }
            old = num;
        }
        console.log(arr);
        // console.log(arr);
    }
}
exports.FinalRandom = FinalRandom;
//# sourceMappingURL=FinalRandom.js.map