import * as fs from 'fs';
import * as path from 'path';
import { logDBRecover, logServerEx } from "../LogTS";
import { DBRecoverWriteInfo } from "../util/interfaceDefine";
import { DateUtils } from "../utils/DateUtils";
import { BaseTable } from './BaseTable';

export class DataLog {
    private tableName: string = "";

    private dataLogPath: string = "./logs/DBLogRecovery/";

    // 操作记录Map
    modifyRecord: Map<number, string> = new Map<number, string>();

    // 完成操作Map
    finishRecord: Map<number, boolean> = new Map<number, boolean>();

    public initTime: number = 0;

    public init(tableName: string): void {
        this.tableName = tableName;
        this.initTime = DateUtils.msSysTick;
    }

    public updateLastWriteTime() {
        this.initTime = DateUtils.msSysTick;
    }

    // 记录恢复数据
    public logDBOpt(data: DBRecoverWriteInfo): void {
        // let writeData:string = JSON.stringify(data);
        // let bsonData:Document = BSON.EJSON.serialize(data);        
        logDBRecover(data.tbName, data);
    }

    // 标记操作完成
    public MarkedOpFinish(data: DBRecoverWriteInfo): void {
        logDBRecover(data.tbName, { tbName: data.tbName, opType: "opfinish", seq: data.seq, pushTime: DateUtils.msSysTick });
    }

    /**
     * 解析行
     * @param line 
     */
    private parseLine(line: string) {
        let orderBeginIndex: number = line.indexOf("\",\"seq\":");
        let orderEndIndex: number = line.indexOf(",", orderBeginIndex + 8);
        let orderString: string = line.substring(orderBeginIndex + 8, orderEndIndex);
        let orderNumber: number = Number.parseInt(orderString);
        let opfinish: string = '{\"tbName\":\"' + this.tableName + '\",\"opType\":\"opfinish\"';
        if (line.startsWith(opfinish)) {
            this.finishRecord.set(orderNumber, true);
        } else {
            this.modifyRecord.set(orderNumber, line);
        }
    }


    /**
     * 按行读文件
     * @param fileName 
     */
    public async readFileByLine(fileName: string): Promise<void> {
        try {
            const readline = require('readline');
            const fs = require('fs')

            const fileStream = fs.createReadStream(fileName);

            const rl = readline.createInterface({
                input: fileStream,
            });

            for await (const line of rl) {
                this.parseLine(line);
            }
            fileStream.close();
        } catch (err) {
            logServerEx("parse file error", fileName, err);
        }

    }

    private async parseAllFile(lastWriteTime: number, table: BaseTable): Promise<void> {
        let files = fs.readdirSync(this.dataLogPath, 'utf8');
        let lastWriteDate: string = table.tableName + "." + DateUtils.getDateHourNowTimeStamp(lastWriteTime - 3600 * 1000);
        logServerEx("recover table", table.tableName, lastWriteDate);
        let dateLen: number = lastWriteDate.length;

        // 遍历读取到的文件列表
        for await (let file of files) {
            // 过滤压缩文件
            if (file.endsWith(".gz"))
                continue;
            if (file.startsWith(table.tableName + ".")) {
                let subFileName = file.substring(0, dateLen);
                if (lastWriteDate <= subFileName) {
                    const pathToFile = path.join(this.dataLogPath, file);
                    logServerEx("recover table file", this.tableName, lastWriteDate, pathToFile);
                    await this.readFileByLine(pathToFile);

                    let finishkeys = this.finishRecord.keys();
                    for (let key of finishkeys) {
                        if (this.modifyRecord.has(key)) {
                            this.modifyRecord.delete(key);
                            this.finishRecord.delete(key);
                        }
                    }
                }
            }
        }
    }

    /**
     * 利用文件进行数据恢复
     * @param filePath 需要遍历的文件路径
     */
    public async DataRecoverByFiles(lastWriteTime: number, table: BaseTable): Promise<void> {
        // 根据文件路径读取文件，返回一个文件列表        


        await this.parseAllFile(lastWriteTime, table);
        logServerEx("parse file finish", this.tableName);

        for (let data of this.modifyRecord) {
            if (!(table.RecoverData(data[1]))) {
                logServerEx("recover data fail:" + data[1]);
            }
        }

        this.modifyRecord.clear();
        this.finishRecord.clear();
    }
}