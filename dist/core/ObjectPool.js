"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectPool = void 0;
/**
 * @Doc 对象池
 * @Author kL
 * @Date 2022/5/20 13:45
 */
class ObjectPool {
    // private static _pool2: Map<string, any[]> = new Map<string, any[]>();
    /**
     * 从对象池中取出
     * @param type 类型
     */
    static get(type, ifEmptyReturnNull = false) {
        // console.log("对象池 get()", type.name);
        let array = this._pool.get(type.name);
        if (array == null || array.length == 0) {
            return ifEmptyReturnNull ? null : new type();
        }
        return array.pop();
    }
    // /**
    //  * 从对象池中取出（Any用）
    //  * @param type 类型
    //  */
    // public static get2<T>(type: (new () => T)): T {
    //     let array = this._pool2.get(type.name);
    //     if (array == null || array.length == 0) {
    //         return new type();
    //     }
    //     return array.pop();
    // }
    /**
     * 回收
     * @param object 对象
     */
    static recycle(object) {
        if (!object)
            return;
        // @ts-ignore
        let className = object.__proto__.constructor.name;
        object.onRecycled();
        let array = this._pool.get(className);
        if (array == null) {
            array = [];
            this._pool.set(className, array);
        }
        array.push(object);
        // console.log("对象池 recycle()", className);
    }
    // /**
    //  * 回收（Any用）
    //  * @param object 对象
    //  */
    // public static recycle2(object: any) {
    //     // @ts-ignore
    //     let className = object.__proto__.constructor.name;
    //     let array: IObjectPool[] = this._pool.get(className);
    //     if (array == null) {
    //         array = [];
    //         this._pool.set(className, array);
    //     }
    //     array.push(object);
    //
    //     // console.log("对象池 recycle()", className);
    // }
    static clear() {
        this._pool.clear();
    }
}
exports.ObjectPool = ObjectPool;
ObjectPool._pool = new Map();
//# sourceMappingURL=ObjectPool.js.map