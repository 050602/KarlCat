"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JoyUtils = void 0;
const urllib_1 = __importDefault(require("urllib"));
const LogTS_1 = require("../../LogTS");
const app_1 = require("../../app");
const LoginResultCode_1 = require("../../config/LoginResultCode");
const CommonUtils_1 = require("../CommonUtils");
const DateUtils_1 = require("../DateUtils");
const AppID = "23033101";
const AppKey = "5a5124ec396515f8a7a77e197a91b513";
const AppSeret = "28bcc638c4a22b71644c7890b436f733";
class JoyUtils {
    //return  子渠道名+"_"+username
    static async getToken(channelID, subChannelID, token, commonData, sdkUid, ip, userAgent) {
        let signature = CommonUtils_1.CommonUtils.getMD5(AppID + channelID + token + AppSeret);
        let content = `action=verifyAccount&appID=${AppID}&channelID=${channelID}&subChannelID=${subChannelID}&token=${token}&signature=${signature}&commonData=${commonData}&sdkUid=${sdkUid}&ip=${ip}`;
        if (userAgent) {
            content += `&userAgent=${userAgent}`;
        }
        let headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(content).toString(),
        };
        let baseUrl = "http://serverapi.15166.com/user";
        let data = await urllib_1.default.request(baseUrl, { method: "POST", headers: headers, dataType: 'json', data: content });
        (0, LogTS_1.logInfo)(data);
        if (data.statusCode == 200) {
            // {
            //     "result": 1,
            //     "msg": "验证成功",
            //     "code": 1,
            //     "data": {
            //       "uid": "1",
            //       "username": "2685219289.zyzs",
            //       "sdkUid": "2685219289"
            //     }
            //   }
            // if (data.data.code == 1) { 昌兴说不用管code了
            if (data.data.result == 1) {
                return [LoginResultCode_1.LoginResultCode.Succeed, /**subChannelID + "_" +**/ data.data.data.username, data.data.data.uid];
            }
            else {
                return [LoginResultCode_1.LoginResultCode.JoyTokenInvalid, sdkUid, "0"];
            }
            // } else {
            //     return [LoginResultCode.JoyTokenFail, sdkUid];
            // }
        }
        return [LoginResultCode_1.LoginResultCode.Fail, sdkUid, "0"];
    }
    static async loginUpLog(type, channelID, subChannelID, roleUid, unixTimestamp, commonData, sdkUid, ip, sessionId) {
        let signature = CommonUtils_1.CommonUtils.getMD5(AppID + AppSeret);
        //TODO这是一个数组，可以考虑等到多一点的时候才上报
        let attachObj = [{
                type: type,
                uid: sdkUid,
                channelID: channelID,
                subChannelID: subChannelID,
                timestamp: unixTimestamp + DateUtils_1.DateUtils.cost20230101s,
                serverID: app_1.BigServerId,
                ip: ip,
                commonData: commonData,
                sessionID: sessionId,
            }];
        let attach = JSON.stringify(attachObj);
        // let content = {
        //     appID: AppID,
        //     signature: signature,
        //     attach: attachObj,
        // }
        let content = `appID=${AppID}&signature=${signature}&attach=${attach}`;
        (0, LogTS_1.logInfo)("POST BODY:", content);
        let headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(content).toString(),
        };
        let baseUrl = "http://sdklog.15166.com/fcm/behavior/index";
        let data = await urllib_1.default.request(baseUrl, { method: "POST", headers: headers, dataType: 'json', data: content });
        (0, LogTS_1.logInfo)(data);
        if (data.statusCode == 200) {
            // {
            //     "msg": "上报成功",
            //     "code": 0
            //   }
            // {
            //     "msg": "上报失败",
            //     "code": 1
            //   }
            if (data.data.code == 1) {
                (0, LogTS_1.errLog)("JoySDK UpLoginLogs Fail", data.data.msg);
            }
        }
    }
    static async doChargeOrder(channelID, subChannelID, token, commonData, sdkUid, ip, userID, username, roleID, roleName, roleLevel, money, coin, currency = "RMB", productID, productName, productDesc, sdkVersion, sdkExtension, packageVersion, extension, cpOrderID, signType = "MD5") {
        let time = (DateUtils_1.DateUtils.unixtime() + DateUtils_1.DateUtils.cost20230101s).toString();
        let signature = CommonUtils_1.CommonUtils.getMD5(AppID + app_1.BigServerId.toString() + time + AppSeret);
        let content = `action=getOrderID&appID=${AppID}&channelID=${channelID}&subChannelID=${subChannelID}&token=${token}&signature=${signature}&commonData=${commonData}&sdkUid=${sdkUid}&payIp=${ip}&userID=${userID}&username=${username}&roleID=${roleID}&serverID=${app_1.BigServerId}&serverName=${app_1.BigServerId}&money=${money}&coin=${coin}&currency=${currency}&productID=${productID}&productName=${productName}&productDesc=${productDesc}&sdkVersion=${sdkVersion}&packageVersion=${packageVersion}&extension=${extension}&roleName=${roleName}&roleLevel=${roleLevel}&cpOrderID=${cpOrderID}&signType=${signType}`;
        let headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(content).toString(),
        };
        let baseUrl = "http://serverapi.15166.com/pay";
        let data = await urllib_1.default.request(baseUrl, { method: "POST", headers: headers, dataType: 'json', data: content });
        if (data.statusCode == 200) {
            if (data.data.code == 1) {
                return data.data.data;
            }
        }
        (0, LogTS_1.errLog)("doChargeOrder error", roleID, data);
        return null;
    }
    static async serverErrorUpLog() {
        let time = (DateUtils_1.DateUtils.unixtime() + DateUtils_1.DateUtils.cost20230101s).toString();
        let signature = CommonUtils_1.CommonUtils.getMD5(AppID + app_1.BigServerId.toString() + time + AppSeret);
        let content = `appID=${AppID}&serverID=${app_1.BigServerId}&timestamp=${time}&signature=${signature}`;
        let headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(content).toString(),
        };
        let baseUrl = "http://sdklog.15166.com/fcm/notice/index";
        let data = await urllib_1.default.request(baseUrl, { method: "POST", headers: headers, dataType: 'json', data: content });
        (0, LogTS_1.logInfo)(data);
        if (data.statusCode == 200) {
            // {
            //     "msg": "上报成功",
            //     "code": 0
            //   }
            // {
            //     "msg": "上报失败",
            //     "code": 1
            //   }
            if (data.data.code > 0) {
                (0, LogTS_1.errLog)("JoySDK serverErrorUpLog Fail", data.data.code, data.data.msg);
            }
        }
    }
}
exports.JoyUtils = JoyUtils;
//# sourceMappingURL=JoyUtils.js.map