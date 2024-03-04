import { app } from "../app";
import { Sigleton } from "../core/Sigleton";

export abstract class BaseModelLogic extends Sigleton {
  /**
   * 有使用LRUCache的Model 需要注意在角色退出登录时，对Cache进行清理
   * @param roleUid 
   */
  public abstract deleteCache(roleUid: number): void;
  /**
 * 有使用LRUCache的Model 需要注意定期刷新Cache 避免被TTL清理掉
 * @param roleUid 
 */
  public abstract cacheRefresh(roleUid: number): void;

  //当实例初始化时
  public initInstance() {
    let name = this.clsName;
    app.ModelLogicMap.set(name, this);
  };

  // protected static getInstance(T: any) {
  // let ins = app.InstanceMap.get(T.SigletonInsName);
  // if (!ins) {
  //   ins = new T();
  //   app.InstanceMap.set(T.SigletonInsName, ins);
  //   app.ModelLogicMap.set(T.SigletonInsName, ins);
  //   ins.initInstance();
  // }
  // return ins;
  // }
}