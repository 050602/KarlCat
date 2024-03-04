"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
class LoginTable {
    static init(db) {
        LoginTable.table = db.model(LoginTable.tableName, new mongoose_1.default.Schema({
            userName: String,
            password: String,
            nickName: String,
            roleList: [Number],
            _id: Number
        }));
    }
    static async insert(data) {
        await LoginTable.table.create(data).then(() => {
            console.log("数据插入成功");
        }).catch((err) => {
            console.log("数据插入失败:", err, data);
        });
    }
    static async find(myid) {
        let data = null;
        await LoginTable.table.findOne({ userName: myid }).then((value) => {
            console.log("查找成功", value);
            data = value;
        }).catch((err) => {
            console.log("查询失败:", err, myid);
        });
        return data;
    }
    /**
     *
     * @param myid
     * @param data 更新部分的数据
     * @returns
     */
    static async update(username, data) {
        await LoginTable.table.updateOne({ userName: username }, data).then((value) => {
            console.log("更新成功", username);
        }).catch((err) => {
            console.log("更新失败:", err, username);
        });
    }
    static async delete(username) {
        await LoginTable.table.deleteOne({ userName: username }).then(() => {
            console.log("删除成功", username);
        }).catch((err) => {
            console.log("删除失败:", err, username);
        });
    }
}
exports.default = LoginTable;
LoginTable.tableName = "LoginTable";
//# sourceMappingURL=LoginTable.js.map