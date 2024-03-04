"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IOUtils = exports.LineBreak = void 0;
const cli_color_1 = __importDefault(require("cli-color"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const StringUtils_1 = require("./StringUtils");
const enc_latin1_1 = __importDefault(require("crypto-js/enc-latin1"));
const enc_hex_1 = __importDefault(require("crypto-js/enc-hex"));
const md5_1 = __importDefault(require("crypto-js/md5"));
var LineBreak;
(function (LineBreak) {
    LineBreak[LineBreak["CRLF"] = 0] = "CRLF";
    LineBreak[LineBreak["LF"] = 1] = "LF";
})(LineBreak = exports.LineBreak || (exports.LineBreak = {}));
class IOUtils {
    static makeDir(dir) {
        if (fs_1.default.existsSync(dir)) {
            return true;
        }
        else {
            if (this.makeDir(path_1.default.dirname(dir))) {
                fs_1.default.mkdirSync(dir);
                return true;
            }
        }
    }
    static findFile(dir, exts = [], filesList = []) {
        const files = fs_1.default.readdirSync(dir);
        files.forEach(item => {
            var fullPath = path_1.default.join(dir, item);
            const stat = fs_1.default.statSync(fullPath);
            if (stat.isDirectory()) {
                this.findFile(path_1.default.join(dir, item), exts, filesList);
            }
            else {
                let extName = path_1.default.extname(fullPath);
                if (!exts.length || exts.indexOf(extName) != -1) {
                    filesList.push(fullPath);
                }
            }
        });
        return filesList;
    }
    static findFileByCondition(folderPath, condition, filesList = []) {
        if (fs_1.default.existsSync(folderPath)) {
            let files = fs_1.default.readdirSync(folderPath);
            files.forEach(filename => {
                let fullPath = path_1.default.join(folderPath, filename);
                if (fs_1.default.statSync(fullPath).isDirectory()) {
                    this.findFileByCondition(fullPath, condition, filesList);
                }
                else {
                    if (condition(fullPath)) {
                        filesList.push(fullPath);
                    }
                }
            });
        }
    }
    static findDirectory(dir, dirList = []) {
        const files = fs_1.default.readdirSync(dir);
        files.forEach(item => {
            let fullPath = path_1.default.join(dir, item);
            const stat = fs_1.default.statSync(fullPath);
            if (stat.isDirectory()) {
                dirList.push(fullPath);
                this.findDirectory(path_1.default.join(dir, item), dirList);
            }
        });
        return dirList;
    }
    static findDirectoryByCondition(dir, condition, dirList = []) {
        const files = fs_1.default.readdirSync(dir);
        files.forEach(item => {
            var fullPath = path_1.default.join(dir, item);
            const stat = fs_1.default.statSync(fullPath);
            if (stat.isDirectory()) {
                if (condition(fullPath)) {
                    dirList.push(fullPath);
                }
                this.findDirectory(path_1.default.join(dir, item), dirList);
            }
        });
        return dirList;
    }
    static deleteFile(path) {
        if (fs_1.default.existsSync(path)) {
            fs_1.default.unlinkSync(path);
        }
    }
    static deleteFolderFileByCondition(folderPath, condition) {
        if (fs_1.default.existsSync(folderPath)) {
            let files = fs_1.default.readdirSync(folderPath);
            files.forEach(filename => {
                let fullPath = path_1.default.join(folderPath, filename);
                if (fs_1.default.statSync(fullPath).isDirectory()) {
                    this.deleteFolderFileByCondition(fullPath, condition);
                }
                else {
                    if (condition(fullPath)) {
                        fs_1.default.unlinkSync(fullPath);
                    }
                }
            });
        }
    }
    static deleteFolderFile(folderPath, delRootDir = true) {
        let files = [];
        if (fs_1.default.existsSync(folderPath)) {
            files = fs_1.default.readdirSync(folderPath);
            files.forEach(file => {
                let curPath = folderPath + "/" + file;
                if (fs_1.default.statSync(curPath).isDirectory()) {
                    this.deleteFolderFile(curPath);
                }
                else {
                    fs_1.default.unlinkSync(curPath);
                }
            });
            if (delRootDir) {
                fs_1.default.rmdirSync(folderPath);
            }
        }
    }
    static fileOrFolderIsExsit(path) {
        try {
            fs_1.default.accessSync(path);
            return true;
        }
        catch (e) {
            return false;
        }
    }
    static getFileMD5(filePath) {
        if (this.fileOrFolderIsExsit(filePath)) {
            let content = fs_1.default.readFileSync(filePath, { encoding: "latin1" });
            return (0, md5_1.default)(enc_latin1_1.default.parse(content)).toString(enc_hex_1.default);
        }
    }
    static writeTextFile(writePath, content, lineBreak, succeedLog, failedLog) {
        if (!content) {
            return console.log(cli_color_1.default.yellow(`Cannot write null. ->${writePath}`));
        }
        if (lineBreak != null) {
            switch (lineBreak) {
                case LineBreak.CRLF: {
                    let pwd = StringUtils_1.StringUtils.genPassword(8);
                    content = content.replace(/\r\n/g, pwd);
                    content = content.replace(/\n/g, `\r\n`);
                    content = content.replace(/\r/g, ``);
                    var reg = "/" + pwd + "/g";
                    content = content.replace(eval(reg), `\r\n`);
                    break;
                }
                case LineBreak.LF: {
                    content = content.replace(/\r/g, ``);
                    break;
                }
            }
        }
        try {
            fs_1.default.writeFileSync(writePath, content, {
                encoding: "utf-8"
            });
            if (succeedLog) {
                console.log(cli_color_1.default.green(StringUtils_1.StringUtils.format(succeedLog, writePath)));
            }
        }
        catch (error) {
            if (failedLog) {
                console.log(cli_color_1.default.red(StringUtils_1.StringUtils.format(failedLog, writePath, error || "")));
            }
            else if (failedLog == null) {
                throw error;
            }
        }
    }
    static copy(from, to) {
        if (fs_1.default.existsSync(from) == false)
            return false;
        this.makeDir(to);
        if (fs_1.default.statSync(from).isDirectory()) {
            var dirs = fs_1.default.readdirSync(from);
            let self = this;
            dirs.forEach(function (item) {
                var item_path = path_1.default.join(from, item);
                var temp = fs_1.default.statSync(item_path);
                if (temp.isFile()) {
                    fs_1.default.copyFileSync(item_path, path_1.default.join(to, item));
                }
                else if (temp.isDirectory()) {
                    self.copy(item_path, path_1.default.join(to, item));
                }
            });
        }
        else {
            var item = path_1.default.basename(from);
            fs_1.default.copyFileSync(from, path_1.default.join(to, item));
        }
    }
    static readFile(path) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                fs_1.default.readFile(path, 'utf8', function (err, data) {
                    if (err) {
                        resolve(null);
                        return;
                    }
                    resolve(data);
                });
            });
        });
    }
}
exports.IOUtils = IOUtils;
