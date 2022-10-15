import mongoose from "mongoose";
import { Sigleton } from "../core/Sigleton";
import { gzaLog } from "../LogTS";
import LoginTable from "./LoginTable";
import RoleTable from "./RoleTable";

export default class DataBase extends Sigleton {

    public static SigletonInsName = "DataBase";
    public static get Instance(): DataBase {
        return super.getInstance(DataBase);
    }

    public initInstance() {
    }

    public destoryInstance() {
    }
    public DBIsReady = false;
    public db: mongoose.Mongoose;

    public async init() {
        let thisobject = this;
        return new Promise((resolve, reject) => {
            mongoose.connect("mongodb://127.0.0.1:27017/LordDB").then((db) => {
                console.log("连接数据库成功");
                thisobject.db = db;

                LoginTable.init(db);
                RoleTable.init(db);

                resolve(null);
            }).catch((err) => {
                gzaLog("数据库链接失败", err);
                reject(null)
            })
        });


    }



}