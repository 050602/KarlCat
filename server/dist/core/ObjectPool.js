"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectPool = void 0;
const app_1 = require("../app");
/**
 * @Doc 对象池
 * @Author kL
 * @Date 2022/5/20 13:45
 */
class ObjectPool {
    /**
     * 从对象池中取出
     * @param type 类型
     */
    static get(type, ifEmptyReturnNull = false) {
        let array = this._pool.get(type.name);
        if (array == null || array.length == 0) {
            if (ifEmptyReturnNull) {
                return null;
            }
            else {
                let newC = new type();
                return newC;
            }
        }
        let obj = array.pop();
        if (obj.inPool) {
            obj.inPool = false;
            return obj;
        }
        else {
            console.error("一个还在池外的对象，被推入过对象池");
            let newC = new type();
            return newC;
        }
    }
    /**
     * 回收
     * @param object 对象
     */
    static recycle(object) {
        if (object == null)
            return;
        // @ts-ignore
        let className = object.__proto__.constructor.name;
        if (object.inPool && app_1.isDebug) {
            console.error("存在二次回收的对象", className);
            return;
        }
        object.onRecycled();
        let array = this._pool.get(className);
        if (array == null) {
            array = [];
            this._pool.set(className, array);
        }
        array.push(object); //停用对象池
        object.inPool = true;
    }
    static clear() {
        this._pool.clear();
    }
}
exports.ObjectPool = ObjectPool;
ObjectPool._pool = new Map();
//# sourceMappingURL=ObjectPool.js.map