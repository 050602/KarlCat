"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonUtils = void 0;
class CommonUtils {
    /**
     * 深度复制
     * @param object
     */
    static deepClone(object) {
        if (object instanceof Array) {
            let array = [];
            let len = object.length;
            for (let n = 0; n < len; n++) {
                array.push(this.deepClone(object[n]));
            }
            return array;
        }
        else if (object instanceof Object) {
            let obj = {};
            for (let fieldKey in object) {
                if (object.hasOwnProperty(fieldKey)) {
                    obj[fieldKey] = this.deepClone(object[fieldKey]);
                }
            }
            return obj;
        }
        else {
            return object;
        }
    }
    /**
     * 属性克隆
     * @param parasitifer 宿主
     * @param obj 属性来源
     */
    static propertyClone(parasitifer, obj) {
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                parasitifer[key] = obj[key];
            }
        }
    }
    static async sleep(ms) {
        return new Promise((resolve, rejcet) => {
            setTimeout(() => {
                resolve(null);
            }, ms);
        });
    }
    static delInArray(arr, value) {
        let idx = arr.indexOf(value);
        if (idx < 0) {
            return false;
        }
        let del = arr.splice(idx, 1);
        return true;
    }
    static inArray(arr, value) {
        let idx = arr.indexOf(value);
        return idx >= 0;
    }
    static inMap(map, key) {
        let val = map.get(key);
        let flag = val !== undefined;
        return flag;
    }
    static inArrays(arr1, arr2, value) {
        return CommonUtils.inArray(arr1, value) || CommonUtils.inArray(arr2, value);
    }
    static getKeys(map) {
        let res = [];
        for (let k of map.keys())
            res.push(k);
        return res;
    }
}
exports.CommonUtils = CommonUtils;
//# sourceMappingURL=CommonUtils.js.map