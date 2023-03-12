"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Sigleton_1 = require("../core/Sigleton");
const LoginTable_1 = __importDefault(require("./LoginTable"));
const RoleTable_1 = __importDefault(require("./RoleTable"));
class DataBase extends Sigleton_1.Sigleton {
    constructor() {
        super(...arguments);
        this.DBIsReady = false;
    }
    static get Instance() {
        return super.getInstance(DataBase);
    }
    initInstance() {
    }
    destoryInstance() {
    }
    async init() {
        let thisobject = this;
        return new Promise((resolve, reject) => {
            mongoose_1.default.connect("mongodb://127.0.0.1:27017/LordDB").then((db) => {
                console.log("连接数据库成功");
                thisobject.db = db;
                LoginTable_1.default.init(db);
                RoleTable_1.default.init(db);
                resolve(null);
            }).catch((err) => {
                console.log("数据库链接失败", err);
                reject(null);
            });
        });
    }
}
exports.default = DataBase;
DataBase.SigletonInsName = "DataBase";
//# sourceMappingURL=DataBase.js.map