import { ServerName } from "./protoToServerName";

export default {
    "development": {
        [ServerName.gate]: [
            { "id": "gete-1", "host": "127.0.0.1", "port": 4031, "frontend": true, "clientPort": 4032 },
        ],
        [ServerName.connector]: [
            { "id": "connector-1", "host": "127.0.0.1", "port": 4021, "frontend": false, "clientPort": 4001, },
        ],
    },
    "production": {
        "connector": [
            { "id": "connector-server-1", "host": "127.0.0.1", "port": 4021, "frontend": true, "clientPort": 4001, },
        ],
    }
}