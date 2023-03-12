"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUtils = exports.TXT_SUFFIX = exports.JSON_SUFFIX = exports.PNG_SUFFIX = exports.SKILL_PATH = exports.MAP_PATH = exports.CONFIG_JSON_PATH = exports.CONFIG_PATH = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const LogTS_1 = require("../LogTS");
exports.CONFIG_PATH = "config/";
exports.CONFIG_JSON_PATH = "config/TSConfig.json";
exports.MAP_PATH = "Map/";
exports.SKILL_PATH = "Skill/";
exports.PNG_SUFFIX = ".png";
exports.JSON_SUFFIX = ".json";
exports.TXT_SUFFIX = ".txt";
class FileUtils {
    /**
     * 创建路径
     * 使用示例：utility.makeDir(path.join(__dirname, './mkdir/demo/test/'));
     * @param {string} dir 路径
     */
    static makeDir(dir) {
        if (fs.existsSync(dir)) {
            return true;
        }
        else {
            if (this.makeDir(path.dirname(dir))) {
                fs.mkdirSync(dir);
                return true;
            }
        }
    }
    /**
     * 判断文件（夹）是否存在
     * @param path
     */
    static fileOrFolderIsExsit(path) {
        try {
            fs.accessSync(path);
            return true;
        }
        catch (e) {
            // 文件不存在
            return false;
        }
    }
    /**
     * 写入文件
     * @param {string} writePath 写入路径
     * @param {*} content 内容
     * @returns
     */
    static writeFile(writePath, content) {
        if (!content) {
            return console.error(`Cannot write null. ->${writePath}`);
        }
        try {
            fs.writeFileSync(writePath, content, {
                encoding: "utf-8"
            });
        }
        catch (error) {
            console.error(error);
        }
    }
    static async readFile(path) {
        return new Promise((resolve, reject) => {
            fs.readFile(path, 'utf8', function (err, data) {
                if (err) {
                    // throw err;
                    (0, LogTS_1.errLog)("找不到指定文件", path);
                    resolve(null);
                    return;
                }
                resolve(data);
            });
        });
    }
}
exports.FileUtils = FileUtils;
//# sourceMappingURL=FileUtils.js.map