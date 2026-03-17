# CLAUDE.md

本文件用于指导 Claude Code（claude.ai/code）在本仓库内进行开发与维护。

## 项目定位

KarlCat（卡尔猫）是基于 TypeScript + Node.js 的分布式多人游戏服务端框架。

- 技术栈：Node.js、TypeScript、MongoDB（Mongoose）、protobufjs
- 传输层：TCP / WebSocket / KCP
- 架构来源：pomelo → pinus → mydog → karlcat
- 当前原则：仓库保持“纯框架”，不内置具体业务表/业务模块

## 纯框架约束（重要）

1. 允许保留框架级扩展点，但默认不注入业务表。
2. `server/src/database/` 中若出现业务表代码，可作为示例；不要默认视为“必须启用”。
3. 评审时不要把“未启用业务表”当作缺陷，除非用户明确要求跑业务功能。

## 最小业务接入模板

在保持“纯框架”主干不变的前提下，推荐按以下最小步骤接入业务：

1. 定义 Table（数据库服）
- 新建 `XxxTable`，继承 `BaseOneKeyTable` 或 `Base2Table`（或直接 `BaseTable`）。
- 写操作统一走 WAL 包装：`insert/update/deleteRecoverOne -> MarkedXxxFinish`。
- 在 `init(db)` 中完成 schema/model 初始化，并调用 `BaseTable.initDataLog(this)`。

2. 定义 Model（逻辑服）
- 新建 `XxxModel` 继承 `BaseModel`。
- 通过 `app.rpcDB()` 调用 DB 事件，不直接访问 Mongo。
- 按需开启缓存（覆盖 `enableCache()` 和 TTL 配置）。

3. 定义 ModelLogic（业务入口）
- 新建 `XxxModelLogic` 继承 `BaseModelLogic`。
- 在此组织业务读写、缓存刷新、登出清理等流程。

4. 注册协议处理入口
- 在 `servers/<type>/` 下新增处理类，继承 `BaseServerLogic`。
- 使用 `bindCmd`/`bindAwait` 绑定协议处理函数。
- 协议主键需落入 `route.ts` 对应服务器区间。

5. 业务模块启用方式（建议）
- 不改框架主干默认行为。
- 在业务分支或部署层显式启用：实例化 `XxxTable/XxxModel/XxxModelLogic`，并在启动流程中注册。
- 未启用时，框架可运行但业务事件不可用，这属于预期行为。

### 最小代码骨架（可复制）

1. `server/src/database/XxxTable.ts`

```ts
import mongoose from "mongoose";
import { allTables } from "../app";
import { BaseTable } from "./BaseTable";

export class XxxTable extends BaseTable {
  public static get Instance(): XxxTable {
    return this.getInstance();
  }

  public async init(db: mongoose.Mongoose) {
    const schema = new mongoose.Schema({
      roleUid: { type: Number, required: true, index: true },
      value: { type: Number, default: 0 },
    });
    this.table = db.model(this.tableName, schema);
    allTables.push(this);
    BaseTable.initDataLog(this);
  }

  public async insertOne(data: any): Promise<any> {
    this.insertRecoverOne(data, { roleUid: data.roleUid });
    const ret = await super.insertOne(data);
    if (ret) {
      this.MarkedInsertFinish(data);
      this.dataLog?.updateLastWriteTime();
    }
    return ret;
  }
}
```

2. `server/src/model/XxxModel.ts`

```ts
import { BaseModel } from "./BaseModel";

export class XxxModel extends BaseModel {
  public static get Instance(): XxxModel {
    return this.getInstance();
  }

  protected enableCache(): boolean {
    return true;
  }

  public async findByRoleUid(roleUid: number): Promise<any> {
    return this.findOne({ roleUid });
  }
}
```

3. `server/src/modelLogic/XxxModelLogic.ts`

```ts
import { BaseModelLogic } from "./BaseModelLogic";
import { XxxModel } from "../model/XxxModel";

export class XxxModelLogic extends BaseModelLogic {
  public static get Instance(): XxxModelLogic {
    return this.getInstance();
  }

  public async getData(roleUid: number): Promise<any> {
    return XxxModel.Instance.findByRoleUid(roleUid);
  }
}
```

4. `server/src/servers/logic/XxxMain.ts`（协议入口示例）

```ts
import { BaseServerLogic } from "../../components/BaseServerLogic";
import { Session } from "../../components/session";
import { XxxModelLogic } from "../../modelLogic/XxxModelLogic";

export default class XxxMain extends BaseServerLogic {
  public static get Instance(): XxxMain {
    return this.getInstance();
  }

  public initInstance() {
    this.bindCmd(10001, this.onReq10001);
  }

  public async onReq10001(msg: any, session: Session, next: Function) {
    const data = await XxxModelLogic.Instance.getData(session.uid);
    next(10002, { code: 1, data });
  }
}
```

## 构建与运行

```bash
cd server && npm install
npm start                                # tsc + node ./dist/app.js
npx tsc                                  # 仅编译
node ./dist/app.js serverName=<name> env=<env>
```

示例：

```bash
node ./dist/app.js serverName=logic-1 env=dev
```

Protobuf 生成（Windows）：

```bash
cd proto && gen_server.bat
```

说明：

- `tsc` 不会自动复制 `server/src/proto/protobuf/` 下的生成文件到 `dist`，发布时需确认产物完整。
- 仓库当前未配置统一单元测试框架与 linter。

## 目录说明

| 路径 | 作用 |
|---|---|
| `server/src/` | 服务端源码 |
| `server/src/database/` | Table 层（仅数据库服执行） |
| `server/src/model/` | Model 层（逻辑服通过 RPC 访问 DB） |
| `server/src/modelLogic/` | ModelLogic 层（业务/缓存管理入口） |
| `server/src/servers/` | 各类服务器入口（gate/logic 等） |
| `server/src/connector/` | TCP/WS/KCP 连接器 |
| `server/src/event/` | 事件定义（RpcEvent、DatabaseEvent） |
| `server/src/register/` | 路由与单例注册 |
| `server/src/core/Sigleton.ts` | 单例基类 |
| `proto/` | `.proto` 与生成脚本 |
| `Csharp/` | Unity 客户端网络示例（`NetworkManager.cs`） |

## 核心架构

### 多进程分布式模型

各服务器类型独立进程，通过 RPC 通信：

- `database`：唯一 MongoDB 访问入口
- `gate`：客户端接入与转发
- `logic`：核心逻辑处理
- 其余类型：`chat/fight/social/cross/rankList/line/logSave/background/master/middleground/localLog/router`

### 三层数据访问模式

```text
Table(DB服)  <--RPC-->  Model(逻辑服)  <--调用-->  ModelLogic(业务层)
```

1. Table 层
- 只能在 `database` 服使用
- DB 事件在 `initInstance()` 绑定到 `TSEventCenter.bindDB`
- 写操作建议走 WAL 包装：`insert/update/deleteRecoverOne -> MarkedXxxFinish`

2. Model 层
- 所有数据库访问必须经 `app.rpcDB()`
- `XxxModel` 默认映射到 `XxxTable`
- 可按需开启 TTL 缓存

3. ModelLogic 层
- 作为业务入口与缓存生命周期管理层
- 注册到 `app.ModelLogicMap`

## 通信协议

### Client -> Server

帧结构：`4字节长度 + 1字节类型 + 负载`

- `type=1`：自定义消息（2字节协议ID + protobuf）
- `type=2`：握手
- `type=3`：心跳

### Server -> Server

- `app.rpc()`：无返回
- `app.rpcAwait()`：有返回
- `app.rpcDB()`：数据库调用

## 路由规则

协议主键范围映射在 `server/src/register/route.ts`，当前为规则表实现（非 if-else 链）。

## 双集群跨服（A/B 不同物理机）

适用场景：A 服与 B 服各自独立部署（各自 master / gate / logic / database），但玩家要共同参与同一跨服玩法。

### 1. 现状边界（必须先明确）

- 当前框架原生能力是“单 master 域内多进程/多机器互联”，不是“多 master 域自动并网”。
- `monitor` 只连接本集群 `masterConfig`，不会自动发现另一套独立集群。
- 现有 gate 路由中的 `cross` 默认只会到本区 `cross-1`，不具备跨集群寻址能力。

### 2. 推荐拓扑（标准方案）

- 保持 A、B 两个业务集群独立，分别负责各自玩家登录、背包、养成、发奖落库。
- 新增第三套“跨服中心集群（CrossHub）”作为跨服玩法权威域，职责包括匹配池管理、房间生命周期、战斗编排/托管、标准化结算产出。
- A/B 的本地 `cross` 服作为“跨服代理层”，与 CrossHub 建立服务连接并转发请求。
- 业务数据归属不变：玩家资产最终仍写回 A/B 各自数据库。

### 3. 核心职责划分

- A/B `gate`：接入客户端并按协议路由到本区 `cross`。
- A/B `cross`：请求 CrossHub、维护本区会话映射、接收回调并调用本区 logic/db 入账。
- CrossHub：跨区匹配、房间状态机、战斗结果权威计算、结算消息签发。
- A/B `logic/database`：按本区规则做最终校验与落账，保持区服自治。

### 4. 数据与幂等设计（强约束）

- 玩家全局键：`globalUid = zoneId + ":" + uid`，禁止只用 `uid` 作为跨区唯一键。
- 匹配票据：`ticketId, seasonId, modeId, zoneId, uid, mmr, enterTs`。
- 房间主键：`roomId`（全局唯一），成员使用 `globalUid`。
- 结算幂等键：`idempotentKey = settleId + ":" + resultVersion`。
- A/B 本地入账前必须先查幂等表；已处理过的结算直接返回成功 ACK，不重复发奖。

### 5. 关键时序（推荐）

1. 客户端请求跨服匹配，进入本区 `gate -> cross`。
2. 本区 `cross` 生成匹配票据并发给 CrossHub。
3. CrossHub 完成匹配并创建 `roomId`，回调 A/B 对应 `cross`。
4. A/B `cross` 通知本区客户端进入跨服房间/战斗。
5. 战斗结束后 CrossHub 生成统一结算包（含 `settleId/resultVersion`）。
6. A/B `cross` 分别调用本区 logic/db 执行发奖与状态更新（带幂等键）。
7. A/B 返回 ACK，CrossHub 收齐后归档并结束房间。

### 6. 与本仓库的对应改造点

- 协议主键分段与 `cross` 映射：`server/src/register/route.ts`。
- gate 对 `cross` 路由：`server/src/app.ts` 中 `app.route(ServerType.cross, ...)`。
- gate 侧协议转发入口：`server/src/components/frontendServer.ts` 的 `doRemote`。
- 单集群发现与互联机制：`server/src/components/master.ts`、`server/src/components/monitor.ts`。
- 区服标识参与 ID 生成：`server/src/utils/SnowDrifting.ts`（依赖 `zoneid`）。

### 7. 安全与网络要求

- A/B 到 CrossHub 仅开放必要端口，建议专线/VPN + 安全组白名单。
- 跨服链路使用独立服务 token，不使用默认仓库 token。
- 区分三类 token：A 内部、B 内部、A/B <-> CrossHub。
- 关键跨服消息增加签名与时间戳校验，防重放、防伪造。

### 8. 故障与恢复策略

- CrossHub 不可用：新匹配快速失败或排队熔断；已开房按超时托管策略处理。
- 跨区网络抖动：房间进入 `WAIT_RECONNECT`，超时后按玩法规则结算。
- 结算回调失败：CrossHub 重试；A/B 本地通过幂等键保证不会重复发奖。
- A/B 任一区短时不可用：另一侧玩家进入等待态，恢复后继续或终局判定。

### 9. 实施顺序（落地建议）

1. 单区先跑通 cross 玩法状态机与压测。
2. 抽象跨服代理接口（匹配、入房、结算回调）。
3. 部署 CrossHub 并打通 A/B 代理链路。
4. 补齐幂等表、补偿任务、重试策略与监控指标。
5. 按灰度比例放量，重点看断线重连率、重复结算率、跨区超时率。

### 10. 当前框架接入 realCross 的最小配置

可在 `serverConfig/serverConfig.json` 增加可选字段（不影响旧配置）：

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
- `proxyClientCmd=false` 为默认安全模式：仅建立 cross->realCross 专线，不直接代理客户端协议。
- 若需启动 `realCross-1`，可在 `serverinfos` 显式配置，或通过该字段动态注入（兼容模式）。

## 关键规则（必须遵守）

1. 非数据库服禁止直连 MongoDB。
2. Table 写操作应使用 WAL 包装（尤其是可恢复数据）。
3. 新协议号必须落入正确服务器区间。
4. 单例生命周期遵循：`initInstance()` / `destoryInstance()` / `onHotReload()`。
5. 命名保持一致：`XxxTable / XxxModel / XxxModelLogic`。

## 当前实现状态（维护要点）

1. 启动时序
- 非 database 服启动前，不再固定 `sleep(8000)`。
- 现为“RPC socket 就绪 + DB 健康检查（OnHealthCheck）”双条件等待。

2. 稳定性
- 已接入基础优雅停机流程（清锁、清连接、断 DB、退出）。
- `TSEventCenter` 已增加 CMD 锁空闲自动回收。

3. 数据层
- `BaseTable.updateOne` 成功判定已修复（不再误用 `upsertedCount` 作为唯一条件）。
- `UserTable` 已补 WAL 包装示例。
- `BaseOneKeyTable` 插入缓存 key 已修复为 `uniqueKey`。

4. 性能
- `DateUtils.msSysTick` 使用 `Date.now()`。
- `TickTask.pushTask` 改为二分插入，避免每次全量排序。
- `UserModel.count` 改为 `countDocuments` RPC。
- `TTLBaseCache` 的 set/get/has 使用实时时间戳，避免 interval 造成时间偏差。

5. 安全
- `HotReload.doCopy` 已将命令执行改为参数化 `execFile`，并增加路径白名单校验。

## Csharp 目录说明

`Csharp/NetworkManager.cs` 为客户端网络示例代码，不参与 Node 服务端编译。
近期已修复：

- 两处方法签名错误（编译阻断）
- 心跳超时改为随握手心跳动态计算（保底 4 秒）

## 技术细节

- TypeScript 4.7.4
- `target: ES2020`
- `module: CommonJS`
- `strict: false`
- 使用 `experimentalDecorators`
- 日志框架：`log4js`

## 提交前检查建议

1. 在 `server/` 执行 `npx tsc --noEmit`。
2. 若改动 connector/protocol，请至少验证握手与心跳链路。
3. 若改动数据库层，请验证 `rpcDB` 路由名与 `DatabaseEvent` 一致。
4. 若改动单例或热更相关代码，检查 `InstanceMap` 注册与销毁是否对称。
