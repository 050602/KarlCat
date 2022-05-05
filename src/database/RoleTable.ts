import mongoose, { Mongoose } from "mongoose";

export interface RoleType {
    _id: Number,//角色ID
    userId: Number,//用户ID
    level: Number,//橘色等级
    rank: Number,//角色阶级
    nickName: String,//角色昵称
}

export default class RoleTable {

    private static tableName = "RoleTable";
    private static table: mongoose.Model<any, {}, {}>;
    public static init(db: mongoose.Mongoose) {
        RoleTable.table = db.model(RoleTable.tableName, new mongoose.Schema({
            _id: Number,//角色ID
            userId: Number,//用户ID
            level: Number,//橘色等级
            rank: Number,//角色阶级
            nickName: String,//角色昵称
        }));
    }
    public static async insert(data: RoleType) {
        await RoleTable.table.create(data).then(() => {
            console.log("数据插入成功");
        }).catch((err) => {
            console.log("数据插入失败:", err, data);
        });
    }

    public static async find(myid: Number): Promise<RoleType> {
        let data: RoleType = null;
        await RoleTable.table.findById(myid).then((value) => {
            console.log("查找成功", value);
            data = value;
        }).catch((err) => {
            console.log("查询失败:", err, myid);
        });

        return data;
    }

    public static async findAll(myUserid: Number): Promise<RoleType[]> {
        let data: RoleType[] = [];
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
    public static async update(myid: Number, data: any) {
        await RoleTable.table.updateOne({ _id: myid }, data).then((value) => {
            console.log("更新成功", myid);
        }).catch((err) => {
            console.log("更新失败:", err, myid);
        });
    }

    public static async delete(myid: Number) {
        await RoleTable.table.deleteOne({ _id: myid }).then(() => {
            console.log("删除成功", myid);
        }).catch((err) => {
            console.log("删除失败:", err, myid);
        });
    }
} 