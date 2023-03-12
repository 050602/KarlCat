export interface ServerMasterConfig {
    serverName: string,
    host: string,
    port: number,
}

export interface IMasterConfig {
    development: ServerMasterConfig,
    production: ServerMasterConfig
}

export let masterConfig: IMasterConfig = {
    development: {
        serverName: "master-1", host: "127.0.0.1", port: 42366
    },
    production: {
        serverName: "master-1", host: "127.0.0.1", port: 42366
    }
}
