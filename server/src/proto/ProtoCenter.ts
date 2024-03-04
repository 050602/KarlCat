import { Sigleton } from "../core/Sigleton";

//该类不支持热更新啊啊啊啊
export class ProtoCenter extends Sigleton{
	public static SigletonInsName = "ProtoCenter";
		public static get Instance(): ProtoCenter {
			return this.getInstance();
		}
	// private static _sigleton: ProtoCenter;
	// public static get Instance(): ProtoCenter {
	// 	if (!ProtoCenter._sigleton) {
	// 		ProtoCenter._sigleton = new ProtoCenter();
	// 		ProtoCenter._sigleton.initInstance();
	// 	}
	// 	return ProtoCenter._sigleton;
	// }

	public lanlu: any;
	//当实例初始化时
	public initInstance() {
		let file = require("./protobuf/proto.js");
		this.lanlu = file.lanluproto;
		// console.log("ProtoCenter initInstance Succ");
	};

	//当实例被销毁时
	public destoryInstance() {
		this.lanlu = null;
	};

}


