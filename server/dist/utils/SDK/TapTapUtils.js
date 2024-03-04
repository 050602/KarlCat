"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TapTapUtils = void 0;
const LogTS_1 = require("../../LogTS");
const urllib_1 = __importDefault(require("urllib"));
const crypto_1 = __importDefault(require("crypto"));
const LoginResultCode_1 = require("../../config/LoginResultCode");
let nonce = crypto_1.default.randomBytes(16).toString('base64');
// let TapTapClientId = "3k92xr9fwvhqa8bdkg";
let TapTapClientId = "mrbdcvfk05vznsw6pf";
class TapTapUtils {
    /**
    TapSDK 登录后信息获取
    **/
    // let kid = "1/hC0vtMo7ke0Hkd-iI8-zcAwy7vKds9si93l7qBmNFxJkylWEOYEzGqa7k_9iw_bb3vizf-3CHc6U8hs-5a74bMFzkkz7qC2HdifBEHsW9wxOBn4OsF9vz4Cc6CWijkomnOHdwt8Km6TywOX5cxyQv0fnQQ9fEHbptkIJagCd33eBXg76grKmKsIR-YUZd1oVHu0aZ6BR7tpYYsCLl-LM6ilf8LZpahxQ28n2c-y33d-20YRY5NW1SnR7BorFbd00ZP97N9kwDncoM1GvSZ7n90_0ZWj4a12x1rfAWLuKEimw1oMGl574L0wE5mGoshPa-CYASaQmBDo3Q69XbjTsKQ";
    // let mac_key = "mSUQNYUGRBPXyRyW";
    // 
    static getMacToken(kid, mac_key /*, client_id: string**/) {
        let ts = Math.ceil(Date.now() / 1000);
        let ext = "";
        // let signArray = [ts, nonce, 'GET', '/account/profile/v1?client_id=' + client_id, 'openapi.taptap.com', 443, ext];
        let signArray = [ts, nonce, 'GET', '/account/basic-info/v1?client_id=' + TapTapClientId, 'openapi.taptap.com', 443, ext];
        let mac = this.hmacSha1(signArray.join("\n") + "\n", mac_key);
        // let auth = format('MAC id={id},ts={ts},nonce={nonce},mac={mac}', {
        //     id: '\"' + kid + '\"',
        //     ts: '\"' + ts + '\"',
        //     nonce: '\"' + nonce + '\"',
        //     mac: '\"' + mac + '\"'
        // });
        let id = '\"' + kid + '\"';
        let ts2 = '\"' + ts + '\"';
        let nonce2 = '\"' + nonce + '\"';
        let mac2 = '\"' + mac + '\"';
        let auth = `MAC id=${id},ts=${ts2},nonce=${nonce2},mac=${mac2}`;
        // gzaLog("token", auth);
        return auth;
    }
    static async getUnionid(macToken) {
        let headers = {
            authorization: macToken
        };
        let baseUrl = "https://openapi.taptap.com/account/basic-info/v1?client_id=";
        let data = await urllib_1.default.request(baseUrl + TapTapClientId, { method: "GET", headers: headers, dataType: 'json' });
        if (data.statusCode == 200) {
            if (data.data.success) {
                return [LoginResultCode_1.LoginResultCode.Succeed, data.data.data.unionid];
            }
        }
        else if (data.statusCode == 401) {
            return [LoginResultCode_1.LoginResultCode.TapTapParamIllegal, null];
        }
        else if (data.statusCode == 500) {
            return [LoginResultCode_1.LoginResultCode.TryReconnentTapTap, null];
        }
        else if (data.statusCode == 400) {
            return [LoginResultCode_1.LoginResultCode.TapTapError, null];
        }
        else if (data.statusCode == 403) {
            return [LoginResultCode_1.LoginResultCode.TapTapError, null];
        }
        (0, LogTS_1.errLog)("TapTap GetUnionID Error", data);
        return [LoginResultCode_1.LoginResultCode.TapTapError, null];
    }
    static async getFCM(unionId, fcmtoken) {
        // curl -X POST \
        //   -H "Content-Type: application/json" \
        //   -H 'Authorization: {{token}}' \
        //   https://tds-tapsdk.cn.tapapis.com/anti-addiction/v1/clients/{{clientId}}/users/{{userIdentifier}}/playable
        let headers = {
            authorization: fcmtoken
        };
        // let baseUrl = `https://tds-tapsdk.cn.tapapis.com/anti-addiction/v1/clients/${TapTapClientId}/users/${unionId}/playable`;
        // let data = await urllib.request(baseUrl, { method: "POST", headers: headers, dataType: 'json' });
        // if (data.statusCode == 200) {
        //     gzaLog("getFCM", data.data);
        //     if (data.data.data.code == 200) {
        //         if (data.data.data.can_play == true) {
        return LoginResultCode_1.LoginResultCode.Succeed;
        //         } else {
        //             return LoginResultCode.FCMOutTime;
        //         }
        //     } else {
        //         return LoginResultCode.NotFCM;
        //     }
        // }
        return LoginResultCode_1.LoginResultCode.NotFCM;
    }
    static base64ToUrlSafe(v) {
        return v.replace(/\//g, '_').replace(/\+/g, '-');
    }
    ;
    static urlsafeBase64Encode(jsonFlags) {
        let encoded = Buffer.from(jsonFlags).toString('base64');
        return TapTapUtils.base64ToUrlSafe(encoded);
    }
    ;
    static hmacSha1(encodedFlags, secretKey) {
        let hmac = crypto_1.default.createHmac('sha1', secretKey);
        hmac.update(encodedFlags);
        return hmac.digest('base64');
    }
    ;
}
exports.TapTapUtils = TapTapUtils;
//# sourceMappingURL=TapTapUtils.js.map