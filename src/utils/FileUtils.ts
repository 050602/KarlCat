import * as fs from "fs";
import * as path from "path";
import {errLog} from "../LogTS";

export const CONFIG_PATH = "config/";
export const CONFIG_JSON_PATH = "config/TSConfig.json";
export const MAP_PATH = "Map/";
export const SKILL_PATH = "Skill/";
export const PNG_SUFFIX = ".png";
export const JSON_SUFFIX = ".json";
export const TXT_SUFFIX = ".txt";

export class FileUtils {

    /**
     * 创建路径
     * 使用示例：utility.makeDir(path.join(__dirname, './mkdir/demo/test/'));
     * @param {string} dir 路径
     */
    public static makeDir(dir: string) {
        if (fs.existsSync(dir)) {
            return true;
        } else {
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
    public static fileOrFolderIsExsit(path: string) {
        try {
            fs.accessSync(path);
            return true;
        } catch (e) {
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
    public static writeFile(writePath: string, content: string) {
        if (!content) {
            return console.error(`Cannot write null. ->${writePath}`);
        }
        try {
            fs.writeFileSync(
                writePath,
                content,
                {
                    encoding: "utf-8"
                }
            );
        } catch (error) {
            console.error(error);
        }
    }

    public static async readFile(path: string): Promise<string> {
        return new Promise((resolve, reject) => {
            fs.readFile(path, 'utf8', function (err, data) {
                if (err) {
                    // throw err;
                    errLog("找不到指定文件", path);
                    resolve(null);
                    return;
                }
                resolve(data);
            });
        });
    }


}
