export enum DatabaseEvent {
	OnFindOneData = "OnFindOneData",
	OnFindOneDataByObject = "OnFindOneDataByObject",
	OnFindAllData = "OnFindAllData",
	OnInsertOneData = "OnInsertOneData",
	OnUpdateOneData = "OnUpdateOneData",
	OnDeleteOneData = "OnDeleteOneData",
	OnGetNewUid = "OnGetNewUid",//参数 获取的UID个数
	OnDeleteAssetCache = "OnDeleteAssetCache",//参数 roleUid assetUid
	OnDeleteManyData = "OnDeleteManyData",
	OnGetOnlyNextId = "OnGetOnlyNextId", // 获取唯一ID
	OnCount = "OnCount",
	OnDistinct = "OnDistinct",
}