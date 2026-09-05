# WarpFusion：把实时关联计算，压进一个二进制

> 单条事件只能告诉你「发生了什么」，回答不了「这些事件放在一起意味着什么」。
> WarpFusion 是一套用声明式规则语言回答后一个问题的**实时关联计算引擎**——Rust 编写，单二进制，零外部依赖。

---

## 从一个回答不了的问题说起

设想一条再普通不过的安全规则：**同一 IP 在 5 分钟内登录失败 3 次，随后发起端口扫描**。

拆开看，它同时跨越了三个维度：

- **跨数据源**——登录日志和网络流量要放在一起看；
- **跨时间窗口**——「5 分钟内」是个时间约束，引擎必须记得住刚才发生了什么；
- **跨步骤**——失败在前、扫描在后，顺序不能乱，中间还可能要求「始终没有成功登录」。

这类需求从不局限于安全：**风控**要识别「短时多笔异地交易」；**运维**要判断「错误率突增且伴随延迟抬升」；**IoT** 要发现「设备温度持续偏离自身常态」。它们的共同要求是：引擎得**缓存历史、维护有状态窗口、执行模式匹配**。

问题在于，现成工具各有各的代价：

| 路线 | 代价 |
|---|---|
| 通用流计算（如 Flink） | 要为中等量级付出集群 + Kafka + 每改一条规则重走一遍 job 生命周期的成本 |
| SIEM / 查询语言 | 表达力碰壁——时序链、缺失检测、实体建模，不少是语言层根本没有的原语 |
| 自研硬编码 | 每类检测场景一套状态机，无法沉淀、无法复用、无法验证 |

WarpFusion 走的是中间那条路：**用一个二进制跑完完整关联链路，用一门语言把「要找什么」说清楚**。

---

## 它是什么、不是什么

WarpFusion 是一个 Rust 编写的**实时关联计算引擎**。它的能力内核是**跨多条事件、跨时间窗口的模式匹配**，而不是单条过滤——输入结构化事件流，输出满足关联条件的、可解释且带评分的结果：可以是告警，也可以是结构化数据。

对外它是一个**单二进制、零外部依赖**的引擎 `wfusion`，配套 `wfl`（规则开发）与 `wfgen`（测试数据生成），开箱即用。既能在单机跑通完整链路，也以声明式窗口分布（`partitioned` / `replicated` / `local`）为平滑扩展到多节点留好了设计接口。

明确品类边界，避免错位比较：

| 它是 | 它不是 |
|---|---|
| 实时关联计算 / 模式匹配引擎 | ❌ 通用分布式流计算平台（当前无分布式协调、无 checkpoint） |
| 单二进制、可单机承载的规则引擎 | ❌ 数据仓库 / 交互式分析引擎（无行保留聚合，交下游 SIEM） |
| 面向检测语义的声明式语言（WFL） | ❌ SIEM 平台（无存储 / 检索 / 可视化 / 案件管理） |

---

## WFL：用五原语说清「要找什么」

规则用 **WFL**（WarpFusion Language）编写，采用职责分离的**三文件模型**：

| 文件 | 职责 |
|---|---|
| `.wfs` | 数据长什么样：窗口定义、字段 schema、时间字段 |
| `.wfl` | 匹配什么模式：事件绑定、时序匹配、评分、输出 |
| `.toml` | 怎么跑：source、sink、窗口内存、watermark |

语言的核心是**五个原语**，所有语法糖在编译期归一为唯一语义内核：

- **Bind** —— 把事件流绑定成带条件的别名；
- **Match** —— 时序序列、无序共现、双阶段匹配、缺失检测；
- **Stats** —— 声明式窗口统计聚合；
- **Join** —— `snapshot` / `asof` / `anti` 关联与上下文富化；
- **Yield** —— 带契约的结构化输出。

这意味着语言扩展不会拖累执行路径：新增的表达能力最终都落到同一套执行原语上，而不是堆叠特例。

### 例一：多步攻击链（时序链）

```wfl
rule chain_attack {
    events {
        scan  : conn_events && action == "syn"
        login : conn_events && action == "login_fail"
    }
    match<sip:30m> {
        on event {
            scan  | count >= 5;
            login | count >= 3;
        }
    } -> score(90.0)
    entity(ip, scan.sip)
    yield network_alerts (sip = scan.sip, alert_type = "chain_attack")
}
```

同一 IP 在 30 分钟窗口内既扫描了 5 个端口、又失败登录 3 次——命中，评分 90，结果归属到 IP 实体。

### 例二：缺失检测（A → NOT B）

```wfl
events {
    fail : auth_events && action == "failed"
    ok   : auth_events && action == "success"
}
match<sip:10m> {
    on event { failed: fail | count >= 3; }
    and close { succeed: ok | count == 0; }
}
```

「失败 3 次，且到窗口关闭为止**一次都没成功过**」——`and close` 让「没有发生」成为一等判断条件。这是很多查询语言需要绕子查询甚至外部模块才能表达的语义。

### 例三：声明式窗口统计

```wfl
rule traffic_stats {
    events { c : conn_events }
    stats<1h:fixed> group by (c.sip) {
        c | count        as hits;
        c | sum(c.bytes) as total_bytes;
    }
    entity(ip, c.sip)
    yield traffic_stats (
        sip   = c.sip,
        hits  = stat.value(final(hits)),
        bytes = stat.value(final(total_bytes))
    )
}
```

一个原语覆盖「每小时每源 IP 的流量画像」。同一套语言既能写逐事件流式检测，也能写声明式窗口统计。

> **它同时是一门为 AI 而生的语言（AI Native）**：语言表面积小、语义显式、写完即验——规则可以完全交给 AI 生成，由引擎证明对错。完整的 AI 原生论据见同目录 `ai-native.md`。

---

## 用在哪

NEXMark 的 Q1–Q22 覆盖的流处理形态，正好映射到四类真实场景：

| 场景 | 对应的引擎能力 | 典型负载 |
|---|---|---|
| **SIEM / 安全检测** | 序列匹配、行为统计与 Top-N、上下文关联 | 攻击链检测、告警归并、实体行为分析 |
| **风控反欺诈** | 每实体最后状态、Top-N、速率窗口 | 名单匹配、异常排行、实时频控 |
| **AIOps / 可观测** | 滑窗 / 会话窗突增、处理时间频控 | 指标异常、限流去重 |
| **实时数仓 / ETL** | 投影、过滤、富化、落盘 | 字段归一化、日志标准化、热冷分层 |

数据接入侧支持 **Arrow IPC over TCP** 直连——从上游解析引擎（WarpParse，WPL/OML 适配器）到规则引擎全程免解析、类型保真，原始日志解析归一化由 WarpParse 承担。

---

## 上手

```bash
git clone https://github.com/wp-labs/warp-fusion.git
cd warp-fusion && cargo build --release
```

```bash
# 1. 内联测试 —— 验证规则逻辑
wfl test rules/port_scan_whitelist.wfl --schemas "schemas/*.wfs"

# 2. 离线回放 —— 用历史数据验证
wfl replay rules/port_scan_whitelist.wfl --input data/conn_events.ndjson

# 3. 引擎运行 —— 完整管道
wfusion run -c ./wfusion.toml
```

仓库内可直接运行的示例：`port_scan_whitelist`（端口扫描 + 白名单）、`ssh_brute_force`（SSH 爆破）、`sqli_probe`（SQL 注入探测）、`rat_propagation`（远控扩散，多步扫描→登录→外传）。

---

## 许可

WarpFusion 及核心运行时采用 **Elastic License 2.0（ELv2）**：

- **允许**：个人、研究、教学、非营利组织使用，以及企业**内部自用**（含部署、修改、嵌入自有产品）；
- **禁止**：将本软件作为托管服务 / 产品对外提供、销售本软件本身、或绕过授权限制。

ELv2 属 source-available，**不属于 OSI 认证的开源协议**，但允许企业内部商用。超出上述范围的商业用途需与版权人另行签署商业授权协议。

---

## 下一步

- 想了解 WarpFusion 的**优势在哪**（算力架构、语言表达力、正确性工程、AI 开发闭环）→ 见同目录 `advantage.md`；
- 想了解为什么说它是 **AI Native 引擎**（6 级 AI 规则开发闭环、机器可读回执、wf-skills / wf-rules / LSP）→ 见同目录 `ai-native.md`；
- 想核对**与 Flink 等竞品的数据对比**（NEXMark Q1–Q22、TCO、已知边界与完整口径）→ 见同目录 `competitive.md`。

## 资源

- 引擎 / CLI：`github.com/wp-labs/warp-fusion`（`wfusion`、`wfl`、`wfgen`）
- 核心运行时：`github.com/wp-labs/wp-reactor`
- NEXMark PK 完整报告（逐查询数据、口径与 A/B 纪律）：`wf-examples/performance/nexmark_pk/NEXMARK_PK_REPORT.md`
