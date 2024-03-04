export enum RpcEvent {
	//登录 角色相关
	OnRoleEnterGame = 1,//进入角色
	OnRoleAcitveOutLine = 2,	//玩家主动请求 退出
	OnRoleNetDisconnection = 3,// 网络波动断开
	OnCreateRole = 4,//创建角色
	//当socket断开时的rpc处理
	OnKillSocketByUid,//把没有bind uid的socket断开
	OnHotReload,

}