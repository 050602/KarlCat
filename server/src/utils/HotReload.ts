import * as fs from "fs";
import * as path from "path";
import * as vm from "vm";
import { execFile } from "child_process";
import { errLog, errStackLog, gzaLog, logInfo, logServerEx, warningLog } from "../LogTS";
import { app, isDebug } from "../app";
import { BaseServerLogic } from "../components/BaseServerLogic";
// import { ConfigMgr } from "../config/ConfigMgr";
// import { DeleteRoleCache } from "../database/DeleteRoleCache";
import { RpcEvent } from "../event/RpcEvent";
import { ProtoCenter } from "../proto/ProtoCenter";
import { RegisterSigleton } from "../register/RegisterSigleton";
// import { SkillMgr } from "../servers/Fight/SkillMgr";
// import { MapMgr } from "../servers/Fight/map/MapMgr";
import { CommonUtils } from "./CommonUtils";
import { DateUtils } from "./DateUtils";
import { TSEventCenter } from "./TSEventCenter";
import { TickTask } from "./TickTask";
import { FileUtils } from "./FileUtils";
import { CoroutineLock } from "./CoroutineLock";
import { hotConfigPath, hotConfigScriptPath, hotFightScriptPath, hotProtoPath, hotScriptPath } from "../const/PathConst";
import * as crypto from "crypto";
import { ConfigLoader } from "./ConfigLoader";
import { ServerType } from "../register/route";



export class HotReload extends BaseServerLogic {
	public static get Instance(): HotReload {
		return this.getInstance();
	}

	private doCopyTime: number = null;
	private doCopyCd: number = 12;
	private timerId: NodeJS.Timeout;

	//当实例初始化时
	public initInstance() {
		// global.gc();
		TSEventCenter.Instance.bind(RpcEvent.OnHotReload, this, this.onHotReloadCMD);
		if (isDebug && !CommonUtils.isLinux()) {
			this.watchFile();
		}

		if (!isDebug) {
			//三个钟备份一次 
			// if (app.serverInfo.serverType == ServerType.dbCopy) {
			// 	let todayZero = DateUtils.getTodayZeroSecond();
			// 	let now = new Date();
			// 	let nextZero = todayZero + now.getHours() * 3600 + (3600 * this.doCopyCd) + 1800; //下一次的半小时备份
			// 	this.doCopyTime = nextZero * 1000;
			// 	TickTask.Instance.pushTask(this, this.doCopy, this.doCopyTime);
			// 	logServer("do Copy pushTask", this.doCopyTime);
			// }
			this.timerId = setInterval(() => {
				let last = Date.now();
				//使用TTL 会自动抛弃，不需要以下操作了
				// switch (app.serverInfo.serverType) {
				// 	case ServerType.gate:
				// 		UserModel.Instance.userDataCache.purgeStale();
				// 		UserModel.Instance.userDataLoginCache.purgeStale();
				// 		break;
				// 	case ServerType.social:
				// 		RoleSaveDataModel.Instance.roleSaveDataCache.purgeStale();
				// 		RoleSettingModel.Instance.settingCache.purgeStale();
				// 		SocialModel.Instance.socialCache.purgeStale();
				// 		UserModel.Instance.userDataCache.purgeStale();
				// 		CastleRoleModel.Instance.castleRoleCache.purgeStale();
				// 		UnionRoleModel.Instance.unionRoleCache.purgeStale();
				// 		ActivityModel.Instance.activityCache.purgeStale();
				// 		RoleCacheModel.Instance.roleCacheCache.purgeStale();
				// 		break;
				// 	case ServerType.scenarios:
				// 		RoleModel.Instance.roleCache.purgeStale();
				// 		UserModel.Instance.userDataCache.purgeStale();
				// 		UnionRoleModel.Instance.unionRoleCache.purgeStale();
				// 		break;
				// 	case ServerType.logic:
				// 		AchievementModel.Instance.achievementCache.purgeStale();
				// 		ActivityModel.Instance.activityCache.purgeStale();
				// 		AssetModel.Instance.assetCache.purgeStale();
				// 		CastleRoleModel.Instance.castleRoleCache.purgeStale();
				// 		ChallengeTowerModel.Instance.towerCache.purgeStale();
				// 		DailyMissionModel.Instance.dailyMissionCache.purgeStale();
				// 		DayResetModel.Instance.dayRestCache.purgeStale();
				// 		DeadmanModel.Instance.dataCache.purgeStale();
				// 		DrawModel.Instance.drawCache.purgeStale();
				// 		ElementModel.Instance.elementCache.purgeStale();
				// 		ElfModel.Instance.elfCache.purgeStale();
				// 		FontColorModel.Instance.FontColorCache.purgeStale();
				// 		LifeSimulatorModel.Instance.lifeSimulatorCache.purgeStale();
				// 		LoongModel.Instance.loongCache.purgeStale();
				// 		MailModel.Instance.mailCache.purgeStale();
				// 		RoleCacheModel.Instance.roleCacheCache.purgeStale();
				// 		RoleModel.Instance.roleCache.purgeStale();
				// 		RoleModel.Instance.attrMergeCache.purgeStale();
				// 		RoleSaveDataModel.Instance.roleSaveDataCache.purgeStale();
				// 		RoleSettingModel.Instance.settingCache.purgeStale();
				// 		SecProfessionModel.Instance.modelCache.purgeStale();
				// 		SkillModel.Instance.skillCache.purgeStale();
				// 		SocialModel.Instance.socialCache.purgeStale();
				// 		StoreModel.Instance.storeCache.purgeStale();
				// 		UnionRoleModel.Instance.unionRoleCache.purgeStale();
				// 		UserModel.Instance.userDataCache.purgeStale();
				// 		break;
				// 	default:
				// 		RoleSaveDataModel.Instance.roleSaveDataCache.purgeStale();
				// 		RoleModel.Instance.roleCache.purgeStale();
				// 		UserModel.Instance.userDataCache.purgeStale();
				// 		break;
				// }


				global.gc();
				if (app.serverType != ServerType.master)
					logServerEx("gc Time(ms):", Date.now() - last);
			}, 10 * 60 * 1000);


			// if (app.serverInfo.serverType == ServerType.logic) {
			// 	AchievementModel.Instance.achievementCache.clear();
			// 	ActivityModel.Instance.activityCache.clear();
			// 	AssetModel.Instance.assetCache.clear();
			// 	CastleRoleModel.Instance.castleRoleCache.clear();
			// 	ChallengeTowerModel.Instance.towerCache.clear();
			// 	DailyMissionModel.Instance.dailyMissionCache.clear();
			// 	DayResetModel.Instance.dayRestCache.clear();
			// 	DeadmanModel.Instance.dataCache.clear();
			// 	DrawModel.Instance.drawCache.clear();
			// 	ElementModel.Instance.elementCache.clear();
			// 	ElfModel.Instance.elfCache.clear();
			// 	FontColorModel.Instance.FontColorCache.clear();
			// 	LifeSimulatorModel.Instance.lifeSimulatorCache.clear();
			// 	LoongModel.Instance.loongCache.clear();
			// 	MailModel.Instance.mailCache.clear();
			// 	RoleCacheModel.Instance.roleCacheCache.clear();
			// 	RoleModel.Instance.roleCache.clear();
			// 	RoleModel.Instance.attrMergeCache.clear();
			// 	RoleSaveDataModel.Instance.roleSaveDataCache.clear();
			// 	RoleSettingModel.Instance.settingCache.clear();
			// 	SecProfessionModel.Instance.modelCache.clear();
			// 	SkillModel.Instance.skillCache.clear();
			// 	SocialModel.Instance.socialCache.clear();
			// 	StoreModel.Instance.storeCache.clear();
			// 	UnionRoleModel.Instance.unionRoleCache.clear();
			// 	UserModel.Instance.userDataCache.clear();
			// }
		}

	}

	//当实例被销毁时
	public destoryInstance() {
		TSEventCenter.Instance.unbind(RpcEvent.OnHotReload, this);
		// if (app.serverInfo.serverType == ServerType.dbCopy) {
		// 	TickTask.Instance.removeTask(this, this.doCopy, this.doCopyTime);
		// 	this.doCopyTime = null;
		// }
		if (this.timerId != null) {
			clearInterval(this.timerId);
		}
	}

	public lock: Map<string, number>;
	public jsFile: Map<string, string>;
	private coroutineLock: CoroutineLock;
	public async watchFile() {
		if (app.serverType == ServerType.master) {
			return;
		}
		this.coroutineLock = new CoroutineLock();
		let _fileList = [];
		let _sheetFileExts: string[] = [".js"];
		this.jsFile = new Map();
		FileUtils.Instance.findFile("./dist/servers", _sheetFileExts, _fileList);
		for (let n = 0; n < _fileList.length; n++) {
			let filePath: string = _fileList[n];
			let text: string = await FileUtils.Instance.readFile(filePath);
			this.jsFile.set(filePath, text);
		}
		_fileList.length = 0;

		FileUtils.Instance.findFile("./dist/modelLogic", _sheetFileExts, _fileList);
		for (let n = 0; n < _fileList.length; n++) {
			let filePath: string = _fileList[n];
			let text: string = await FileUtils.Instance.readFile(filePath);
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
					let now = DateUtils.msSysTick;
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


					let file = await FileUtils.Instance.readFile(hotScriptPath + filename);
					let lastFile = this.jsFile.get("dist\\" + filename);
					if (lastFile != file) {
						this.makeLoadedCls(hotScriptPath + filename);
						this.jsFile.set(filename, file);
						// console.log(app.serverInfo.serverName, "文件真的发生了变化", filename);
					}
					this.lock.set(filename, now);
				} catch (err) {
					errStackLog(err?.message);
				}
				this.coroutineLock.unlock();
			}
			func();


		}))
	}

	public makeLoadedCls(filename: string) { //编译方法
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

	public async makeUnloadCls(filename: string) { //编译方法
		// console.log(filename + '文件已被编译');
		let regex = /(\w+\.js)/;
		let match = filename.match(regex);
		if (match) {
			let fileName2 = match[1];
			// console.log(fileName2); // 输出：FightClient.js
			let insName = fileName2.split(".js")[0];
			let path = filename.split(".js")[0];
			//判断是否有实例，有实例就别瞎几把处理了
			let ins = app.InstanceMap.get(insName);
			if (!ins) {
				// console.log("加载未加载的类:", insName);
				await HotReload.loadHandler(path, insName);
			}
		}

	}

	public doCopy() {
		let todayZero = DateUtils.getTodayZeroSecond();
		let now = new Date();
		let nextZero = todayZero + now.getHours() * 3600 + (3600 * this.doCopyCd) + 1800; //下一次的半小时备份
		this.doCopyTime = nextZero * 1000;
		TickTask.Instance.pushTask(this, this.doCopy, this.doCopyTime);
		// logServer("do Copy pushTask", nextZero);

		let backupPath = "./DBCopy/" + DateUtils.formatFullTimeByNow("-");
		if (!this.isSafeBackupPath(backupPath)) {
			errLog("do db copy path illegal", backupPath);
			return;
		}
		void this.runDbBackup(backupPath);
	}

	private isSafeBackupPath(backupPath: string): boolean {
		return /^\.\/DBCopy\/\d{4}-\d{2}-\d{2}-\d{2}-\d{2}$/.test(backupPath);
	}

	private async runDbBackup(backupPath: string) {
		try {
			let exists = true;
			try {
				await fs.promises.access(backupPath, fs.constants.F_OK);
			} catch {
				exists = false;
			}
			if (!exists) {
				await fs.promises.mkdir(backupPath, { recursive: true });
			}

			await this.execFileAsync("mongodump", ["-h", "127.0.0.1:27017", "-d", "LordDB", "-o", backupPath]);
			await this.execFileAsync("zip", ["-r", `${backupPath}.zip`, backupPath]);
			await this.execFileAsync("svn", ["add", `${backupPath}.zip`]);
			await fs.promises.rm(backupPath, { recursive: true, force: true });
			await this.execFileAsync("svn", ["commit", "./DBCopy", "-m", `数据库备份${backupPath}`]);
			console.log("do db copy: success", backupPath);
		} catch (error) {
			errLog("do db copy failed", backupPath, error);
			console.error("do db copy failed", backupPath, error);
		}
	}

	private execFileAsync(command: string, args: string[]): Promise<void> {
		return new Promise((resolve, reject) => {
			execFile(command, args, (error, stdout, stderr) => {
				if (stdout) {
					console.log(stdout);
				}
				if (stderr) {
					console.error(stderr);
				}
				if (error) {
					reject(error);
					return;
				}
				resolve();
			});
		});
	}

	//当实例被热更新时
	public async onHotReloadCMD(cmd: string) {
		//  ../
		console.log(`${DateUtils.formatFullTime6()} onHotReloadCMD cmd值:`, app.serverInfo.serverName, cmd);
		if (!cmd) {
			warningLog("on HotReloadCMD cmd值为空", cmd);
			console.log("on HotReloadCMD cmd值为空", cmd);
			return;
		}

		try {
			let jsons: [{ path?: string, sigName?: string, type: number, serverName?: string, uids?: number[], userNames?: string[] }] = JSON.parse(cmd);
			// logTest("on HotReloadCMD", cmd);
			// {"path": "Fight/Fight.js","sigName": "Fight","type": 1}
			// let json = {
			// 	path: "Fight/Fight.js",//文件路径
			// 	sigName: "Fight",//单例名称
			// 	type: 1,//1单例类 2 配置表 3 地图配置 4 技能配置 5战斗
			// }
			// {"path":  "Config.json","sigName": "Config","type": 2}
			// let json: { path?: string, sigName?: string, type: number } = {
			// 	// path: "Config.json",//文件路径
			// 	// sigName: "Config",//单例名称
			// 	type: 2,//1单例类 2 配置表 3 地图配置 4 技能配置 5战斗
			// }
			// {"path":  "Map/Z1M1_CaoDi_01.json","sigName": "Z1M1_CaoDi_01","type": 3}
			// let json: { path?: string, sigName?: string, type: number } = {
			// 	path: "Map/Z1M1_CaoDi_01.json",//文件路径
			// 	sigName: "Z1M1_CaoDi_01",//单例名称
			// 	type: 3,//1单例类 2 配置表 3 地图配置 4 技能配置 5战斗
			// }
			// {"path":  "Skill/10000.json","sigName": "10000","type": 4}
			// let json: { path?: string, sigName?: string, type: number } = {
			// 	path: "Skill/10000.json",//文件路径
			// 	sigName: "10000",//单例名称
			// 	type: 4,//1单例类 2 配置表 3 地图配置 4 技能配置 5战斗
			// }

			logServerEx("HotReload", app.serverInfo.serverName, cmd);
			for (let i = 0; i < jsons.length; i++) {
				let json = jsons[i];

				switch (json.type) {
					case 1: {
						HotReload.loadHandler(hotScriptPath + json.path, json.sigName);
						// app.rpc(ServerType.background + "-1", RpcEvent.BGToast, app.serverInfo.serverName + "HotReload Script Succ");
					}
						break;
					case 2: {
						let time = Date.now();
						await ConfigLoader.Instance.initConfig();
						let time2 = Date.now();
						logServerEx("热更新配置耗时:", time2 - time);

						// app.rpc(ServerType.background + "-1", RpcEvent.BGToast, app.serverInfo.serverName + "HotReload Config_Unpacked Succ");
					}
						break;
					case 3:
					case 4: {
						HotReload.loadConfigHandler(hotConfigPath + json.path, json.type, json.sigName);
						// app.rpc(ServerType.background + "-1", RpcEvent.BGToast, app.serverInfo.serverName + "HotReload Map/SkillConfig Succ");
					}
						break;
					case 5:
						// if (app.serverType == ServerType.fight) {
						// 	HotReload.loadFightHandler();
						// 	app.rpc(ServerType.background + "-1", RpcEvent.BGToast, "HotReload Fight Succ");
						// }
						break;
					case 6:
						// {
						// 	if (app.serverInfo.serverType != ServerType.line) {
						// 		return;
						// 	}
						// 	let exec = require('child_process').exec;
						// 	let cmd = 'svn update';

						// 	exec(cmd, function (error, stdout, stderr) {
						// 		// 获取命令执行的输出
						// 		let txt = "do svn update:" + "\n" + stdout + "\n" + error + "\n" + stderr;
						// 		logServerEx(txt);
						// 		app.rpc(ServerType.background + "-1", RpcEvent.BGToast, txt);
						// 	});
						// }

						break;
					case 7:
						{
							// if (app.serverInfo.serverType != ServerType.dbCopy) {
							// 	return;
							// }
							// gzaLog("数据库备份", app.serverInfo.serverType);
							// let path = "./DBCopy/" + DateUtils.formatFullTimeByNow("-");
							// fs.opendir(path, (err, dir) => {
							// 	if (err) {
							// 		if (err.code == "ENOENT") {
							// 			//执行数据库备份
							// 			let exec = require('child_process').exec;
							// 			let cmd = `mkdir ${path} && mongodump -h 127.0.0.1:27017 -d LordDB -o ${path} && zip -r ${path}.zip ${path}  && svn  add ${path}.zip && rm -rf ${path} && svn commit ./DBCopy/* -m "数据库备份${path}"`;

							// 			exec(cmd, function (error, stdout, stderr) {
							// 				// 获取命令执行的输出
							// 				let txt = "do db copy:" + "\n" + stdout + "\n" + error + "\n" + stderr;
							// 				warningLog(txt);
							// 				console.log(txt);
							// 				app.rpc(ServerType.background + "-1", RpcEvent.BGToast, txt);
							// 			});
							// 		}
							// 	} else {
							// 		//执行数据库备份
							// 		let exec = require('child_process').exec;
							// 		let cmd = `mongodump -h 127.0.0.1:27017 -d LordDB -o ${path} && zip -r ${path}.zip ${path}  && svn  add ${path}.zip && rm -rf ${path} && svn commit ./DBCopy/* -m "数据库备份${path}"`;

							// 		exec(cmd, function (error, stdout, stderr) {
							// 			// 获取命令执行的输出
							// 			let txt = "do db copy:" + "\n" + stdout + "\n" + error + "\n" + stderr;
							// 			warningLog(txt);
							// 			console.log(txt);
							// 			app.rpc(ServerType.background + "-1", RpcEvent.BGToast, txt);
							// 		});
							// 	}
							// })

						}

						break;
					case 8:
						// {
						// 	//杀进程
						// 	if (app.serverInfo.serverName != json.serverName) {
						// 		logServerEx("请输入正确的serverName", app.serverInfo.serverName, json.serverName);
						// 		return;
						// 	}

						// 	let txt = "do kill Process " + app.serverInfo.serverName;
						// 	warningLog(txt);
						// 	app.rpc(ServerType.background + "-1", RpcEvent.BGToast, txt);
						// 	await CommonUtils.sleep(2000);
						// 	logServerEx(txt);
						// 	process.exit();
						// }
					case 9:
						{
						// 	//启动进程
						// 	if (app.serverInfo.serverType != ServerType.background) {
						// 		logServerEx("非法启动", app.serverInfo.serverName, json.serverName);
						// 		return;
						// 	}

						// 	logServerEx("执行子进程启动", app.serverInfo.serverName, json.serverName);
						// 	let exec = require('child_process').exec;
						// 	// json.serverName
						// 	let cmd = `node ./dist/app.js serverName=${json.serverName} env=${app.env}`
						// 	exec(cmd, function (error, stdout, stderr) {
						// 		// 获取命令执行的输出
						// 		let txt = "do start Node:" + "\n" + stdout + "\n" + error + "\n" + stderr;
						// 		logServerEx(txt);
						// 		app.rpc(ServerType.background + "-1", RpcEvent.BGToast, txt);
						// 	});


						}
					case 10: {
						logServerEx("执行热更新配置及结构");
						fs.readFile(hotConfigScriptPath, async (err, data2: any) => {
							if (err) {
								logServerEx("热更新加载代码文件失败", "ConfigMgr", err);
							} else {
								try {
									// 使用vm模块的Script方法来预编译发生变化后的文件代码，检查语法错误，提前发现是否存在语法错误等报错
									new vm.Script(data2);
								} catch (e) {
									// 语法错误,编译失败
									logServerEx("热更新 vm.Script 加载文件失败", err);
									return;
								}
								// 编译通过后，重新require加载最新的代码 doUpdateScript里有执行了resolve 不需要在此执行
								HotReload.doUpdateScript(hotConfigScriptPath, "ConfigMgr");
								RegisterSigleton.onHotReload(hotConfigScriptPath, "ConfigMgr");

								let time = Date.now();
								await ConfigLoader.Instance.initConfig();
								let time2 = Date.now();
								logServerEx("热更新配置及结构耗时:", time2 - time);
								// app.rpc(ServerType.background + "-1", RpcEvent.BGToast, app.serverInfo.serverName + "HotReload Config_Unpacked Succ");
							}
						});

					}
						break;
					case 11: {
						//热更协议
						HotReload.loadProtoHandler(json.sigName);
						// app.rpc(ServerType.background + "-1", RpcEvent.BGToast, app.serverInfo.serverName + "HotReload Proto Succ");
					}
						break;
					// 删除DBS的角色缓存
					case 12: {
						//删除缓存
						// HotReload.loadProtoHandler(json.sigName);						
						// if (app.serverInfo.serverName.startsWith("database-")) {
						// 	if (DeleteRoleCache.Instance.deleteRoleCache(json.uids)) {
						// 		app.rpc(ServerType.background + "-1", RpcEvent.BGToast, app.serverInfo.serverName + "HotReload Delete Cache Succ");
						// 	} else {
						// 		app.rpc(ServerType.background + "-1", RpcEvent.BGToast, app.serverInfo.serverName + "HotReload Delete Cache fail");
						// 	}

						// } else {
						// 	app.rpc(ServerType.background + "-1", RpcEvent.BGToast, app.serverInfo.serverName + "HotReload Delete Cache Only database");
						// }
					}
						break;
					case 13: {
						//删除帐号缓存
						// HotReload.loadProtoHandler(json.sigName);						
						// if (app.serverInfo.serverName.startsWith("database-")) {
						// 	if (DeleteRoleCache.Instance.deleteUserTableache(json.userNames)) {
						// 		app.rpc(ServerType.background + "-1", RpcEvent.BGToast, app.serverInfo.serverName + "HotReload deleteUserTableache Cache Succ");
						// 	} else {
						// 		app.rpc(ServerType.background + "-1", RpcEvent.BGToast, app.serverInfo.serverName + "HotReload deleteUserTableache Cache fail");
						// 	}

						// } else {
						// 	app.rpc(ServerType.background + "-1", RpcEvent.BGToast, app.serverInfo.serverName + "HotReload deleteUserTableache Cache Only database");
						// }
					}
						break;
					default:
						logServerEx("无效的热更新", json);
						break;
				}
				logServerEx(`reload 执行了HotReload`, JSON.stringify(json));
				// reloadLog(JSON.stringify(json));
			}
		} catch (error) {
			logServerEx(`onHotReloadCMD error`, error);
		}
	}

	// 加载指定文件的代码
	private static loadHandler(filename: string, insName: string) {
		let newPath = filename + ".js"
		return new Promise((resolve, reject) => {
			fs.readFile(newPath, async (err, data: any) => {
				if (err) {
					errLog("热更新加载文件失败", err);
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

					try {
						// 使用vm模块的Script方法来预编译发生变化后的文件代码，检查语法错误，提前发现是否存在语法错误等报错
						this.doUpdateScript(newPath, insName);
						RegisterSigleton.onHotReload(newPath, insName);
					} catch (e) {
						// 语法错误,编译失败
						errLog("执行Reload时发生错误:", e);
					}

					resolve(null);
					// resolve(require(newPath));

				}
			});
		});
	}

	private static loadProtoHandler(insName: string) {
		let newPath = hotProtoPath + insName + ".js"
		return new Promise((resolve, reject) => {
			fs.readFile(newPath, async (err, data: any) => {
				if (err) {
					errLog("热更新加载文件失败", err);
					console.log("热更新加载代码文件失败", insName, err);
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
					ProtoCenter.Instance.initInstance();
				}
			});
		});
	}

	private static loadFightHandler() {
		return new Promise((resolve, reject) => {
			fs.readFile(hotFightScriptPath, async (err, data: any) => {
				if (err) {
					errLog("热更新加载文件失败", err);
					console.log("热更新加载Fight文件失败", err);
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
					// resolve(require(hotFightScriptPath));
					await this.doUpdateScript(hotFightScriptPath, "Fight");
					RegisterSigleton.onHotReload(hotFightScriptPath, "Fight");
					logInfo("重新加载Fight", hotFightScriptPath);
					console.log("重新加载Fight", hotFightScriptPath);
				}
			});
		});
	}

	private static loadConfigHandler(path: string, type: number, filename: string) {
		return new Promise((resolve, reject) => {
			fs.readFile(path, async (err, data: any) => {
				if (err) {
					errLog("热更新加载文件失败", err);
					console.log("热更新加载文件失败", err);
					resolve(null);
				} else {
					if (type == 3) {
						let time = Date.now();
						// MapMgr.Instance.onHotReloadMap(filename);
						let time2 = Date.now();
						warningLog("热更新地图配置耗时:", time2 - time);
						console.log("热更新地图配置耗时:", time2 - time);
					} else if (type == 4) {
						let time = Date.now();
						// SkillMgr.Instance.onHotReloadSkill(filename, data);
						let time2 = Date.now();
						warningLog("热更新技能配置耗时:", time2 - time);
						console.log("热更新技能配置耗时:", time2 - time);
					}
					// else if (type == 10) {
					// 	fs.readFile(hotConfigScriptPath, async (err, data2: any) => {
					// 		if (err) {
					// 			errLog("热更新加载文件失败", err);
					// 			console.log("热更新加载代码文件失败", "ConfigMgr", err);
					// 			resolve(null);
					// 		} else {
					// 			try {
					// 				// 使用vm模块的Script方法来预编译发生变化后的文件代码，检查语法错误，提前发现是否存在语法错误等报错
					// 				new vm.Script(data2);
					// 			} catch (e) {
					// 				// 语法错误,编译失败
					// 				reject(e);
					// 				return;
					// 			}
					// 			// 编译通过后，重新require加载最新的代码 doUpdateScript里有执行了resolve 不需要在此执行
					// 			// resolve(require(hotConfigScriptPath));
					// 			this.doUpdateScript(hotConfigScriptPath, "ConfigMgr");
					// 			RegisterSigleton.onHotReload(hotConfigScriptPath, "ConfigMgr");

					// 			let time = Date.now();
					// 			// ConfigMgr.Instance.parse_Unpacked(JSON.parse(data));
					// 			await ConfigLoader.Instance.initConfig();
					// 			let time2 = Date.now();
					// 			warningLog("热更新配置及结构耗时:", time2 - time);
					// 			console.log("热更新配置及结构耗时:", time2 - time);
					// 		}
					// 	});
					// } else {
					// 	let time = Date.now();
					// 	// ConfigMgr.Instance.parse_Unpacked(JSON.parse(data));
					// 	await ConfigLoader.Instance.initConfig();
					// 	let time2 = Date.now();
					// 	warningLog("热更新配置耗时:", time2 - time);
					// 	console.log("热更新配置耗时:", time2 - time);
					// }
				}
			});
		});
	}

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

		console.log(app.serverInfo.serverName, `${DateUtils.formatFullTime6()} 热重载代码文件 0.1：`, targetFile);

		let content: string = await FileUtils.Instance.readFile(targetFile);
		let strMd5 = crypto.createHash('md5').update(content).digest('hex');
		let detail: string = `${DateUtils.formatFullTime6()} 热重载代码文件 0.2：${targetFile}, ${strMd5}`;
		// reloadDetailLog(detail);
	}

	// loadHandlers()
}
