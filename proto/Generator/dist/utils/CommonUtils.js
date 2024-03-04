"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonUtils = void 0;
const fs_1 = __importDefault(require("fs"));
const IOUtils_1 = require("./IOUtils");
const cli_color_1 = __importDefault(require("cli-color"));
class CommonUtils {
    static getTemplate(configType, filename) {
        let url = `templates/${configType}/template/${filename}`;
        if (IOUtils_1.IOUtils.fileOrFolderIsExsit(url)) {
            return fs_1.default.readFileSync(url, "utf-8");
        }
        console.log(cli_color_1.default.red(`找不到模板文件！${url}`));
    }
    static numIsInt(param) {
        if (param === "" || isNaN(param))
            return false;
        return parseInt(param) == parseFloat(param);
    }
    static numIsFloat(param) {
        if (param === "" || isNaN(param))
            return false;
        return parseInt(param) != parseFloat(param);
    }
    static deepClone(object) {
        if (object instanceof Array) {
            let array = [];
            let len = object.length;
            for (let n = 0; n < len; n++) {
                array.push(this.deepClone(object[n]));
            }
            return array;
        }
        else if (object instanceof Object) {
            let obj = {};
            for (let fieldKey in object) {
                if (object.hasOwnProperty(fieldKey)) {
                    obj[fieldKey] = this.deepClone(object[fieldKey]);
                }
            }
            return obj;
        }
        else {
            return object;
        }
    }
}
exports.CommonUtils = CommonUtils;
