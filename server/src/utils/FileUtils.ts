import * as fs from "fs";
import * as path from "path";
import { Sigleton } from "../core/Sigleton";
// import {errLog} from "../LogTS";

export const CONFIG_PATH = "config/";
export const CONFIG_JSON_PATH = "config/TSConfig.json";
export const MAP_PATH = "Map/";
export const SKILL_PATH = "Skill/";
export const PNG_SUFFIX = ".png";
export const JSON_SUFFIX = ".json";
export const TXT_SUFFIX = ".txt";

export class FileUtils extends Sigleton {
    public static get Instance(): FileUtils {
        return this.getInstance();
    }

    /**
     * 创建路径
     * 使用示例：utility.makeDir(path.join(__dirname, './mkdir/demo/test/'));
     * @param {string} dir 路径
     */
    makeDir(dir: string) {
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
    fileOrFolderIsExsit(path: string) {
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
    writeFile(writePath: string, content: string) {
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

    /**
     * 追加内容
     * @param writePath 写入路径
     * @param content 内容
     */
    writeFileA(writePath: string, content: string) {
        fs.appendFile(writePath, content, 'utf8', err => {
            if (err) {
              console.error(err);
            }
          });
    }

    /**
     * 读取文件内容
     * @param path 
     * @returns 
     */
    async readFile(path: string): Promise<string> {
        return new Promise((resolve, reject) => {
            fs.readFile(path, 'utf8', function (err, data) {
                if (err) {
                    // throw err;
                    // errLog("找不到指定文件", path);
                    resolve(null);
                    return;
                }
                resolve(data);
            });
        });
    }

    /**
     * 递归文件夹获取指定类型文件
     * @param {string} dir 路径
     * @param {array} [exts=[]] 扩展名
     * @param {array} [filesList=[]] 文件列表
     * @returns
     */
    findFile(dir: string, exts: string[] = [], filesList: string[] = []) {
        const files = fs.readdirSync(dir);
        files.forEach(item => {
            var fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                this.findFile(path.join(dir, item), exts, filesList);
            } else {
                let extName: string = path.extname(fullPath);
                if (!exts.length || exts.indexOf(extName) != -1) {
                    filesList.push(fullPath);
                }
            }
        });
        return filesList;
    }

    findFile2(dir: string, extName: string = '', filesList: string[] = []) {
        const files = fs.readdirSync(dir);
        files.forEach(item => {
            var fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                this.findFile2(path.join(dir, item), extName, filesList);
            } else {
                if (!extName.length || fullPath.indexOf(extName) != -1) {
                    filesList.push(fullPath);
                }
            }
        });
        return filesList;
    }

    // 查看并返回，超过X秒未修改的文件列表
    findOlderFile(dir: string, exts: string[] = [], filesList: string[] = [], cmpTime: number = 120) {
        const files = fs.readdirSync(dir);
        files.forEach(item => {
            var fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                this.findOlderFile(path.join(dir, item), exts, filesList, cmpTime);
            } else {
                if (stat.mtime.getTime() > Date.now() - cmpTime * 1000)
                    return;

                let extName: string = path.extname(fullPath);
                if (!exts.length || exts.indexOf(extName) != -1) {
                    filesList.push(fullPath);
                }
            }
        });
        return filesList;
    }

    splitFilename(fullPath: string) {
        // 获取目录名  
        const dirname = path.dirname(fullPath);

        // 获取文件名（包含后缀）  
        const basename = path.basename(fullPath);

        // 使用字符串的lastIndexOf和slice方法来获取后缀名  
        // 假设后缀名总是以'.'开始  
        const lastDotIndex = basename.lastIndexOf('.');
        let extension = '';
        if (lastDotIndex !== -1) {
            extension = basename.slice(lastDotIndex + 1);
        }

        // 获取纯文件名（不包含后缀）  
        const filenameWithoutExtension = basename.slice(0, lastDotIndex);
        return { dirname, filenameWithoutExtension, extension };
    }
}
