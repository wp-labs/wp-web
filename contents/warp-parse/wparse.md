# WarpParse  
 Warp Parse是面向可观测性、安全、实时风控、数据平台团队的高性能 ETL 引擎，专注于日志/事件接入、解析与转换，提供高吞吐解析（WPL）、转换（OML）、路由、统一连接器 API 及极简运维体验。

## 核心特性
* 🚀 极致吞吐： 众多场景下性能全面超越 Vector（详见 docs/performance.md）。
* 📝 规则易编写： WPL（解析 DSL）+ OML（转换 DSL），可读性远超正则表达式和 Lua。
* 🔌 连接器统一： 基于 wp-connector-api，便于社区生态扩展。
* 🛠️ 运维友好： 单二进制部署，配置化；提供 wproj、wpgen、wprescue 工具套件。
* 🧠 知识转换： 通过内存数据库支持 SQL 查询，实现数据富化。
* 🎯 数据路由： 基于规则和转换模型进行路由，支持多路复制与过滤器。



### Sink特性

| 特性 | 说明 |
|------|------|
| **标签继承** | 支持三层标签合并（默认→组级→Sink级） |
| **期望值配置** | 支持比例模式（ratio/tol）、范围模式（min/max） |
| **过滤器** | 使用 WPL 语法定义过滤条件 |
| **参数覆盖** | 通过 `allow_override` 控制可覆盖参数 |
| **并行与分片** | 业务组支持 `parallel` 配置，提升吞吐 |


## 资源

- [github](https://github.com/wp-labs)
- [docs](https://wp-labs.github.io/wp-docs)
- [download](https://github.com/wp-labs/warp-parse/releases)
