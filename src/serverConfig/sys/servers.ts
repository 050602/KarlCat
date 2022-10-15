import { ServerName } from "./route";

export interface ServersConfigInfo {
    serverName: string,
    host: string,
    port: number,
    serverId: number,
    clientPort: number,
    frontend: boolean,
    platformId?: number,
    platformName?: string,
}


export interface IServersConfig {
    development: ServersConfig,
    production: ServersConfig
}

export interface ServersConfig {
    [ServerName.logic]: ServersConfigInfo[],
    [ServerName.gate]: ServersConfigInfo[],
}

export let serversConfig: IServersConfig = {
    development: {
        //==========================================1服========================================
        [ServerName.logic]: [
            { "serverId": 1, "serverName": "logic-1", "host": "127.0.0.1", "port": 3101, "frontend": false, "clientPort": 3032, "platformName": "xxx", "platformId": 1 },
        ],
        [ServerName.gate]: [
            { "serverId": 1, "serverName": "gate-1", "host": "127.0.0.1", "port": 4101, "frontend": true, "clientPort": 4032, "platformName": "xxx", "platformId": 1 },
        ]
    },
    production: {
        //==========================================1服========================================
        //logic的端口理论上要跟gate的对应 -1000
        [ServerName.logic]: [
            { "serverId": 1, "serverName": "logic-1", "host": "127.0.0.1", "port": 3101, "frontend": false, "clientPort": 3032, "platformName": "xxx", "platformId": 1 },
        ],
        [ServerName.gate]: [
            { "serverId": 1, "serverName": "gate-1", "host": "127.0.0.1", "port": 4101, "frontend": true, "clientPort": 4032, "platformName": "xxx", "platformId": 1 },
        ],
    }
}