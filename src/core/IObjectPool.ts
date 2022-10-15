/**
 * @Doc 对象池对象接口
 * @Author kL
 * @Date 2022/5/20 13:05
 */
export interface IObjectPool {
    onRecycled():void;
}