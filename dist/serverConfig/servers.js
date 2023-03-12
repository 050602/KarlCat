"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serversConfig = void 0;
const route_1 = require("./route");
exports.serversConfig = {
    development: {
        //==========================================1服========================================
        [route_1.ServerName.logic]: [
            { "serverId": 1, "serverName": "logic-1", "host": "127.0.0.1", "port": 3101, "frontend": false, "clientPort": 3032, "platformName": "xxx", "platformId": 1 },
        ],
        [route_1.ServerName.gate]: [
            { "serverId": 1, "serverName": "gate-1", "host": "127.0.0.1", "port": 4101, "frontend": true, "clientPort": 4032, "platformName": "xxx", "platformId": 1 },
        ]
    },
    production: {
        //==========================================1服========================================
        //logic的端口理论上要跟gate的对应 -1000
        [route_1.ServerName.logic]: [
            { "serverId": 1, "serverName": "logic-1", "host": "127.0.0.1", "port": 3101, "frontend": false, "clientPort": 3032, "platformName": "xxx", "platformId": 1 },
        ],
        [route_1.ServerName.gate]: [
            { "serverId": 1, "serverName": "gate-1", "host": "127.0.0.1", "port": 4101, "frontend": true, "clientPort": 4032, "platformName": "xxx", "platformId": 1 },
        ],
    }
};
//# sourceMappingURL=servers.js.map