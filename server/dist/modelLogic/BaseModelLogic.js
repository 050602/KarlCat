"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseModelLogic = void 0;
const app_1 = require("../app");
const Sigleton_1 = require("../core/Sigleton");
class BaseModelLogic extends Sigleton_1.Sigleton {
    //当实例初始化时
    initInstance() {
        let name = this.clsName;
        app_1.app.ModelLogicMap.set(name, this);
    }
    ;
}
exports.BaseModelLogic = BaseModelLogic;
//# sourceMappingURL=BaseModelLogic.js.map