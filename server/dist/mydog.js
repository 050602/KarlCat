"use strict";
const application_1 = require("./application");
const connectorProxyTcp_1 = require("./connector/connectorProxyTcp");
const connectorProxyWs_1 = require("./connector/connectorProxyWs");
const connectorLockStep_1 = require("./connector/connectorLockStep");
let hasCreated = false;
let mydog = {};
mydog.version = require("../package.json").version;
mydog.createApp = function () {
    if (hasCreated) {
        console.error("the app has already been created");
        return mydog.mydogApp;
    }
    hasCreated = true;
    mydog.mydogApp = new application_1.Application();
    return mydog.mydogApp;
};
mydog.connector = {
    "Tcp": connectorProxyTcp_1.ConnectorTcp,
    "Ws": connectorProxyWs_1.ConnectorWs,
    "Kcp": connectorLockStep_1.ConnectorLockStep,
};
module.exports = mydog;
//# sourceMappingURL=mydog.js.map