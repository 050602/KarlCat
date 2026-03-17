import { app } from "../app";
import { hotScriptPath } from "../const/PathConst";
import { Sigleton } from "../core/Sigleton";
import { BaseModel } from "../model/BaseModel";
import { CommonUtils } from "../utils/CommonUtils";
import { TTLBaseCache } from "../utils/TTLBaseCache";
import { TTLCache } from "../utils/TTLCache";

export abstract class BaseModelLogic extends Sigleton {
  // 当实例初始化时
  public initInstance() {
    let name = this.clsName;
    app.ModelLogicMap.set(name, this);
  }

  // 子类覆盖：初始化数据（当数据库中不存在时）
  protected async initModelData(uid: number): Promise<any> {
    return null;
  }

  // 删除缓存
  public deleteCache(roleUid: number): void {
    let modelCache: TTLBaseCache<number, any> = this.getModelCache();
    if (!modelCache)
      return;

    if (modelCache.has(roleUid))
      modelCache.delete(roleUid);
  }

  // 刷新缓存
  public cacheRefresh(roleUid: number): void {
    let modelCache: TTLBaseCache<number, any> = this.getModelCache();
    if (!modelCache)
      return;

    this.refreshAndReturn(roleUid);
  }

  // 登录时获取缓存数据
  public async getCacheDataFromLogin(roleUid: number): Promise<any> {
    console.log(`${this.clsName} 登录打印出现2次请通知`);
    this.deleteCache(roleUid);
    return await this.refreshAndReturn(roleUid);
  }

  // 缓存未命中时的 fetch 方法（请注意，要热更此方法，请调用TTLCache里的updateFetchMethod方法）
  public async fetchData(key: number, context: any) {
    let data = await context.getModelData(key);
    return data;
  }

  // 从db获取数据，刷新缓存并返回
  public async refreshAndReturn(uid: number): Promise<any> {
    let modelCls: BaseModel = this.getModelCls();
    let data = await modelCls.modelCache.fetch(uid);
    if (!data) {
      modelCls.modelCache.delete(uid);
    }
    return data;
  }

  // 获取数据（缓存未命中时从DB加载或初始化）
  public async getModelData(uid: number): Promise<any> {
    let modelCls: BaseModel = this.getModelCls();
    let data: any = await modelCls.findOne({ roleUid: uid });
    if (!data) {
      let initData = await this.initModelData(uid);
      CommonUtils.assertEx(initData, `${this.clsName} 初始化数据失败`);
      data = await modelCls.insertOne(initData);
    }
    return data;
  }

  // 获取对应的 Model 实例
  protected getModelCls(): BaseModel {
    let modelName = this.clsName.replace("ModelLogic", "Model");
    let modelCls: BaseModel = app.InstanceMap.get(modelName);
    if (!modelCls) {
      try {
        let path = `${hotScriptPath}//model//${modelName}.js`;
        const moudle = require(path);
        let sigleton: Sigleton = moudle[modelName].Instance;
        if (sigleton) {
          sigleton.onHotReload();
        }
        modelCls = app.InstanceMap.get(modelName);
        CommonUtils.assertEx(modelCls, `${modelName} 单例未找到，需要先实例化该类,${app.serverName}`);
      } catch (error) {
        console.error("error:", error);
      }
    }
    return modelCls;
  }

  // 获取 Model 的缓存实例
  protected getModelCache(): TTLCache<number, any> {
    let modelCls: BaseModel = this.getModelCls();
    return modelCls.modelCache;
  }
}