import mongoose from "mongoose";
import { app } from "../app";
import { Sigleton } from "../core/Sigleton";


export class DataBase extends Sigleton {

    // 是否已初始化数据库
    public initDataBase: boolean = false;
    public static get Instance(): DataBase {
        return this.getInstance();
    }

    public initInstance() {
    }

    public destoryInstance() {
    }

    public db: mongoose.Mongoose;

    public async init() {
        //TODO请下方已英文字母来排序，不然会强迫症
        return new Promise((resolve, reject) => {

            const options = {
                autoIndex: true,
                // autoReconnect: true,
                maxPoolSize: 1000,
                minPoolSize: 1,
            }
            //多个数据库连接的处理办法
            // let connection2 = mongoose.createConnection("mongodb://127.0.0.1:27017/LordDB", options);
            // connection2.asPromise().then(async (db) => {
            //     AssetTable.Instance.init(db as any);
            // console.log("wwwww");
            //    let a = await AssetTable.Instance.findOne({roleUid:102905519198341,uid:102905602625669});
            //    console.log(a);
            // });

            mongoose.connect(app.zoneConfig.mongodb_connectstring, options).then(async (db) => {
                console.log(app.serverType, app.serverName, "连接数据库成功");
                try {
                    DataBase.Instance.db = db;
                    //建立索引 


                    // UnionWarTable.Instance.init(db);
                    // UnionWarSeasonTable.Instance.init(db);
                    // UnionWarRuntimeRankDataTable.Instance.init(db);
                    // UnionWarRuntimeCapturedDataTable.Instance.init(db);
                    // UnionWarRoleTable.Instance.init(db);
                    // UnionWarReportDataTable.Instance.init(db);
                    // UnionWarRankUnionDataTable.Instance.init(db);
                    // UnionWarRankPersonalDataTable.Instance.init(db);

                    // await ServerSettingTable.Instance.init(db);


                    resolve(null)
                    DataBase.Instance.initDataBase = true;

                } catch (error) {
                    console.error("init db", error);
                }
            }).catch((err) => {
                console.error("数据库链接失败", err);
                reject(null)
            })

            //ff代表assetAll  m代表mail e代表精灵 ，asset 和 m 是唯二达到1G以上的表
            // ff 1056  m 1435 e 1478--50条
            // ff 1005 m909 e831---100条
            // ff 1063 m1458 e1500 --单线程
            // ff 1073 m1434 e843  --100条
            // 1075 1433 1061 ---100条
            // 1094 e1485 m1331 --100条
            // 1041 e1459 m1500--单线程
            // 1181 1500 981--100条
            // 1207 1500，1218-95条
            // 1061 1500，1100 --
            // 1034 1469 1500  单线程
            // 1099 1390 1395  10线程
            // 1217 1481 1474  50线程
            // 1206 1500 826    96线程

            //增加链接数，在正常游戏运行时应该会有较大的提升大概30%，但是对于单表的并发查询，提升较少，大概10%
            // for (let i = 0; i < 98; i++) {
            //     let func = async () => {
            //         let con = mongoose.createConnection(app.zoneConfig.mongodb_connectstring, options);
            //         con.asPromise().then(() => {
            //             try {
            //                 console.log("start", i);
            //                 AssetTable.Instance.init(con);
            //                 ElfTable.Instance.init(con);
            //                 MailTable.Instance.init(con);
            //             } catch (error) {
            //                 console.log("error", error);
            //             }
            //         });
            //     }
            //     func();

            // }

        });
    }

}