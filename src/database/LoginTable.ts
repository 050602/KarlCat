import mongoose, { Mongoose } from "mongoose";

export interface LoginType {
    userName: String,//用户名
    password: String,//MD5密码
    nickName: String,//昵称
    roleList: [Number],//角色列表
    _id: Number,//角色的ID
}

export default class LoginTable {

    private static tableName = "LoginTable";
    private static table: mongoose.Model<any, {}, {}>;
    public static init(db: mongoose.Mongoose) {
        LoginTable.table = db.model(LoginTable.tableName, new mongoose.Schema({
            userName: String,
            password: String,
            nickName: String,
            roleList: [Number],
            _id: Number
        }));
    }
    public static async insert(data: LoginType) {
        await LoginTable.table.create(data).then(() => {
            console.log("数据插入成功");
        }).catch((err) => {
            console.log("数据插入失败:", err, data);
        });
    }

    public static async find(myid: String): Promise<LoginType> {
        let data: LoginType = null;
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
    public static async update(username: String, data: any) {
        await LoginTable.table.updateOne({ userName: username }, data).then((value) => {
            console.log("更新成功", username);
        }).catch((err) => {
            console.log("更新失败:", err, username);
        });
    }

    public static async delete(username: String) {
        await LoginTable.table.deleteOne({ userName: username }).then(() => {
            console.log("删除成功", username);
        }).catch((err) => {
            console.log("删除失败:", err, username);
        });
    }
} 