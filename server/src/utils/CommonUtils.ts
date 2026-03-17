import { assert } from "console";
import { errStackLog, logInfo, logServerEx } from "../LogTS";
import { RpcEvent } from "../event/RpcEvent";
import { lanlu } from "../proto/protobuf/proto";
import { app, isDebug } from "../app";
import fs from "fs";
import { DateUtils } from "./DateUtils";
import { exit } from "process";
import { ServerType } from "../register/route";
import { LockModelLogic } from "../modelLogic/LockModelLogic";

export class CommonUtils {
    /**
     * 格式化字符串（大括号形式）
     * 示例：CommonUtilis.format("{0}击杀了{1}", "A玩家", "B玩家") = "A玩家击杀了B玩家"
     * @param template 模板
     * @param params 参数
     */
    public static format(template: string, ...params: any[]): string {
        let length = params.length;
        for (let n = 0; n < length; n++) {
            template = template.replace(`{${n}}`, params[n]);
        }
        return template;
    }

    /**
     * 格式化字符串（百分号形式）
     * 示例：CommonUtilis.format("%1%击杀了%2%", "A玩家", "B玩家") = "A玩家击杀了B玩家"
     * @param template 模板
     * @param params 参数
     */
    public static format2(template: string, ...params: any[]): string {
        let length = params.length;
        for (let n = 1; n < length; n++) {
            template = template.replace(`%${n}%`, params[n]);
        }
        return template;
    }

    /**
     * 获取字符串中的整型数字（int）
     * @param {string} str
     * @returns
     */
    public static getStrNum(str: string) {
        let result: number[];
        let matchArray = str.match(/\d+/g);

        if (matchArray && matchArray.length) {
            result = [];
            matchArray.forEach(val => {
                result.push(+val);
            });
        }

        return result;
    }


    /**
     * 深度复制
     * @param object
     */
    public static deepClone(object: any): any {
        if (object instanceof Array) {
            let array = [];
            let len = object.length;
            for (let n = 0; n < len; n++) {
                array.push(this.deepClone(object[n]));
            }
            return array;
        } else if (object instanceof Object) {
            let obj = {};
            for (let fieldKey in object) {
                if (object.hasOwnProperty(fieldKey)) {
                    obj[fieldKey] = this.deepClone(object[fieldKey]);
                }
            }
            return obj;
        } else {
            return object;
        }
    }

    /**
     * 属性克隆
     * @param parasitifer 宿主
     * @param obj 属性来源
     */
    public static propertyClone(parasitifer: any, obj: any) {
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                parasitifer[key] = obj[key];
            }
        }
    }


    public static async sleep(ms: number) {
        return new Promise((resolve, rejcet) => {
            setTimeout(() => {
                resolve(null);
            }, ms);
        });
    }

    //数组去重
    public static removeDistinct(arr: number[]) {
        for (let nIndex = 0; nIndex < arr.length - 1; nIndex++) {
            for (let i = nIndex + 1; i < arr.length;) {
                if (arr[nIndex] == arr[i]) {
                    arr.splice(i, 1);
                } else {
                    i++;
                }
            }
        }
    }


    public static getMD5(str: any) {
        let md5 = require('crypto').createHash('md5').update(str).digest('hex');
        return md5;
    }


    //按指定长度 切割数组
    public static cutArray(array: any[], subLength: number): any[][] {
        let index = 0;
        let newArr = [];
        while (index < array.length) {
            newArr.push(array.slice(index, index += subLength));
        }
        return newArr;
    }

    //二维数组转协议上的p_nkv的数组,key为数组0 val为数组:1
    public static switchPtnkvArry(array: number[][]): lanlu.Ip_nkv[] {
        let list: lanlu.Ip_nkv[] = []
        for (let i of array.values()) {
            let data: lanlu.Ip_nkv = {
                key: i[0],
                val: i[1]
            }
            list.push(data)
        }
        return list;
    }

    public static switchPtnkvArry_kv(keys: number[], values: number[]): lanlu.Ip_nkv[] {
        CommonUtils.assertEx(keys.length == values.length, "keys.length != values.length")
        let res: lanlu.Ip_nkv[] = [];
        for (let idx = 0; idx < keys.length; idx++) {
            let single: lanlu.Ip_nkv = {
                key: keys[idx],
                val: values[idx]
            }
            res.push(single)
        }
        return res;
    }

    //二维数组转协议上的p_nkv的数组,key为数组0 val为数组:1，64位
    public static switchPtnkvArryInt64(array: number[][]): lanlu.Ip_nfkv[] {
        let list: lanlu.Ip_nfkv[] = []
        for (let i of array.values()) {
            let data: lanlu.Ip_nfkv = {
                key: i[0],
                val: i[1]
            }
            list.push(data)
        }
        return list;
    }

    //二维数组转协议上的p_nkv的数组,key为数组0 val为数组:1，64位
    public static switchPtfnkvArryInt64(array: number[][]): lanlu.Ip_fnkv[] {
        let list: lanlu.Ip_fnkv[] = []
        for (let i of array.values()) {
            let data: lanlu.Ip_fnkv = {
                key: i[0],
                val: i[1]
            }
            list.push(data)
        }
        return list;
    }

    //二维数组转协议上的p_nkfvList的数组,key为uint32 val为uint64数组
    public static switchPtfnkfvList(array: any[]): lanlu.Ip_nkfvList[] {
        let list: lanlu.Ip_nkfvList[] = []
        for (let single of array) {
            let key = single['key'];
            let vList = single['data'];
            let data: lanlu.Ip_nkfvList = {
                key: key,
                vList: vList
            }
            list.push(data)
        }
        return list;
    }

    //二维数组转协议上的p_nkstrvList的数组,key为uint32 val为string数组
    public static switchPtfnkstrvList(array: any[]): lanlu.Ip_nkstrvList[] {
        let list: lanlu.Ip_nkstrvList[] = []
        for (let single of array) {
            let key = single['key'];
            let vList = single['data'];
            let data: lanlu.Ip_nkstrvList = {
                key: key,
                vList: vList
            }
            list.push(data)
        }
        return list;
    }

    //二维数组转协议上的p_nkv的数组,key为数组0 val为数组:1，64位
    public static switchPtnkvArryFromDemand(array: number[][], need: number[]): lanlu.Ip_nkv[] {
        let list: lanlu.Ip_nfkv[] = []
        for (let i of array.values()) {
            if (need.indexOf(i[0]) > -1) {
                let data: lanlu.Ip_nfkv = {
                    key: i[0],
                    val: i[1]
                }
                list.push(data)
            }
        }
        return list;
    }

    public static convertToDict_From_nkvList(nkvList: lanlu.Ip_nkv[]): { [key: number]: number } {
        let dict: { [key: number]: number } = {}
        for (let nkv of nkvList) {
            dict[nkv.key] = nkv.val
        }
        return dict;
    }

    //通过权重抽取ID
    //arr[0]为ID，arr[1]为权重,time 抽取次数,repeatable为true时返回值重复，默认为不可重复
    //返回arr[0]的数组
    public static extractionFromWeight(cfg: number[][], count: number, repeatable: boolean = false): number[] {
        let list: number[] = [];
        let arr = CommonUtils.deepClone(cfg)
        if (arr.length < count && repeatable == false) {
            return null
        }

        //可重复抽取结果
        if (repeatable || count == 1) {
            let sum: number = 0;
            let weight: number[] = [];
            for (let i = 0; i < arr.length; i++) {
                sum += arr[i][1];
                weight[i] = sum;
            }
            if (sum <= 0) {
                return null;
            }

            for (let a = 0; a < count; a++) {
                let random = Math.random() * sum
                for (let i = 0; i < weight.length; i++) {
                    if (random <= weight[i]) {
                        list.push(arr[i][0])
                        break;
                    }
                }
            }
        }
        //不可重复抽取结果
        else {
            for (let a = 0; a < count; a++) {
                //总权重
                let sum: number = 0;
                let weight: number[] = [];
                for (let i = 0; i < arr.length; i++) {
                    sum += arr[i][1];
                    weight[i] = sum;
                }

                if (sum <= 0) {
                    return null;
                }

                let random = Math.random() * sum
                for (let i = 0; i < weight.length; i++) {
                    if (random <= weight[i]) {
                        list.push(arr[i][0])
                        arr.splice(i, 1);
                        break;
                    }
                }
            }
        }
        return list;
    }

    //通过权重抽取道具奖励
    //arr[0]为ID，arr[3]为权重,time 抽取次数,repeatable为true时返回值重复，默认为不可重复
    /**
     * 
     * @param cfg 配置表数组 第0位是id
     * @param time 抽取次数
     * @param repeatable 是否重复抽取
     * @param loc 权重在cfg数组里的下标
     * @returns 
     */
    // public static extractionRewardFromWeight0(cfg: number[][], time: number, repeatable: boolean = false, loc: number = 3): number[][] {
    //     let list: number[][] = [];
    //     let arr = CommonUtils.deepClone(cfg)
    //     if (arr.length < time && repeatable == false) {
    //         return null
    //     }
    //     //可重复抽取结果
    //     if (repeatable || time == 1) {
    //         let sum: number = 0;
    //         let weight: number[] = [];
    //         let locReward: number[][] = []
    //         for (let i = 0; i < arr.length; i++) {
    //             sum += arr[i][loc];
    //             weight[i] = sum;
    //         }
    //         this.assertEx(!isNaN(sum))
    //         for (let a = 0; a < time; a++) {
    //             let random = Math.random() * sum;
    //             //logInfo("总权重:", sum, "random", random)
    //             for (let i = 0; i < weight.length; i++) {
    //                 if (random <= weight[i]) {
    //                     let needAdd = true
    //                     for (let x = 0; x < locReward.length; x++) {
    //                         if (locReward[x][0] == i) {
    //                             needAdd = false;
    //                             locReward[x][1]++;
    //                         }
    //                     }
    //                     if (needAdd) {
    //                         locReward.push([i, 1])
    //                     }
    //                     // let needAdd = true
    //                     // for (let x = 0; x < list.length; x++) {
    //                     //     if (list[x][0] == arr[i][0]) {
    //                     //         needAdd = false
    //                     //         list[x][1] += arr[i][1]
    //                     //         logInfo("不需要needADD", arr[i], list[x])
    //                     //     }
    //                     // }
    //                     // if (needAdd) {
    //                     //     logInfo("needAdd", arr[i])
    //                     //     list.push(arr[i]);
    //                     // }
    //                     break;
    //                 }
    //             }
    //         }
    //         for (let i = 0; i < locReward.length; i++) {
    //             let locNum = locReward[i][0]
    //             let item = arr[locNum]
    //             let num = item[1] * locReward[i][1]
    //             list.push([item[0], num, item[2]])
    //         }
    //     }
    //     //不可重复抽取结果
    //     else {
    //         for (let a = 0; a < time; a++) {
    //             //总权重
    //             let sum: number = 0;
    //             let weight: number[] = [];
    //             for (let i = 0; i < arr.length; i++) {
    //                 sum += arr[i][loc];
    //                 weight[i] = sum;
    //             }
    //             let random = Math.random() * sum
    //             for (let i = 0; i < weight.length; i++) {
    //                 if (random <= weight[i]) {
    //                     list.push(arr[i])
    //                     arr.splice(i, 1)
    //                     break;
    //                 }
    //             }
    //         }
    //     }
    //     return list
    // }

    /**
    * 根据权重从配置表中抽取奖励，支持重复和非重复抽取
    * @param cfg 配置表数组， [[cfgId,num,bind,q]]
    * @param time 抽取次数
    * @param repeatable 是否允许重复抽取
    * @param loc 权重在cfg数组里的下标
    * @returns 抽取结果数组
    */
    public static extractionRewardFromWeight(cfg: (number | undefined)[][], time: number, repeatable: boolean = false, loc: number = 3): number[][] {
        let list: number[][] = [];
        let arr = CommonUtils.deepClone(cfg);

        // 验证配置表有效性
        if (!this.isValidCfg(arr, loc)) {
            // throw new Error("Invalid configuration table.");
            return null
        }

        // 检查是否可进行抽取
        if (!repeatable && arr.length < time) {
            // return [];
            return null
        }

        // 抽取逻辑分隔
        if (repeatable || time === 1) {
            list = this.repeatableExtract(arr, time, loc);
        } else {
            list = this.nonRepeatableExtract(arr, time, loc);
        }

        return list;
    }

    // 验证配置表有效性
    private static isValidCfg(cfg: (number | undefined)[][], loc: number): boolean {
        return cfg.every(item => item && item.length >= loc && !isNaN(item[loc]));
    }

    // 可重复抽取逻辑
    private static repeatableExtract(arr: (number | undefined)[][], time: number, loc: number): number[][] {
        let list: number[][] = [];
        let weight: number[] = this.calculateWeight(arr, loc);

        for (let a = 0; a < time; a++) {
            let randomIndex = this.selectByWeight(weight);
            let reward = arr[randomIndex];
            list.push([reward[0], reward[1], reward[2]]);
        }

        return list;
    }

    // 不可重复抽取逻辑
    private static nonRepeatableExtract(arr: (number | undefined)[][], time: number, loc: number): number[][] {
        let list: number[][] = [];

        for (let a = 0; a < time; a++) {
            let weight: number[] = this.calculateWeight(arr, loc);
            let randomIndex = this.selectByWeight(weight);
            list.push(arr[randomIndex]);
            arr[randomIndex][loc] = 0; // 将权重置零以避免重复抽取
        }

        return list;
    }

    // 计算权重数组
    private static calculateWeight(arr: (number | undefined)[][], loc: number): number[] {
        let sum = 0;
        let weight: number[] = [];
        arr.forEach((item, index) => {
            if (!isNaN(item[loc])) {
                sum += item[loc];
                weight[index] = sum;
            }
        });
        return weight;
    }

    // 根据权重选择索引
    private static selectByWeight(weight: number[]): number {
        let random = Math.random() * weight[weight.length - 1];
        let index = weight.findIndex(w => w >= random);
        return index;
    }

    //道具奖励排重
    public static DischargeFromReward(cfg: number[][]): number[][] {
        let arr: number[][] = []
        for (let i = 0; i < cfg.length; i++) {
            let item = cfg[i];
            let noFind = true;
            for (let x = 0; x < arr.length; x++) {
                if (item[0] == arr[x][0] && item[2] == arr[x][2]) {
                    noFind = false;
                    arr[x][1] += item[1]
                    break;
                }
            }
            if (noFind) {
                arr.push(item)
            }
        }
        return arr
    }

    /**
    * 获取字符串的字节数
    * @param str
    */
    static getStrByteCount(str: string) {
        let result = 0;
        for (let n = 0; n < str.length; n++) {
            result += str.charCodeAt(n) > 255 ? 2 : 1;
        }
        return result;
    }

    /**
 * 分发随机数(不重复)
 * @param list 玩家UID组
 */
    public static distributeRandom(list: number[], min: number, max: number): number[][] {
        let data: number[][] = [];
        let end: number[] = [];
        // let min = 3;
        // let max = 18;
        let dif = max - min;
        for (let i = 0; i < 99; i++) {
            let random = Math.round(Math.random() * dif + min)
            if (end.indexOf(random) < 0) {
                end.push(random)
                if (end.length == list.length) {
                    break;
                }
            }
        }
        for (let i = 0; i < list.length; i++) {
            if (end[i]) {
                data.push([list[i], end[i]])
            }
            else {
                data.push([list[i], min])
            }
        }
        return data
    }

    public static fisherYatesShuffle<T>(array: T[]): T[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    public static getRandomElements<T>(array: T[], n: number): T[] {
        if (array.length < n)
            return [...array];
        const shuffledArray = this.fisherYatesShuffle([...array]);
        return shuffledArray.slice(0, n);
    }

    public static delInArray<T>(arr: T[], value: T): boolean {
        let idx = arr.indexOf(value);
        if (idx < 0) {
            return false;
        }
        let del = arr.splice(idx, 1);
        return true;
    }

    // 遍历items，如果id和bindFlag与item相等，则将cnt加到item的cnt上；否则直接将item添加到数组
    // items:[[id, cnt, bindFlag], [id, cnt, bindFlag]]
    // item:[id, cnt, bindFlag]
    public static addItem(items: number[][], item: number[]) {
        for (let single of items) {
            if (single[0] == item[0]) {
                if (item[2] != null) {
                    if (single[2] == item[2]) {
                        single[1] += item[1];
                        return;
                    }
                }
            }
        }

        items.push(item);
    }

    public static addItems(items: number[][], toAdds: number[][]) {
        for (let single of toAdds)
            CommonUtils.addItem(items, single);
    }

    public static getMultiplyItems(items: number[][], multi: number) {
        let res = this.deepClone(items);
        for (let single of res)
            single[1] *= multi;
        return res;
    }

    public static toIntArray(arr: number[][]) {
        arr.forEach(element => {
            element[1] = Math.floor(element[1]);
        });
    }

    public static inRange(rangeList: number[], value: number): boolean {
        return rangeList[0] <= value && value <= rangeList[1];
    }

    // 追加到数组尾部，如果存在则不追加
    public static addToArray<T>(arr: T[], value: T): boolean {
        if (this.inArray(arr, value))
            return false;

        arr.push(value);
        return true;
    }

    public static inArray<T>(arr: T[], value: T): boolean {
        this.assertEx(arr !== undefined, 'arr is undefined');
        let idx = arr.indexOf(value);
        return idx >= 0;
    }

    public static inMap<T>(map: Map<T, any>, key: T): boolean {
        this.assertEx(map !== undefined, 'map is undefined');
        let val = map.get(key);
        let flag = val !== undefined;
        return flag;
    }

    public static valueInMap<T>(map: Map<any, T>, val: T): boolean {
        this.assertEx(map !== undefined, 'map is undefined');
        for (let k of map.keys()) {
            if (map.get(k) == val)
                return true;
        }
        return false;
    }

    public static inArrays<T>(arr1: T[], arr2: T[], value: T): boolean {
        return CommonUtils.inArray(arr1, value) || CommonUtils.inArray(arr2, value);
    }

    public static isEmptyObject(obj: {}): boolean {
        if (!obj)
            return true;
        return Object.keys(obj).length === 0;
    }

    public static isNullOrUndefined(obj: any): boolean {
        return obj === undefined || obj === null;
    }

    /**
 * 获取字符串的字节长度
 * @param str
 */
    static getStrByteSize(str: string) {
        if (!str)
            return 0;
        let size = 0;
        for (let n = 0; n < str.length; n++) {
            let c = str.charAt(n);
            if (/^[\u0000-\u00ff]$/.test(c)) {
                size++;
            } else {
                size += 2;
            }
        }
        return size;
    }

    /**
 * 过滤特殊符号
 * @param str
 */
    // static filterSpecialSymbols(str: string) {
    //     const _specialSymbols = "❤❥웃유♋☮✌☏☢☠✔☑♚▲♪✈✞÷↑↓◆◇⊙■□△▽¿─│♥❣♂♀☿Ⓐ✍✉☣☤✘☒♛▼♫⌘☪≈←→◈◎☉★☆⊿※¡━┃♡ღツ☼☁❅♒✎©®™Σ✪✯☭➳卐√↖↗●◐Θ◤◥︻〖〗┄┆℃℉°✿ϟ☃☂✄¢€£∞✫★½✡×↙↘○◑⊕◣◢︼【】┅┇☽☾✚〓▂▃▄▅▆▇█▉▊▋▌▍▎▏↔↕☽☾の•▸◂▴▾┈┊①②③④⑤⑥⑦⑧⑨⑩ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ㍿▓♨♛❖♓☪✙┉┋☹☺☻تヅツッシÜϡﭢ™℠℗©®♥❤❥❣❦❧♡۵웃유ღ♋♂♀☿☼☀☁☂☄☾☽❄☃☈⊙☉℃℉❅✺ϟ☇♤♧♡♢♠♣♥♦☜☞☝✍☚☛☟✌✽✾✿❁❃❋❀⚘☑✓✔√☐☒✗✘ㄨ✕✖✖⋆✢✣✤✥❋✦✧✩✰✪✫✬✭✮✯❂✡★✱✲✳✴✵✶✷✸✹✺✻✼❄❅❆❇❈❉❊†☨✞✝☥☦☓☩☯☧☬☸✡♁✙♆。，、＇：∶；?‘’“”〝〞ˆˇ﹕︰﹔﹖﹑•¨….¸;！´？！～—ˉ｜‖＂〃｀@﹫¡¿﹏﹋﹌︴々﹟#﹩$﹠&﹪%*﹡﹢﹦﹤‐￣¯―﹨ˆ˜﹍﹎+=<＿_-\\ˇ~﹉﹊（）〈〉‹›﹛﹜『』〖〗［］《》〔〕{}「」【】︵︷︿︹︽_﹁﹃︻︶︸﹀︺︾ˉ﹂﹄︼☩☨☦✞✛✜✝✙✠✚†‡◉○◌◍◎●◐◑◒◓◔◕◖◗❂☢⊗⊙◘◙◍⅟½⅓⅕⅙⅛⅔⅖⅚⅜¾⅗⅝⅞⅘≂≃≄≅≆≇≈≉≊≋≌≍≎≏≐≑≒≓≔≕≖≗≘≙≚≛≜≝≞≟≠≡≢≣≤≥≦≧≨≩⊰⊱⋛⋚∫∬∭∮∯∰∱∲∳%℅‰‱㊣㊎㊍㊌㊋㊏㊐㊊㊚㊛㊤㊥㊦㊧㊨㊒㊞㊑㊒㊓㊔㊕㊖㊗㊘㊜㊝㊟㊠㊡㊢㊩㊪㊫㊬㊭㊮㊯㊰㊙㉿囍♔♕♖♗♘♙♚♛♜♝♞♟ℂℍℕℙℚℝℤℬℰℯℱℊℋℎℐℒℓℳℴ℘ℛℭ℮ℌℑℜℨ♪♫♩♬♭♮♯°øⒶ☮✌☪✡☭✯卐✐✎✏✑✒✍✉✁✂✃✄✆✉☎☏➟➡➢➣➤➥➦➧➨➚➘➙➛➜➝➞➸♐➲➳⏎➴➵➶➷➸➹➺➻➼➽←↑→↓↔↕↖↗↘↙↚↛↜↝↞↟↠↡↢↣↤↥↦↧↨➫➬➩➪➭➮➯➱↩↪↫↬↭↮↯↰↱↲↳↴↵↶↷↸↹↺↻↼↽↾↿⇀⇁⇂⇃⇄⇅⇆⇇⇈⇉⇊⇋⇌⇍⇎⇏⇐⇑⇒⇓⇔⇕⇖⇗⇘⇙⇚⇛⇜⇝⇞⇟⇠⇡⇢⇣⇤⇥⇦⇧⇨⇩⇪➀➁➂➃➄➅➆➇➈➉➊➋➌➍➎➏➐➑➒➓㊀㊁㊂㊃㊄㊅㊆㊇㊈㊉ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ⒜⒝⒞⒟⒠⒡⒢⒣⒤⒥⒦⒧⒨⒩⒪⒫⒬⒭⒮⒯⒰⒱⒲⒳⒴⒵ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩⅪⅫⅬⅭⅮⅯⅰⅱⅲⅳⅴⅵⅶⅷⅸⅹⅺⅻⅼⅽⅾⅿ┌┍┎┏┐┑┒┓└┕┖┗┘┙┚┛├┝┞┟┠┡┢┣┤┥┦┧┨┩┪┫┬┭┮┯┰┱┲┳┴┵┶┷┸┹┺┻┼┽┾┿╀╁╂╃╄╅╆╇╈╉╊╋╌╍╎╏═║╒╓╔╕╖╗╘╙╚╛╜╝╞╟╠╡╢╣╤╥╦╧╨╩╪╫╬◤◥◄►▶◀◣◢▲▼◥▸◂▴▾△▽▷◁⊿▻◅▵▿▹◃❏❐❑❒▀▁▂▃▄▅▆▇▉▊▋█▌▍▎▏▐░▒▓▔▕■□▢▣▤▥▦▧▨▩▪▫▬▭▮▯㋀㋁㋂㋃㋄㋅㋆㋇㋈㋉㋊㋋㏠㏡㏢㏣㏤㏥㏦㏧㏨㏩㏪㏫㏬㏭㏮㏯㏰㏱㏲㏳㏴㏵㏶㏷㏸㏹㏺㏻㏼㏽㏾㍙㍚㍛㍜㍝㍞㍟㍠㍡㍢㍣㍤㍥㍦㍧㍨㍩㍪㍫㍬㍭㍮㍯㍰㍘☰☲☱☴☵☶☳☷☯";
    //     for (let n = str.length - 1; n >= 0; n--) {
    //         if (_specialSymbols.indexOf(str[n]) != -1) {
    //             str = str.substring(0, n) + str.substring(n + 1, str.length);
    //         }
    //     }
    //     return str;
    // }

    /**
     * 净化字符串
     * @param str
     */
    static purgeStr(str: string) {
        str = str.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '');
        return str;
    }

    public static getClsName(obj: any): string {
        const prototype = Object.getPrototypeOf(obj);
        const className = prototype.constructor.name;
        return className;
    }

    public static getProNo(obj: any): number[] {
        // lanlu.IPt17_1_tos    
        let clsName = CommonUtils.getClsName(obj);
        return this.getProNoByName(clsName);
    }

    public static getProNoByName(clsName: string): number[] {
        // lanlu
        clsName = clsName.replace('lanlu.IPt', '');
        clsName = clsName.replace('IPt', '');
        clsName = clsName.replace('Pt', '');
        let datas = clsName.split('_');
        return [parseInt(datas[0]), parseInt(datas[1])];
    }

    public static makeProData(name: string, data: any) {
        // let rlanlu = ProtoCenter.Instance.lanlu;
        // let proData = new rlanlu[name](data);
        // return proData;
    }

    public static hasKey(obj: {}, key: string): boolean {
        return obj.hasOwnProperty(key);
    }

    public static getKeys<T>(map: Map<T, any>): T[] {
        let res: T[] = [];
        for (let k of map.keys())
            res.push(k);
        if (res.length > 0 && typeof res[0] == 'number')
            res.sort((a, b) => Number(a) - Number(b));
        else
            res.sort()
        return res;
    }

    public static getMaxKey(map: Map<number, any>): Number {
        let keys: number[] = this.getKeys(map);
        let maxKey: number = Math.max(...keys);
        return maxKey;
    }

    public static getKeyCnt(dict: {}): number {
        let cnt = 0;
        for (let k in dict) {
            cnt++;
        }
        return cnt;
    }

    public static getKeysFromDict(dict: {}) {
        let keys = [];
        for (let k in dict) {
            keys.push(k);
        }
        keys.sort();
        return keys;
    }

    public static getNumKeysFromDict(dict: {}) {
        let keys = [];
        for (let k in dict) {
            keys.push(+k);
        }
        keys.sort((a, b) => a - b);
        return keys;
    }

    public static getValuesFromDict(dict: {}) {
        let values = [];
        for (let k in dict) {
            values.push(dict[k]);
        }
        return values;
    }

    public static sum(arr: number[]): number {
        let res = 0;
        for (let single of arr)
            res += single;
        return res;
    }

    public static sumDictValues(dict: {}): number {
        let values = this.getValuesFromDict(dict);
        let res = this.sum(values);
        return res;
    }

    public static assertEx(value: any, message?: string, ...optionalParams: any[]): boolean {
        if (!value) {
            errStackLog('assert failed');
            logServerEx(message, optionalParams);
            return false;
        }
        // assert(value, message, optionalParams);
        return true;
    }

    public static assertFatal(value: any, message?: string, ...optionalParams: any[]): void {
        if (!value) {
            CommonUtils.fatalError(message, optionalParams);
        }
    }

    public static fatalError(message?: string, ...optionalParams: any[]): void {
        logServerEx(message, optionalParams);
        errStackLog(`fatal error, server will exit, ${app.serverInfo.serverName}`, message, JSON.stringify(optionalParams));
        exit(98763);
    }

    public static assertIsNum(value: any, message?: string, ...optionalParams: any[]): void {
        this.assertEx(typeof value === 'number', message, ...optionalParams);
    }

    public static assertIsSocial() {
        this.assertEx(app.serverType == ServerType.social);
    }

    public static safeAddDict<T>(values: Map<T, any>, key: T, value: number = 1): void {
        let bakV = values.get(key) || 0;
        values.set(key, bakV + value);
    }

    public static safeAddDictEx(values: {}, key: any, value: number = 1): void {
        let bakV = values[key] || 0;
        values[key] = bakV + value;
    }

    public static safeGetV<T>(values: Map<T, any>, key: T, defValue: any[]): any {
        if (!values.has(key))
            values.set(key, defValue);
        return values.get(key);
    }

    public static addAttr(attrs: number[][], k: number, v: number): number[][] {
        attrs = attrs || [];
        let findIndex = attrs.findIndex((item) => item[0] == k);
        if (findIndex == -1) {
            attrs.push([k, v]);
        } else {
            attrs[findIndex][1] += v;
        }
        return attrs;
    }

    public static safeInitDict(values: {}, key: any, defValue: any): any {
        if (!CommonUtils.hasKey(values, key))
            values[key] = defValue;
        return values[key];
    }

    // 若key不存在，或被删除则返回true；否则返回false
    public static safeSubDictValue<T>(values: Map<T, any>, key: T, value: number = 1) {
        let val = values.get(key);
        if (!val || val < value) {
            CommonUtils.assertEx(false);
            return true;
        }

        val -= value;
        if (val <= 0) {
            values.delete(key);
            return true;
        } else {
            values.set(key, val);
            return false;
        }
    }

    public static safeInitMap<K, V>(m: Map<K, V>, key: K, value: V): V {
        if (!m.has(key)) {
            m.set(key, value);
        }
        return m.get(key);
    }

    public static list2Kv(list: number[]) {
        let kvs = {};
        if (list) {
            for (let i = 0; i < list.length; i += 2) {
                kvs[list[i]] = list[i + 1];
            }
        }
        return kvs;
    }

    public static kv2List(kvs: any, convert: (k: any) => any = null) {
        let list = [];
        if (kvs) {
            for (let k in kvs) {
                if (convert) {
                    list.push(convert(k), kvs[k]);
                } else {
                    list.push(k, kvs[k]);
                }
            }
        }
        return list;
    }

    public static getValueFromKvList(list: number[], k: number, defValue: number = 0) {
        let kvs = this.list2Kv(list);
        if (kvs[k] == 0)
            return 0;
        return kvs[k] || defValue;
    }

    public static setValueToKvList(list: number[], k: number, v: number): number[] {
        let kvs = this.list2Kv(list);
        kvs[k] = v;
        return this.kv2List(kvs);
    }

    public static addValueToKvList(list: number[], k: number, v: number): number[] {
        let bakV = this.getValueFromKvList(list, k);
        let kvs = this.setValueToKvList(list, k, bakV + v);
        return kvs;
    }
    public static getValueFromList<T>(list: T[], idx: number, defValue: number | T = 0) {
        if (list[idx] == undefined)
            return defValue;
        return list[idx];
    }

    public static addToList(list: number[], idx: number, v: number) {
        if (list[idx] == undefined)
            list[idx] = v;
        else
            list[idx] += v;
    }

    // [[1,11],[2,22],[3,33]], 传入1，返回11
    public static getValueFromList2<T>(list: T[][], key: number, defValue: number | T = 0) {
        for (let data of list) {
            if (data[0] == key)
                return data[1];
        }
        return defValue;
    }

    public static getCount<T>(list: T[], value: T): number {
        let cnt = 0;
        for (let v of list)
            if (v == value)
                cnt += 1;
        return cnt;
    }

    public static map2Dict(map: Map<any, any>): {} {
        let dict = {};
        for (let k of map.keys()) {
            dict[k] = map.get(k);
        }
        return dict;
    }

    public static getEnumValues<T>(enumObj: T): T[] {
        const keys = Object.keys(enumObj) as (keyof T)[];
        return keys.filter(k => isNaN(Number(k)) as any)
            .map(k => enumObj[k as any]);
    }

    public static getEnumKeys<T>(enumObj: T): (keyof T)[] {
        return Object.keys(enumObj) as (keyof T)[];
    }

    public static getFormattedMapStr(map: Map<any, any>): string {
        const mapObject = Object.fromEntries(map);
        const jsonString = JSON.stringify(mapObject);
        return jsonString;
    }

    public static isLinux() {
        return process.platform === 'linux';
    }

    public static ids: number[] = [];
    public static len = 3;
    public static enableAsyncHood() {
        const async_hooks = require('async_hooks');
        const fs = require('fs'); // 使用 fs 模块的异步操作作为示例  

        const asyncHook = async_hooks.createHook({
            init(asyncId, type, triggerAsyncId, resource) {
                // const eid = async_hooks.executionAsyncId();
                // fs.writeSync(1, `${type}(${asyncId}): trigger: ${triggerAsyncId} execution: ${eid}\n`);
            },
            before(asyncId) {
                // console.log(`before ${asyncId}`);

                CommonUtils.ids.push(asyncId);
                if (CommonUtils.ids.length > CommonUtils.len) {
                    console.log('too many promise', CommonUtils.ids.length);
                    // errStackLog('too many promise')
                }
            },
            after(asyncId) {
                CommonUtils.delInArray(CommonUtils.ids, asyncId);
                // console.log(`after ${asyncId}`);
            },
            destroy(asyncId) {
                // console.log(`destroy ${asyncId}`);
            }
        });

        if (isDebug) {
            asyncHook.enable(); // 启用异步钩子
        }
    }


    // 通知到其他所有进程，当前进程除外
    public static async rpcToOtherServers(eventName: RpcEvent, param?: number, param2?: number) {
        let servers = app.serversConfig;
        for (let serverType in servers) {
            logServerEx(`rpc to other servers, ${serverType}`);
            for (let serverInfo of servers[serverType]) {
                if (serverInfo.serverName == app.serverInfo.serverName)
                    continue;

                app.rpc(serverInfo.serverName, eventName, param, param2)
            };
        }
    }

    // public static async rpcToOtherLogicGm_fromLogic(gmType: GMType, param?: number, param2?: number) {
    //     let servers = app.serversConfig;
    //     let logicServers = servers['logic'];
    //     for (let serverInfo of logicServers) {
    //         if (serverInfo.serverName == app.serverInfo.serverName)
    //             continue;

    //         logServerEx(`rpc to other logic gm, to ${serverInfo.serverName}`);
    //         app.rpc(serverInfo.serverName, RpcEvent.GMTest_logic2logic, gmType, param, param2);
    //     };
    // }

    public static convertToReward(data: number[], bindFlag: number = 1): number[] {
        // 增加绑定字段，1绑定，0不绑定，默认或不填则为1
        let res = this.deepClone(data);
        if (res.length < 3) {
            res[2] = bindFlag;
        }
        return res;
    }

    public static async execCmd(cmd: string, tip: string = ''): Promise<{ bSuc: boolean, res: any }> {
        let exec = require('child_process').exec;
        let bSuc = false;
        let res = '';
        let promis = new Promise((resolve, reject) => {
            exec(cmd, (error, stdout, stderr) => {
                // 获取命令执行的输出
                let tmp = ` exec cmd 1.1:${cmd}, ${tip}`;
                let txt = DateUtils.formatFullTimeByNow() + tmp + "\n" + stdout + "\n" + error + "\n" + stderr;
                if (error)
                    logServerEx(txt);
                bSuc = !error;
                res = bSuc ? stdout : stderr;
                resolve(null);
            });
        });
        await promis;
        return { bSuc, res };
    }

    public static checkCreateDir(dirPath: string) {
        // 检查目录是否存在  
        if (fs.existsSync(dirPath))
            return;

        fs.mkdirSync(dirPath);
    }

    public static findDuplicates<T>(datas: T[]): T[] {
        let records: T[] = [];
        let repeated: T[] = [];
        for (let data of datas) {
            if (records.indexOf(data) > -1)
                repeated.push(data);
            else
                records.push(data);
        }
        return repeated;
    }

    public static isArrayEqual<T>(a: T[], b: T[]): boolean {
        if (a.length != b.length)
            return false;

        for (let i = 0; i < a.length; i++) {
            if (a[i] != b[i])
                return false;
        }
        return true;
    }

    public static isArray2Equal<T>(a: T[][], b: T[][]): boolean {
        if (a.length != b.length)
            return false;

        for (let i = 0; i < a.length; i++) {
            if (!this.isArrayEqual(a[i], b[i]))
                return false;
        }
        return true;
    }
}


const ignoreFuncNameList = ['onUseSkill']
/**
 * 为本方法提供上锁功能，注意，需要方法的第二个参数为session，并且session有值
 * 即只能用于用户指令
 * @returns 
 */
export const lockExecutionAsync = () => {
    // 执行函数前先获取状态锁，如果获取到则修改状态，执行函数，然后恢复状态。如果未获取到则不执行函数直接返回。
    return function (
        target: Object,
        propertyKey: string | symbol,
        propertyDescriptor: PropertyDescriptor,
    ) {
        const originalFunc = propertyDescriptor.value;

        // 修改原有function的定义
        propertyDescriptor.value = async function (...args: any[]) {
            let lockInst = LockModelLogic.Instance;
            let session = args[1]
            let roleUid = session.uid;
            let lock = lockInst.getLock(roleUid);
            if (lock) {
                let lockName = lockInst.getLockFuncName(roleUid);
                if (!ignoreFuncNameList.includes(lockName))
                    logServerEx(`玩家锁中，未执行函数:${this.constructor.name}.${originalFunc.name},lockFuncName:${lockName} param:${args}, role:${roleUid}`)
                return;//此玩家此方法已上锁，直接跳出
            }
            lockInst.setLock(roleUid, true, originalFunc.name);

            let results;
            try {
                results = await originalFunc.apply(this, args);
            } catch (err) {
                let tip = `函数执行报错，函数:${this.constructor.name}.${originalFunc.name}, param:${JSON.stringify(args)}, role:${roleUid} ,msg:${err?.message},track:${err?.stack}}`;
                logServerEx(tip);
                // errStackLog(tip);
            } finally {
                lockInst.setLock(roleUid, false)
            }
            return results;
        };
        return propertyDescriptor;
    };
};

/**
 * 为本方法提供上锁功能，注意，需要方法的第一个参数为roleUid
 * 即只能用于用户指令
 * @returns 
 */
export const lockExecutionAsync_Param1 = () => {
    // 执行函数前先获取状态锁，如果获取到则修改状态，执行函数，然后恢复状态。如果未获取到则不执行函数直接返回。
    return function (
        target: Object,
        propertyKey: string | symbol,
        propertyDescriptor: PropertyDescriptor,
    ) {
        const originalFunc = propertyDescriptor.value;

        // 修改原有function的定义
        propertyDescriptor.value = async function (...args: any[]) {
            let lockInst = LockModelLogic.Instance;
            let roleUid = args[0]
            let lock = lockInst.getLock(roleUid);
            if (lock) {
                let lockName = lockInst.getLockFuncName(roleUid);
                if (!ignoreFuncNameList.includes(lockName))
                    logServerEx(`玩家锁中，未执行函数:${this.constructor.name}.${originalFunc.name},lockFuncName:${lockName} param:${args}, role:${roleUid}`)
                return;//此玩家此方法已上锁，直接跳出
            }
            lockInst.setLock(roleUid, true, originalFunc.name);

            const results = await originalFunc.apply(this, args);
            lockInst.setLock(roleUid, false)
            return results;
        };
        return propertyDescriptor;
    };
};

/**
 * 为本方法提供上锁功能，注意，需要方法的第二个参数为roleUid
 * 即只能用于用户指令
 * @returns 
 */
export const lockExecutionAsync_Param2 = () => {
    // 执行函数前先获取状态锁，如果获取到则修改状态，执行函数，然后恢复状态。如果未获取到则不执行函数直接返回。
    return function (
        target: Object,
        propertyKey: string | symbol,
        propertyDescriptor: PropertyDescriptor,
    ) {
        const originalFunc = propertyDescriptor.value;

        // 修改原有function的定义
        propertyDescriptor.value = async function (...args: any[]) {
            let lockInst = LockModelLogic.Instance;
            let roleUid = args[1]
            let lock = lockInst.getLock(roleUid);
            if (lock) {
                let lockName = lockInst.getLockFuncName(roleUid);
                if (!ignoreFuncNameList.includes(lockName))
                    logServerEx(`玩家锁中，未执行函数:${this.constructor.name}.${originalFunc.name},lockFuncName:${lockName} param:${args}, role:${roleUid}`)
                return;//此玩家此方法已上锁，直接跳出
            }
            lockInst.setLock(roleUid, true, originalFunc.name);

            const results = await originalFunc.apply(this, args);
            lockInst.setLock(roleUid, false)
            return results;
        };
        return propertyDescriptor;
    };
};

/**
 * 为本方法提供上锁功能，注意，需要方法的第三个参数为roleUid
 * 即只能用于用户指令
 * @returns 
 */
export const lockExecutionAsync_Param3 = () => {
    // 执行函数前先获取状态锁，如果获取到则修改状态，执行函数，然后恢复状态。如果未获取到则不执行函数直接返回。
    return function (
        target: Object,
        propertyKey: string | symbol,
        propertyDescriptor: PropertyDescriptor,
    ) {
        const originalFunc = propertyDescriptor.value;

        // 修改原有function的定义
        propertyDescriptor.value = async function (...args: any[]) {
            let lockInst = LockModelLogic.Instance;
            let roleUid = args[2]
            let lock = lockInst.getLock(roleUid);
            if (lock) {
                let lockName = lockInst.getLockFuncName(roleUid);
                if (!ignoreFuncNameList.includes(lockName))
                    logServerEx(`玩家锁中，未执行函数:${this.constructor.name}.${originalFunc.name},lockFuncName:${lockName} param:${args}, role:${roleUid}`)
                return;//此玩家此方法已上锁，直接跳出
            }
            lockInst.setLock(roleUid, true, originalFunc.name);

            const results = await originalFunc.apply(this, args);
            lockInst.setLock(roleUid, false)
            return results;
        };
        return propertyDescriptor;
    };
};

/**
 * 在规定时间内最多只能执行一次
 * @returns 
 */
export const limitExec = function (wait: number = 60 * 1000): MethodDecorator {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        const originalMethod = descriptor.value;

        descriptor.value = function (...args: any[]) {
            const now = Date.now();
            if (!this[propertyKey].lastCalled || (now - this[propertyKey].lastCalled > wait)) {
                this[propertyKey].lastCalled = now;
                return originalMethod.apply(this, args);
            }
            // 可选：可以添加日志或返回一个默认值  
            console.log(`limit exec: ${propertyKey} is being throttled... ${now - this[propertyKey].lastCalled} ms`);
        };

        // 需要在类的实例上保存lastCalled属性，因此通过原型链添加  
        if (!target.hasOwnProperty('lastCalled')) {
            Object.defineProperty(target, 'lastCalled', {
                value: 0,
                writable: true,
                enumerable: false,
                configurable: true
            });
        }
    };
}

/**
 * 在规定时间内最多只能执行一次
 * @returns 
 */
export const limitRoleExec = function (wait: number = 1 * 1000): MethodDecorator {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        const originalMethod = descriptor.value;

        // 需要在类的实例上保存lastCalled属性，因此通过原型链添加  
        if (!target.hasOwnProperty('lastCalledList')) {
            Object.defineProperty(target, 'lastCalledList', {
                value: {},
                writable: true,
                enumerable: false,
                configurable: true
            });
        }

        descriptor.value = function (...args: any[]) {
            let session = args[1]
            let roleUid = session.uid;
            const now = Date.now();
            if (!this[propertyKey].lastCalledList)
                this[propertyKey].lastCalledList = {};
            if (!this[propertyKey].lastCalledList[roleUid] || (now - this[propertyKey].lastCalledList[roleUid] >= wait)) {
                this[propertyKey].lastCalledList[roleUid] = now;
                return originalMethod.apply(this, args);
            }
            // 可选：可以添加日志或返回一个默认值  
            console.log(`limit role exec: ${propertyKey}.${roleUid} is being throttled... ${now - this[propertyKey].lastCalledList[roleUid]} ms`);
        };
    };
}

/**
 * 为本方法提供上锁功能，注意，需要方法的第一个参数为roleUid；同时限制在规定时间内最多只能执行一次
 * 即只能用于用户指令
 * @returns 
 */
export const lockExecutionAsync_LimitRoleExec = (wait: number = 1 * 1000) => {
    // 执行函数前先获取状态锁，如果获取到则修改状态，执行函数，然后恢复状态。如果未获取到则不执行函数直接返回。
    return function (
        target: Object,
        propertyKey: string,
        propertyDescriptor: PropertyDescriptor,
    ) {
        const originalFunc = propertyDescriptor.value;

        // 需要在类的实例上保存lastCalled属性，因此通过原型链添加  
        if (!target.hasOwnProperty('lastCalled2')) {
            Object.defineProperty(target, 'lastCalled2', {
                value: {},
                writable: true,
                enumerable: false,
                configurable: true
            });
        }

        propertyDescriptor.value = async function (...args: any[]) {
            let session = args[1]
            let roleUid = session.uid;
            const now = Date.now();
            if (!this[propertyKey].lastCalled2)
                this[propertyKey].lastCalled2 = {};
            if (!this[propertyKey].lastCalled2[roleUid] || (now - this[propertyKey].lastCalled2[roleUid] >= wait)) {
                this[propertyKey].lastCalled2[roleUid] = now;

                let lockInst = LockModelLogic.Instance;
                let lock = lockInst.getLock(roleUid);
                if (lock) {
                    let lockName = lockInst.getLockFuncName(roleUid);
                    if (!ignoreFuncNameList.includes(lockName))
                        logServerEx(`玩家锁中，未执行函数:${this.constructor.name}.${originalFunc.name},lockFuncName:${lockName} param:${args}, role:${roleUid}`)
                    return;//此玩家此方法已上锁，直接跳出
                }
                lockInst.setLock(roleUid, true, originalFunc.name);

                let results;
                try {
                    results = await originalFunc.apply(this, args);
                } catch (err) {
                    let tip = `函数执行报错，函数:${this.constructor.name}.${originalFunc.name}, param:${JSON.stringify(args)}, role:${roleUid} ,msg:${err?.message},track:${err?.stack}}`;
                    logServerEx(tip);
                    // errStackLog(tip);
                } finally {
                    lockInst.setLock(roleUid, false)
                }
                return results;
            }
            // 可选：可以添加日志或返回一个默认值  
            console.log(`lock and limit role exec: ${propertyKey}.${roleUid} is being throttled... ${now - this[propertyKey].lastCalled2[roleUid]} ms`);
        };
    };
};
