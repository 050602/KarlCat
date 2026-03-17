# KarlCat
### 18岁亦菲！
version : 2.4.2

卡尔猫，基于开源Nodejs服务端框架 Mydog 魔改而成，支持跨服，有完善的跨服相关代码注释

nodejs一把梭，当你还在苦苦为其他语言的各种特性考虑时，用NodeJs早已上线验证了
想要学习后端思维，可以先用Nodejs这个较低技术学习成本的东西跑一遍，游戏后端的思想是相似的，只要学会了KarlCat，转换到其他语言框架，经验也能用得上，懂我意思吧？听懂掌声，来给star谢谢

基本使用TypeScript开发，仅有个别类库使用js , dist目录是通过src目录编译出来的js

目前支持使用TCP KCP WebSocket 协议

使用了Protobuf 作为 协议传输工具

使用MongoDB 作为 数据库

使用kL的开源配置工具--目前没有示例在卡尔猫
https://github.com/gh-kL/GameConfig

其实现在都AI时代了，让AI看代码，一切都搞得定，目前项目根目录下的CLAUDE.md，有写如何部署跨服，自己看吧


以下是正文：


KarlCat（卡尔猫）是一个基于 TypeScript + Node.js 的分布式多人游戏服务端框架。

- 技术栈：Node.js、TypeScript、MongoDB（Mongoose）、protobufjs
- 传输层：TCP / WebSocket / KCP
- 架构来源：pomelo -> pinus -> mydog -> karlcat
- 当前定位：纯框架，不内置具体业务玩法

## 纯框架原则

1. 框架默认不注入业务表和业务逻辑。
2. `server/src/database/` 中的业务相关实现可作为示例，不代表必须启用。
3. 业务功能需在业务分支或部署层显式接入。

## 快速开始

### 1. 安装依赖

```bash
cd server
npm install
```

### 2. 编译与启动

```bash
npm start                                # tsc + node ./dist/app.js
npx tsc                                  # 仅编译
node ./dist/app.js serverName=<name> env=<env>
```

示例：

```bash
node ./dist/app.js serverName=logic-1 env=dev
```

### 3. 生成 Protobuf（Windows）

```bash
cd proto
gen_server.bat
```

## 目录结构

| 路径 | 说明 |
|---|---|
| `server/src/` | 服务端源码 |
| `server/src/components/` | 连接、RPC、路由等基础组件 |
| `server/src/database/` | Table 层（仅数据库服执行） |
| `server/src/model/` | Model 层（逻辑服通过 RPC 访问 DB） |
| `server/src/modelLogic/` | 业务入口层（缓存与流程组织） |
| `server/src/register/` | 路由与单例注册 |
| `proto/` | 协议与生成脚本 |
| `Csharp/` | Unity 客户端网络示例（`NetworkManager.cs`） |

## 核心架构

### 多进程分布式

各服务器类型独立进程，通过 RPC 通信：

- `database`：数据库访问入口
- `gate`：客户端接入与消息转发
- `logic`：核心业务逻辑
- `cross/social/fight/rankList/...`：扩展服务类型

### 三层数据访问模型

```text
Table(DB服)  <--RPC-->  Model(逻辑服)  <--调用-->  ModelLogic(业务层)
```

约束：非数据库服禁止直连 MongoDB，统一经 `app.rpcDB()` 访问。

## 协议与路由

- Client -> Server 帧：`4字节长度 + 1字节类型 + 负载`
- Server -> Server：`app.rpc()` / `app.rpcAwait()` / `app.rpcDB()`
- 主键路由映射：`server/src/register/route.ts`

## 跨服设计（双集群）

适用场景：A、B 两套独立部署（不同物理机），玩家参与同一跨服玩法。

推荐结构：

1. A、B 各自保留完整业务集群（gate/logic/database...）。
2. 增加跨服中心权威层（可命名 `realCross` / `crossHub`）。
3. 各区 `cross` 作为代理，负责请求转发与回调回落。
4. 玩家资产最终仍回写各区本地库。

### 当前框架 `realCross` 最小配置

可在 `server/serverconfig/serverconfig.json` 增加可选字段：

```json
"realCrossConfig": {
  "serverName": "realCross-1",
  "zoneId": 9001,
  "host": "10.0.0.10",
  "port": 8902,
  "serverId": 1,
  "proxyClientCmd": false
}
```

说明：

- `zoneId` 用于生成跨区连接名 `CrossNet-<zoneId>`。
- `proxyClientCmd=false` 为安全模式：仅建专线，不代理客户端协议。
- 设为 `true` 后启用框架层代理闭环（不包含具体玩法业务逻辑）。

## 最小业务接入流程

1. 新建 `XxxTable`（数据库服）并初始化 schema/model。
2. 新建 `XxxModel`（逻辑服）通过 `app.rpcDB()` 访问数据。
3. 新建 `XxxModelLogic` 组织业务流程。
4. 在对应服务器入口绑定协议处理（`bindCmd` / `bindAwait`）。

## 开发与发布注意事项

1. `tsc` 不会自动复制 `server/src/proto/protobuf/` 到 `dist`，发布时需确认产物完整。
2. 仓库当前未统一配置测试框架与 linter。
3. 建议提交前执行：

```bash
cd server
npx tsc --noEmit
```

## 上游与参考

- Mydog 文档：https://www.mydog.wiki
- Mydog 仓库：https://github.com/ahuangege/mydog

## 社区

Add QQ : 441829663

### QQ Group

* 866134350 [![KarlCat-服务端框架](https://pub.idqqimg.com/wpa/images/group.png)](https://jq.qq.com/?_wv=1027&k=Awf8ZCbt)
b.idqqimg.com/wpa/images/group.png)](https://jq.qq.com/?_wv=1027&k=Awf8ZCbt)
