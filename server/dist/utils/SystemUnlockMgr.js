"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemUnlockMgr = void 0;
/**
 * @Doc 系统解锁管理器
 * @Author kL
 * @Date 2022/12/8 15:38
 */
const Sigleton_1 = require("../core/Sigleton");
const ConfigMgr_1 = require("../config/ConfigMgr");
const UnlockCondType_1 = require("../config/UnlockCondType");
class SystemUnlockMgr extends Sigleton_1.Sigleton {
    static get Instance() {
        return this.getInstance();
    }
    /**
     * 判断系统解锁条件是否达成
     * @param system
     * @param ifLockThenTips 如果未解锁则弹出提示
     */
    checkSystemUnlockCondition(roleData, system) {
        let result = true;
        let config = ConfigMgr_1.ConfigMgr.Instance.GameSystemConfig.get(system, true);
        if (!config.open) {
            return false;
        }
        if (!roleData)
            return false;
        let conditionTypes = config?.unlockConditionType;
        if (Array.isArray(conditionTypes)) {
            conditionTypes.forEach((condType, idx) => {
                let param = config.unlockConditionParams[idx];
                switch (condType) {
                    case UnlockCondType_1.UnlockCondType.Level: {
                        let needLv = param;
                        if (roleData.level < needLv)
                            result = false;
                        break;
                    }
                    default: {
                        break;
                    }
                }
            });
        }
        return result;
    }
}
exports.SystemUnlockMgr = SystemUnlockMgr;
//# sourceMappingURL=SystemUnlockMgr.js.map