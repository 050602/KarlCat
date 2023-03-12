"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketState = void 0;
const app_1 = require("../app");
const BaseServerLogic_1 = require("../components/BaseServerLogic");
class SocketState extends BaseServerLogic_1.BaseServerLogic {
    constructor() {
        super(...arguments);
        this.openClientSocket = app_1.isDebug ? true : false;
    }
    static get Instance() {
        return super.getInstance(SocketState);
    }
}
exports.SocketState = SocketState;
SocketState.SigletonInsName = "SocketState";
//# sourceMappingURL=SocketState.js.map