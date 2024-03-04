"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataBaseHotReload = void 0;
const Sigleton_1 = require("../core/Sigleton");
const DataBase_1 = require("./DataBase");
//本类用于线上运行时，需要 插入新数据库表/更新表对象结构 时使用
class DataBaseHotReload extends Sigleton_1.Sigleton {
    static get Instance() {
        return this.getInstance();
    }
    initInstance() {
        let db = DataBase_1.DataBase.Instance.db;
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
    destoryInstance() {
    }
}
exports.DataBaseHotReload = DataBaseHotReload;
//# sourceMappingURL=DataBaseHotReload.js.map