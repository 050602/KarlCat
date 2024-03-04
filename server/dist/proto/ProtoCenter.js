"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProtoCenter = void 0;
const Sigleton_1 = require("../core/Sigleton");
//该类不支持热更新啊啊啊啊
class ProtoCenter extends Sigleton_1.Sigleton {
    static get Instance() {
        return this.getInstance();
    }
    //当实例初始化时
    initInstance() {
        let file = require("./protobuf/proto.js");
        this.lanlu = file.lanluproto;
        // console.log("ProtoCenter initInstance Succ");
    }
    ;
    //当实例被销毁时
    destoryInstance() {
        this.lanlu = null;
    }
    ;
}
exports.ProtoCenter = ProtoCenter;
ProtoCenter.SigletonInsName = "ProtoCenter";
//# sourceMappingURL=ProtoCenter.js.map