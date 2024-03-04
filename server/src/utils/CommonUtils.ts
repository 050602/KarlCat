
export class CommonUtils {


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


    public static delInArray<T>(arr: T[], value: T): boolean {
        let idx = arr.indexOf(value);
        if (idx < 0) {
            return false;
        }
        let del = arr.splice(idx, 1);
        return true;
    }

    public static inArray<T>(arr: T[], value: T): boolean {
        let idx = arr.indexOf(value);
        return idx >= 0;
    }

    public static inMap<T>(map: Map<T, any>, key: T): boolean {
        let val = map.get(key);
        let flag = val !== undefined;
        return flag;
    }

    public static inArrays<T>(arr1: T[], arr2: T[], value: T): boolean {
        return CommonUtils.inArray(arr1, value) || CommonUtils.inArray(arr2, value);
    }

    public static getKeys<T>(map: Map<T, any>): T[] {
        let res: T[] = [];
        for (let k of map.keys())
            res.push(k);
        return res;
    }
}


