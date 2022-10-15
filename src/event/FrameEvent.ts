export enum FrameEvent {
	/**
	 * 当当前服务器与其他服务器断开RPC链接时
	 */
	onRemoveServer = "onRemoveServer",
	/**
 	* 当所有服务器启动完毕
 	*/
	onStartAll = "onStartAll",
	/**
 	* 当当前服务器与其他服务器建立RPC链接时
 	*/
	onAddServer = "onAddServer",

	// StartServer = "StartServer",//启动服务器（物理意义）---正式版本再实现，需要分离Master服才能支持
	// OpenServer = "OpenServer",//开放服务器（对玩家来说）
	// CloseServer = "CloseServer",//关闭服务器（对玩家来说）
	// StopServer = "StopServer",//停止服务器（物理意义）
}