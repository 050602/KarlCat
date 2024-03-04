"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringUtils = void 0;
class StringUtils {
    static format(pattern, ...args) {
        if (pattern == void 0)
            return '';
        if (arguments.length > 0) {
            if (arguments.length == 1) {
                return pattern;
            }
            else if (arguments.length == 2 && typeof (args) == "object") {
                if (!args)
                    return '';
                for (var i = 0; i < args.length; i++) {
                    if (args[i] != null) {
                        var reg = new RegExp("([【{]" + (i) + "[】}])", "g");
                        pattern = pattern.replace(reg, args[i].toString());
                    }
                }
            }
            else {
                for (var i = 1; i < arguments.length; i++) {
                    if (arguments[i] != null) {
                        var reg = new RegExp("([【{]" + (i - 1) + "[】}])", "g");
                        pattern = pattern.replace(reg, arguments[i].toString());
                    }
                }
            }
            return pattern;
        }
        else {
            return "";
        }
    }
    static getStrNum(str) {
        let result = [];
        let matchs = str.match(/\d+/g);
        if (matchs) {
            matchs.forEach(val => {
                result.push(+val);
            });
            return result.length == 1 ? result[0] : result;
        }
    }
    static convertToLowerCamelCase(str, withUnderline = false) {
        str = this.convertToNoUnderline(str);
        return (withUnderline ? "_" : "") + str[0].toLowerCase() + str.substring(1, str.length);
    }
    static convertToUpperCamelCase(str) {
        str = this.convertToNoUnderline(str);
        return str[0].toUpperCase() + str.substring(1, str.length);
    }
    static convertToNoUnderline(str) {
        var result = str;
        if (str.indexOf("_") >= 0) {
            result = "";
            var clips = str.split("_");
            for (let n = 0; n < clips.length; n++) {
                var clip = clips[n];
                if (n > 0) {
                    result += clip[0].toUpperCase() + clip.substring(1, clip.length);
                }
                else {
                    result += clip;
                }
            }
        }
        return result;
    }
    static genPassword(length = 8, hasNum = true, hasChar = true, hasSymbol = false, caseSense = true, lowerCase = false) {
        var m = "";
        if (!hasNum && !hasChar && !hasSymbol)
            return m;
        for (var i = length; i >= 0; i--) {
            var num = Math.floor((Math.random() * 94) + 33);
            if (((!hasNum) && ((num >= 48) && (num <= 57))) || ((!hasChar) && (((num >= 65) && (num <= 90)) || ((num >= 97) && (num <= 122)))) || ((!hasSymbol) && (((num >= 33) && (num <= 47)) || ((num >= 58) && (num <= 64)) || ((num >= 91) && (num <= 96)) || ((num >= 123) && (num <= 127))))) {
                i++;
                continue;
            }
            m += String.fromCharCode(num);
        }
        if (caseSense != null && !caseSense) {
            m = (!lowerCase) ? m.toUpperCase() : m.toLowerCase();
        }
        return m;
    }
}
exports.StringUtils = StringUtils;
