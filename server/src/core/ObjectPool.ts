import { isDebug } from "../app";
import { IObjectPool } from "./IObjectPool";

/**
 * @Doc 对象池
 * @Author kL
 * @Date 2022/5/20 13:45
 */
export class ObjectPool {
    private static _pool: Map<string, IObjectPool[]> = new Map<string, IObjectPool[]>();

    /**
     * 从对象池中取出
     * @param type 类型
     */
    public static get<T extends IObjectPool>(type: (new () => T), ifEmptyReturnNull: boolean = false): T {
        let array = this._pool.get(type.name);
        if (array == null || array.length == 0) {
            if (ifEmptyReturnNull) {
                return null;
            } else {
                let newC = new type();
                return newC;
            }
        }

        let obj: T = array.pop() as T;
        if (obj.inPool) {
            obj.inPool = false;
            return obj;
        } else {
            console.error("一个还在池外的对象，被推入过对象池");
            let newC = new type();
            return newC;
        }
    }


    /**
     * 回收
     * @param object 对象
     */
    public static recycle(object: IObjectPool) {
        if (object == null)
            return;

        // @ts-ignore
        let className = object.__proto__.constructor.name;
        if (object.inPool && isDebug) {
            console.error("存在二次回收的对象", className,);
            return;
        }


        object.onRecycled();
        let array: IObjectPool[] = this._pool.get(className);
        if (array == null) {
            array = [];
            this._pool.set(className, array);
        }
        array.push(object);//停用对象池
        object.inPool = true;
    }


    public static clear() {
        this._pool.clear();
    }
}