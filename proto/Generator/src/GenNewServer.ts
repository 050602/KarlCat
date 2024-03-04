import { IOUtils } from "./utils/IOUtils";
import { StringUtils } from "./utils/StringUtils";

interface OpcodeInfo {
    Name: string;
    Opcode: number;
}


class InnerProto2CS {
    private static protoDir = "proto";
    // private static clientMessagePath = "../Unity/Assets/Scripts/Codes/Model/Generate/Client/Message/";
    private static serverMessagePath = "../server/src/proto/protos";
    // private static clientServerMessagePath = "../Unity/Assets/Scripts/Codes/Model/Generate/ClientServer/Message/";
    // private static splitChars1: string = ' ';
    // private static splitChars2: string = '\t';
    // private static msgOpcode: OpcodeInfo[] = [];

    public static Proto2CS() {
        // this.msgOpcode = [];

        //删除文件，太特么危险了
        // if (IOUtils.fileOrFolderIsExsit(InnerProto2CS.clientMessagePath)) {
        //     IOUtils.deleteFolderFile(InnerProto2CS.clientMessagePath, true);
        // }
        //删除文件，太特么危险了
        // if (IOUtils.fileOrFolderIsExsit(InnerProto2CS.serverMessagePath)) {
        //     IOUtils.deleteFolderFile(InnerProto2CS.serverMessagePath, true);
        // }
        //删除文件，太特么危险了
        // if (IOUtils.fileOrFolderIsExsit(InnerProto2CS.clientServerMessagePath)) {
        //     IOUtils.deleteFolderFile(InnerProto2CS.clientServerMessagePath, true);
        // }

        let list: string[] = []
        IOUtils.findFileByCondition(InnerProto2CS.protoDir, (fullpath: string) => {
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
            let protoName: string[] = fileName.split(".");
            this.ProtoFile2CS(fullPath, fileName, protoName[0], /**cs, startOpcode*/);
            console.log("ProtoFile2CS", fullPath, protoName[0]);
        }
    }

    public static async ProtoFile2CS(fullName: string, fileName: string, protoName: string/** , cs: string, startOpcode: number*/) {
        // let ns = "ET.Proto";
        let msgOpcode = [];
        let fileStr: string = await IOUtils.readFile(fullName);

        let sb = "";

        let isMsgStart = false;
        let strArr = fileStr.split('\n');
        // let map: Map<number, string> = new Map();
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
                let ss: string[] = newline.split("IName:");

                if (ss.length == 2) {
                    parentClass = ss[1].trim();
                    // console.log("parentClass", parentClass);
                }

                let code = 0;
                if (msgName.startsWith("Pt")) {
                    let fileName2 = fileName.replace(/\d+/g, '')
                    fileName2 = fileName2.replace(".proto", ""); //proto的文件名

                    // msgName = msgName.replace("Pt", "Pt" + fileName2);
                    if (parentClass == "") {
                        parentClass = msgName.replace("Pt", fileName2);
                    }
                    let nums = StringUtils.getStrNum(msgName);//协议消息的数字 如 38001
                    let nums2 = StringUtils.getStrNum(fileName);
                    protoName = "Pt" + nums2 + fileName2;
                    console.log("protoName", protoName, nums2, fileName2)
                    // code = nums[0] * 100 + nums[1];
                    code = nums as number;
                    parentClass += code;
                    msgOpcode.push({ Name: parentClass, Opcode: code });

                }else{
                    let fileName2 = fileName.replace(/\d+/g, '')
                    fileName2 = fileName2.replace(".proto", "");
                    protoName = "Pt" + fileName2;
                }
                continue;
            }
        }


        // export enum TestProtoID {
        //     none = 0,
        // }

        sb += ("export enum " + protoName + " {\n");
        for (let info of msgOpcode) {
            sb += (`\t${info.Name} = ${info.Opcode}, \n`);
        }

        sb += ("}\n");

        this.GenerateCS(sb, InnerProto2CS.serverMessagePath, protoName);
    }

    private static GenerateCS(text: string, outpath: string, protoName: string) {
        // let dirName = protoName.replace(/[^a-zA-Z]/g, "");
        // if (!IOUtils.fileOrFolderIsExsit(`${outpath}\\${dirName}\\Server\\Proto`)) {
        //     IOUtils.makeDir(`${outpath}\\${dirName}\\Server\\Proto`);
        // } else {
        //     IOUtils.deleteFolderFile(`${outpath}\\${dirName}\\Server\\Proto`, false);
        // }
        // IOUtils.writeTextFile(`${outpath}\\${dirName}\\Server\\Proto\\${protoName}.cs`, text);

        // let dirName = protoName.replace(/[^a-zA-Z]/g, "");
        if (!IOUtils.fileOrFolderIsExsit(`${outpath}`)) {
            IOUtils.makeDir(`${outpath}`);
        } else {
            IOUtils.deleteFile(`${outpath}\\${protoName}.ts`);
        }
        IOUtils.writeTextFile(`${outpath}\\${protoName}.ts`, text);
    }

    private static MapData(ns: string, newline: string) {
        let newStr = "";
        let start = newline.indexOf("<") + 1;
        let end = newline.indexOf(">");
        let types = newline.substring(start, end - start);
        let ss: string[] = types.split(",");
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

    private static Repeated(ns: string, newline: string) {
        let newStr = "";
        try {
            // let index = newline.indexOf(";");
            // newline = newline.Remove(index);
            newline = newline.replace(";", "");
            let ss: string[] = newline.split(/\s+/);
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

    private static ConvertType(type: string): string {
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

    //对应类型的默认值
    private static ConvertTypeDefault(type: string): string {
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

    private static Members(newline: string, isRequired: boolean) {
        let newStr = "";
        try {
            // let index = newline.indexOf(";");
            newline = newline.replace(";", "");
            let ss: string[] = newline.split(/\s+/);
            // console.log("ss", ss,);
            // let pro = ss[0];//required optional  暂时都算required了
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



// InnerMessage.proto生成cs代码
InnerProto2CS.Proto2CS();
console.log("proto2cs over!");