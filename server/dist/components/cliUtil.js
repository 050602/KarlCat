"use strict";
/**
 * cli command processing module such as mydog list
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitorCli = exports.MasterCli = void 0;
const DateUtils_1 = require("../utils/DateUtils");
const BSON = require('bson');
const Long = BSON.Long;
let serverTypeSort = [];
class MasterCli {
    constructor(app, servers) {
        this.monitorRequests = {};
        this.reqId = 1;
        this.exiting = false; // 进程是否正在退出
        this.app = app;
        this.servers = servers;
        serverTypeSort.push("master");
        for (let svrType in app.serversConfig) {
            serverTypeSort.push(svrType);
        }
    }
    deal_cli_msg(socket, data) {
        let reqId = data.reqId;
        data = data.msg;
        if (this["func_" + data.func]) {
            this["func_" + data.func](reqId, socket, data.args);
        }
    }
    deal_monitor_msg(data) {
        let req = this.monitorRequests[data.reqId];
        if (req) {
            delete this.monitorRequests[data.reqId];
            clearTimeout(req.timeOut);
            req.cb(null, data.msg);
        }
    }
    send_to_monitor(socket, msg, timeout, cb) {
        let data = { "T": 3 /* define.Master_To_Monitor.cliMsg */, "msg": msg };
        if (cb) {
            let _reqId = this.reqId++;
            data["reqId"] = _reqId;
            let self = this;
            this.monitorRequests[_reqId] = {
                "cb": cb,
                "timeOut": setTimeout(function () {
                    delete self.monitorRequests[_reqId];
                    cb("time out");
                }, timeout * 1000)
            };
        }
        let dataBuf = BSON.serialize(data);
        socket.send(dataBuf);
    }
    func_list(reqId, socket, args) {
        let self = this;
        let num = 0;
        for (let sid in this.servers) {
            num++;
            this.send_to_monitor(this.servers[sid], { "func": "list" }, 10, cb);
        }
        let titles = ["serverName", "serverType", "pid", "rss(M)", "upTime(d-h-m)"];
        let infos = getListInfo(this.app);
        let listFunc = this.app.someconfig.mydogList;
        if (typeof listFunc === "function") {
            let resArr = listFunc();
            if (resArr && Array.isArray(resArr)) {
                for (let one of resArr) {
                    titles.push(one.title);
                    infos.push(one.value);
                }
            }
        }
        let serverInfoArr = [];
        serverInfoArr.push(titles);
        serverInfoArr.push(infos);
        if (num === 0) {
            cb("no other server", null);
        }
        function cb(err, data) {
            if (!err) {
                serverInfoArr.push(data);
            }
            num--;
            if (num <= 0) {
                socket.send({
                    "reqId": reqId,
                    "msg": {
                        "name": self.app.appName,
                        "env": self.app.env,
                        "serverTypeSort": serverTypeSort,
                        "infoArr": serverInfoArr,
                    }
                });
            }
        }
    }
    func_stop(reqId, socket, args) {
        let num = 0;
        for (let sid in this.servers) {
            num++;
        }
        if (num === 0) {
            cb("no server", null);
            return;
        }
        if (this.exiting) {
            socket.send({ "reqId": reqId });
            return;
        }
        this.exiting = true;
        for (let sid in this.servers) {
            this.send_to_monitor(this.servers[sid], { "func": "stop" }, 3600, cb); // stop 会导致 master 也关闭，且master在其他服关闭后才能关闭，所以超时时间设为很久
        }
        function cb(err, data) {
            num--;
            if (num <= 0) {
                socket.send({ "reqId": reqId });
                exitCall();
            }
        }
    }
    func_remove(reqId, socket, args) {
        let num = 0;
        for (let i = 0; i < args.length; i++) {
            if (!this.servers[args[i]]) {
                continue;
            }
            num++;
            this.send_to_monitor(this.servers[args[i]], { "func": "remove" }, 10, cb);
        }
        if (num === 0) {
            cb("no server", null);
        }
        function cb(err, data) {
            num--;
            if (num <= 0) {
                socket.send({ "reqId": reqId });
            }
        }
    }
    func_removeT(reqId, socket, args) {
        let num = 0;
        for (let x in this.servers) {
            let one = this.servers[x];
            if (args.indexOf(one.serverType) === -1) {
                continue;
            }
            num++;
            this.send_to_monitor(one, { "func": "removeT" }, 10, cb);
        }
        if (num === 0) {
            cb("no serverType", null);
        }
        function cb(err, data) {
            num--;
            if (num <= 0) {
                socket.send({ "reqId": reqId });
            }
        }
    }
    func_send(reqId, socket, args) {
        let okArr = [];
        if (args.serverIds) {
            for (let id of args.serverIds) {
                if (this.servers[id]) {
                    okArr.push(this.servers[id]);
                }
            }
        }
        else if (args.serverTypes) {
            for (let x in this.servers) {
                let one = this.servers[x];
                if (args.serverTypes.includes(one.serverType)) {
                    okArr.push(one);
                }
            }
        }
        else {
            for (let x in this.servers) {
                okArr.push(this.servers[x]);
            }
        }
        if (okArr.length === 0) {
            socket.send({
                "reqId": reqId,
                "msg": {
                    "err": "no target serverIds"
                }
            });
            return;
        }
        let num = okArr.length;
        let endData = [];
        let timeoutIds = [];
        for (let one of okArr) {
            this.send_to_monitor(one, { "func": "send", "args": args.argv }, 60, (err, data) => {
                if (err) {
                    timeoutIds.push(one.sid);
                }
                else {
                    endData.push({ "serverName": one.sid, "serverType": one.serverType, "data": data });
                }
                num--;
                if (num <= 0) {
                    socket.send({ "reqId": reqId, "msg": { "err": "", "timeoutIds": timeoutIds, "data": endData } });
                }
            });
        }
    }
}
exports.MasterCli = MasterCli;
function getListInfo(app) {
    let mem = process.memoryUsage();
    let Mb = 1024 * 1024;
    return [app.serverName, app.serverType, process.pid.toString(), Math.floor(mem.rss / Mb).toString(), formatTime(app.startTime)];
}
function formatTime(time) {
    time = Math.floor((DateUtils_1.DateUtils.timestamp() - time) * 0.001);
    var days = Math.floor(time / (24 * 3600));
    time = time % (24 * 3600);
    var hours = Math.floor(time / 3600);
    time = time % 3600;
    var minutes = Math.ceil(time / 60);
    return days + "-" + hours + "-" + minutes;
}
class MonitorCli {
    constructor(app) {
        this.exiting = false; // 进程是否正在退出
        this.app = app;
    }
    deal_master_msg(socket, data) {
        let reqId = data.reqId;
        data = data.msg;
        if (this["func_" + data.func]) {
            this["func_" + data.func](reqId, socket, data.args);
        }
    }
    send_to_master(socket, msg) {
        socket.send(msg);
    }
    func_list(reqId, socket, args) {
        let infos = getListInfo(this.app);
        let listFunc = this.app.someconfig.mydogList;
        if (typeof listFunc === "function") {
            let resArr = listFunc();
            if (resArr && Array.isArray(resArr)) {
                for (let one of resArr) {
                    infos.push(one.value);
                }
            }
        }
        let msg = {
            "T": 3 /* define.Monitor_To_Master.cliMsg */,
            "reqId": reqId,
            "msg": infos
        };
        this.send_to_master(socket, msg);
    }
    func_stop(reqId, socket, args) {
        let msg = {
            "T": 3 /* define.Monitor_To_Master.cliMsg */,
            "reqId": reqId,
        };
        if (this.exiting) {
            return;
        }
        this.exiting = true;
        let exitFunc = this.app.someconfig.onBeforeExit;
        if (exitFunc) {
            exitFunc(() => {
                this.send_to_master(socket, msg);
                exitCall();
            });
        }
        else {
            this.send_to_master(socket, msg);
            exitCall();
        }
    }
    func_remove(reqId, socket, args) {
        let msg = {
            "T": 3 /* define.Monitor_To_Master.cliMsg */,
            "reqId": reqId,
        };
        this.send_to_master(socket, msg);
        if (this.exiting) {
            return;
        }
        this.exiting = true;
        let exitFunc = this.app.someconfig.onBeforeExit;
        if (exitFunc) {
            exitFunc(() => {
                exitCall();
            });
        }
        else {
            exitCall();
        }
    }
    func_removeT(reqId, socket, args) {
        let msg = {
            "T": 3 /* define.Monitor_To_Master.cliMsg */,
            "reqId": reqId,
        };
        this.send_to_master(socket, msg);
        if (this.exiting) {
            return;
        }
        this.exiting = true;
        let exitFunc = this.app.someconfig.onBeforeExit;
        if (exitFunc) {
            exitFunc(() => {
                exitCall();
            });
        }
        else {
            exitCall();
        }
    }
    func_send(reqId, socket, args) {
        let msg = {
            "T": 3 /* define.Monitor_To_Master.cliMsg */,
            "reqId": reqId,
            "msg": null,
        };
        let sendFunc = this.app.someconfig.onMydogSend;
        if (sendFunc) {
            sendFunc(args, (data) => {
                if (data === undefined) {
                    data = null;
                }
                msg.msg = data;
                this.send_to_master(socket, msg);
            });
        }
        else {
            this.send_to_master(socket, msg);
        }
    }
}
exports.MonitorCli = MonitorCli;
/** 进程 1s 后退出 */
function exitCall() {
    setTimeout(() => {
        process.exit();
    }, 1000);
}
//# sourceMappingURL=cliUtil.js.map