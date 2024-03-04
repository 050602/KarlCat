import * as fs from "fs";
import * as path from "path";
import * as vm from "vm";
import { app, isDebug } from "../app";
import { BaseServerLogic } from "../components/BaseServerLogic";
import { RpcEvent } from "../event/RpcEvent";
import { RegisterSigleton } from "../register/RegisterSigleton";
import { ServerType } from "../register/route";
import { CoroutineLock } from "./CoroutineLock";
import { DateUtils } from "./DateUtils";
import { FileUtils } from "./FileUtils";
import { TSEventCenter } from "./TSEventCenter";

const hotScriptPath = path.join(__dirname, "../");

//需要热更新功能，请调用以下的 HotReload.loadHandler 
export class HotReload extends BaseServerLogic {
	public static get Instance(): HotReload {
		return this.getInstance();
	}

	private timerId: NodeJS.Timeout;
	//当实例初始化时
	public initInstance() {
		if (isDebug) {
			this.watchFile();
		}

		if (!isDebug) {
			//自动GC
			this.timerId = setInterval(() => {
				let last = Date.now();
				global.gc();
				console.log("gc Time(ms):", Date.now() - last);
			}, 10 * 60 * 1000);

		}

	};

	//当实例被销毁时
	public destoryInstance() {
		TSEventCenter.Instance.unbind(RpcEvent.OnHotReload, this);
		if (this.timerId != null) {
			clearInterval(this.timerId);
		}
	};


	public lock: Map<string, number>;
	public jsFile: Map<string, string>;
	private coroutineLock: CoroutineLock;
	//以下代码用于热重载
	private async watchFile() {
		if (app.serverType == ServerType.master) {
			return;
		}
		this.coroutineLock = new CoroutineLock();
		let _fileList = [];
		let _sheetFileExts: string[] = [".js"];
		this.jsFile = new Map();
		FileUtils.findFile("./dist/servers", _sheetFileExts, _fileList);
		for (let n = 0; n < _fileList.length; n++) {
			let filePath: string = _fileList[n];
			let text: string = await FileUtils.readFile(filePath);
			this.jsFile.set(filePath, text);
		}
		_fileList.length = 0;

		FileUtils.findFile("./dist/modelLogic", _sheetFileExts, _fileList);
		for (let n = 0; n < _fileList.length; n++) {
			let filePath: string = _fileList[n];
			let text: string = await FileUtils.readFile(filePath);
			this.jsFile.set(filePath, text);
		}

		this.lock = new Map();
		let flag = true; //作为开关控制是否开启编译
		let t = fs.watch('./dist', {
			recursive: true
		}, ((event, filename) => {
			if (!filename) {
				return;
			}
			let func = async () => {
				await this.coroutineLock.lock();
				try {
					flag = true;
					if (filename.endsWith('js')) {
						flag = false;
					}

					const regex = /servers\\/;
					const regex2 = /modelLogic\\/;
					if (regex.test(filename) || regex2.test(filename)) {
					} else {
						// console.log("不需要处理的文件", filename);
						this.coroutineLock.unlock();
						return;
					}

					if (flag) {
						this.coroutineLock.unlock();
						return //如果当前文件不是ts文件则不进行编译
					}
					// console.log(`检测到文件变化.....变化类型为${event}文件名字是${filename}`);
					let now = DateUtils.timestamp();
					let lock = this.lock.get(filename);
					if (lock) {
						let cha = now - lock;
						//5秒CD
						// console.log("cha", cha);
						if (cha < 5000) {
							this.coroutineLock.unlock();
							return;
						}
					}


					let file = await FileUtils.readFile(hotScriptPath + filename);
					let lastFile = this.jsFile.get("dist\\" + filename);
					if (lastFile != file) {
						this.makeHotReload(hotScriptPath + filename);
						this.jsFile.set(filename, file);
						// console.log(app.serverInfo.serverName, "文件真的发生了变化", filename);
					}
					this.lock.set(filename, now);
				} catch (err) {
					console.error(err);
				}
				this.coroutineLock.unlock();
			}
			func();


		}))
	}

	//以下代码用于热重载
	private makeHotReload(filename: string) { //编译方法
		// console.log(filename + '文件已被编译');
		let regex = /(\w+\.js)/;
		let match = filename.match(regex);
		if (match) {
			let fileName2 = match[1];
			// console.log(fileName2); // 输出：FightClient.js
			let insName = fileName2.split(".")[0];
			let path = filename.split(".")[0];
			//判断是否有实例，没有实例就别瞎几把处理了
			let ins = app.InstanceMap.get(insName);
			if (ins) {
				HotReload.loadHandler(path, insName);
			}
		}

	}

	// 热更新指定代码
	public static loadHandler(filename: string, insName: string) {
		let newPath = filename + ".js"
		return new Promise((resolve, reject) => {
			fs.readFile(newPath, async (err, data: any) => {
				if (err) {
					console.error("热更新加载文件失败", err);
					console.log("热更新加载代码文件失败", filename, insName, err);
					resolve(null);
				} else {
					try {
						// 使用vm模块的Script方法来预编译发生变化后的文件代码，检查语法错误，提前发现是否存在语法错误等报错
						new vm.Script(data);
					} catch (e) {
						// 语法错误,编译失败
						reject(e);
						return;
					}
					// 编译通过后，重新require加载最新的代码 doUpdateScript里有执行了resolve 不需要在此执行
					// resolve(require(newPath));

					this.doUpdateScript(newPath, insName);
					RegisterSigleton.onHotReload(newPath, insName);

					// resolve(require(newPath));

				}
			});
		});
	};


	private static async doUpdateScript(filename: string, insName: string) {
		let ins = app.InstanceMap.get(insName);
		if (ins) {
			ins.destoryInstance();
			ins._instance = null;
			app.InstanceMap.delete(insName);
		} else {
			insName = null;
		}

		let targetFile = require.resolve(filename)

		const cacheModule = require.cache[targetFile];
		if (cacheModule && require.main) {
			module.children.splice(module.children.indexOf(cacheModule), 1);
			cacheModule.children = [];
		}
		//以下API已弃用
		// const cacheModule = require.cache[targetFile];
		// if (cacheModule && cacheModule.parent) {
		// 	cacheModule.parent.children.splice(cacheModule.parent.children.indexOf(cacheModule), 1);
		// 	cacheModule.children = [];
		// }

		require.cache[targetFile] = null;
		delete require.cache[targetFile]

		// const code: any = await HotReload.loadHandler(targetFile, insName, ins);

		console.log(app.serverInfo.serverName, "热重载代码文件：", targetFile);
	}

}


