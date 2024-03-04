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
Object.defineProperty(exports, "__esModule", { value: true });
const IOUtils_1 = require("./utils/IOUtils");
const StringUtils_1 = require("./utils/StringUtils");
class InnerProto2CS {
    static Proto2CS() {
        let list = [];
        IOUtils_1.IOUtils.findFileByCondition(InnerProto2CS.protoDir, (fullpath) => {
            if (fullpath.includes(".proto")) {
                return true;
            }
            return false;
        }, list);
        for (let fullPath of list) {
            if (!fullPath.endsWith(".proto")) {
                continue;
            }
            let fileName = fullPath.split("\\").pop();
            let protoName = fileName.split(".");
            this.ProtoFile2CS(fullPath, fileName, protoName[0]);
            console.log("ProtoFile2CS", fullPath, protoName[0]);
        }
    }
    static ProtoFile2CS(fullName, fileName, protoName) {
        return __awaiter(this, void 0, void 0, function* () {
            let msgOpcode = [];
            let fileStr = yield IOUtils_1.IOUtils.readFile(fullName);
            let sb = "";
            let isMsgStart = false;
            let strArr = fileStr.split('\n');
            let arr = [];
            for (let i = 0; i < strArr.length; i++) {
                let line = strArr[i];
                let newline = line.trim();
                if (newline == "") {
                    continue;
                }
                if (newline.startsWith("message")) {
                    let parentClass = "";
                    isMsgStart = true;
                    let msgName = newline.split(/\s+/)[1];
                    let ss = newline.split("IName:");
                    if (ss.length == 2) {
                        parentClass = ss[1].trim();
                    }
                    let code = 0;
                    if (msgName.startsWith("Pt")) {
                        let fileName2 = fileName.replace(/\d+/g, '');
                        fileName2 = fileName2.replace(".proto", "");
                        if (parentClass == "") {
                            parentClass = msgName.replace("Pt", fileName2);
                        }
                        let nums = StringUtils_1.StringUtils.getStrNum(msgName);
                        let nums2 = StringUtils_1.StringUtils.getStrNum(fileName);
                        protoName = "Pt" + nums2 + fileName2;
                        console.log("protoName", protoName, nums2, fileName2);
                        code = nums;
                        parentClass += code;
                        msgOpcode.push({ Name: parentClass, Opcode: code });
                    }
                    else {
                        let fileName2 = fileName.replace(/\d+/g, '');
                        fileName2 = fileName2.replace(".proto", "");
                        protoName = "Pt" + fileName2;
                    }
                    continue;
                }
            }
            sb += ("export enum " + protoName + " {\n");
            for (let info of msgOpcode) {
                sb += (`\t${info.Name} = ${info.Opcode}, \n`);
            }
            sb += ("}\n");
            this.GenerateCS(sb, InnerProto2CS.serverMessagePath, protoName);
        });
    }
    static GenerateCS(text, outpath, protoName) {
        if (!IOUtils_1.IOUtils.fileOrFolderIsExsit(`${outpath}`)) {
            IOUtils_1.IOUtils.makeDir(`${outpath}`);
        }
        else {
            IOUtils_1.IOUtils.deleteFile(`${outpath}\\${protoName}.ts`);
        }
        IOUtils_1.IOUtils.writeTextFile(`${outpath}\\${protoName}.ts`, text);
    }
    static MapData(ns, newline) {
        let newStr = "";
        let start = newline.indexOf("<") + 1;
        let end = newline.indexOf(">");
        let types = newline.substring(start, end - start);
        let ss = types.split(",");
        let keyType = this.ConvertType(ss[0].trim());
        let valueType = this.ConvertType(ss[1].trim());
        let tail = newline.substring(end + 1);
        ss = tail.trim().replace(";", "").split(" ");
        let v = ss[0];
        let n = ss[2];
        newStr += ("\t\t[MongoDB.Bson.Serialization.Attributes.BsonDictionaryOptions(MongoDB.Bson.Serialization.Options.DictionaryRepresentation.ArrayOfArrays)]\n");
        newStr += (`\t\t[ProtoMember(${n})]\n`);
        newStr += (`\t\tpublic Dictionary<${keyType}, ${valueType}> ${v} { get; set; }\n`);
        return newStr;
    }
    static Repeated(ns, newline) {
        let newStr = "";
        try {
            newline = newline.replace(";", "");
            let ss = newline.split(/\s+/);
            let type = ss[1];
            type = this.ConvertType(type);
            let name = ss[2];
            let n = parseInt(ss[4]);
            newStr += (`\t\t[ProtoMember(${n})]\n`);
            newStr += (`\t\tpublic List<${type}> ${name} { get; set; }\n\n`);
        }
        catch (e) {
            console.log(`${newline}\n ${e}`);
        }
        return newStr;
    }
    static ConvertType(type) {
        let typeCs = "";
        switch (type) {
            case "int16":
                typeCs = "short";
                break;
            case "int32":
            case "sint32":
                typeCs = "int";
                break;
            case "bytes":
                typeCs = "byte[]";
                break;
            case "uint32":
                typeCs = "uint";
                break;
            case "long":
                typeCs = "long";
                break;
            case "int64":
                typeCs = "long";
                break;
            case "uint64":
                typeCs = "ulong";
                break;
            case "uint16":
                typeCs = "ushort";
                break;
            default:
                typeCs = type;
                break;
        }
        return typeCs;
    }
    static ConvertTypeDefault(type) {
        let typeCs = "";
        switch (type) {
            case "int16":
                typeCs = "0";
                break;
            case "int32":
            case "sint32":
                typeCs = "0";
                break;
            case "bytes":
                typeCs = "[]";
                break;
            case "uint32":
                typeCs = "0";
                break;
            case "long":
                typeCs = "0";
                break;
            case "int64":
                typeCs = "0";
                break;
            case "uint64":
                typeCs = "0";
                break;
            case "uint16":
                typeCs = "0";
                break;
            case "bool":
                typeCs = "false";
                break;
            default:
                typeCs = type;
                break;
        }
        return typeCs;
    }
    static Members(newline, isRequired) {
        let newStr = "";
        try {
            newline = newline.replace(";", "");
            let ss = newline.split(/\s+/);
            let type = ss[1];
            let name = ss[2];
            let n = parseInt(ss[4]);
            let typeCs = this.ConvertType(type);
            newStr += (`\t\t[ProtoMember(${n})]\n`);
            newStr += (`\t\tpublic ${typeCs} ${name} { get; set; } \n\n`);
        }
        catch (e) {
            console.log(`${newline}\n ${e}`);
        }
        return newStr;
    }
}
InnerProto2CS.protoDir = "proto";
InnerProto2CS.serverMessagePath = "../server/src/proto/protos";
InnerProto2CS.Proto2CS();
console.log("proto2cs over!");
