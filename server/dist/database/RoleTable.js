"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
class RoleTable {
    static init(db) {
        RoleTable.table = db.model(RoleTable.tableName, new mongoose_1.default.Schema({
            _id: Number,
            userId: Number,
            level: Number,
            rank: Number,
            nickName: String, //角色昵称
        }));
    }
    static async insert(data) {
        await RoleTable.table.create(data).then(() => {
            console.log("数据插入成功");
        }).catch((err) => {
            console.log("数据插入失败:", err, data);
        });
    }
    static async find(myid) {
        let data = null;
        await RoleTable.table.findById(myid).then((value) => {
            console.log("查找成功", value);
            data = value;
        }).catch((err) => {
            console.log("查询失败:", err, myid);
        });
        return data;
    }
    static async findAll(myUserid) {
        let data = [];
        await RoleTable.table.find({ userId: myUserid }).then((value) => {
            console.log("查找成功", myUserid, typeof myUserid, value);
            data = value;
        }).catch((err) => {
            console.log("查询失败:", myUserid, err);
        });
        return data;
    }
    /**
     *
     * @param myid
     * @param data 更新部分的数据
     * @returns
     */
    static async update(myid, data) {
        await RoleTable.table.updateOne({ _id: myid }, data).then((value) => {
            console.log("更新成功", myid);
        }).catch((err) => {
            console.log("更新失败:", err, myid);
        });
    }
    static async delete(myid) {
        await RoleTable.table.deleteOne({ _id: myid }).then(() => {
            console.log("删除成功", myid);
        }).catch((err) => {
            console.log("删除失败:", err, myid);
        });
    }
}
exports.default = RoleTable;
RoleTable.tableName = "RoleTable";
//# sourceMappingURL=RoleTable.js.map