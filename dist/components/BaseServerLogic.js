"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseServerLogic = void 0;
const Sigleton_1 = require("../core/Sigleton");
class BaseServerLogic extends Sigleton_1.Sigleton {
    constructor() {
        super(...arguments);
        this.lockMap = new Map();
    }
    getLock(roleUid) {
        let lock = this.lockMap.get(roleUid);
        if (lock == null) {
            return false;
        }
        return lock;
    }
    setLock(roleUid, bool) {
        this.lockMap.set(roleUid, bool);
    }
}
exports.BaseServerLogic = BaseServerLogic;
//# sourceMappingURL=BaseServerLogic.js.map