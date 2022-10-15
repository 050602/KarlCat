import { Application } from "./application";
import { I_connectorConstructor } from "./util/interfaceDefine";
import { ConnectorTcp } from "./connector/connectorProxyTcp";
import { ConnectorWs } from "./connector/connectorProxyWs";
import { errLog } from "./LogTS";

interface I_mydog {
    version: string,
    createApp: () => Application,
    mydogApp: Application,
    connector: {
        Tcp: I_connectorConstructor,
        Ws: I_connectorConstructor,
    }
}


let hasCreated = false;
let mydog:I_mydog = {} as any;
mydog.version = require("../package.json").version;
mydog.createApp = function () {
    if (hasCreated) {
        errLog("the app has already been created");
        return mydog.mydogApp;
    }
    hasCreated = true;
    mydog.mydogApp = new Application();
    return mydog.mydogApp;
};

mydog.connector = {
    "Tcp": ConnectorTcp,
    "Ws": ConnectorWs,
};


export = mydog