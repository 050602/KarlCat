import { Sigleton } from "../core/Sigleton";
import { DataBase } from "./DataBase";


//本类用于线上运行时，需要 插入新数据库表/更新表对象结构 时使用
export class DataBaseHotReload extends Sigleton {
    public static get Instance(): DataBaseHotReload {
        return this.getInstance();
    }

    public initInstance() {
        let db = DataBase.Instance.db;
        if (!db) {
            let str = "db不存在，热插入失败";
            console.error(str);
            return;
        }

        //===========请在以下写数据库表插入================

        //example
        // AbyssLevelTable.Instance.init(db);

        //===========请在以上写数据库表插入================
        console.log("执行热插入完毕");
    }

    public destoryInstance() {
    }

}