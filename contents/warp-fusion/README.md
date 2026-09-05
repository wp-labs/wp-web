# warp-fusion WEB 内容（contents 索引）

本目录存放 **WarpFusion** 官网/落地页的内容素材，按「整理逻辑」拆为三部分 + 一条补充主题（AI Native），每个文件独立成篇：

| 文件 | 对应整理逻辑 | 内容定位 | 页面建议 |
|---|---|---|---|
| `intro.md` | ① warp-fusion 是什么 | 产品定义、解决的问题、品类边界、WFL 语言模型、场景与上手 | 首页 Hero / 产品介绍页 |
| `advantage.md` | ② warp-fusion 优势在哪里 | 算力架构、语言表达力、正确性与工程治理、AI 开发闭环、运维与成本、选型建议 | 「为什么选它」页面 / 特性页 |
| `competitive.md` | ③ 与竞品的数据对比 | NEXMark Q1–Q22 权威跑批 vs Flink OSS / 阿里 VVR、TCO 估算、已知边界、口径附录 | 「性能与对比」页面 / Benchmark 页 |
| `ai-native.md` | 补充：WarpFusion 是 **AI Native 引擎** | 定义（不是内置 LLM，而是规则流水线以 AI 为一等参与者）、6 级 AI 开发闭环、机器可读回执契约、wf-skills / wf-rules / LSP、诚实边界 | 「AI 原生」页面 / 开发者页 |
| `resource.md` | 配套：测试资源口径对照 | 三家引擎的部署形态 / 算力 / 内存量级与来源口径（8 核单机 vs OSS 3×12C48G 分布式 vs VVR 8 CU）、残余不对等、WarpFusion 自身 RSS 观测 | 「处理性能」节的资源/口径附录 |

> AI Native 是横切主题：`advantage.md`（三、四节）与 `intro.md` 已引用其结论，`ai-native.md` 展开全部论据。写页面时若空间有限，可把 `ai-native.md` 的核心表（6 级闭环 + 回执 schema）嵌进优势页。

## 素材来源（原始 docs）

| 素材目录（wfusion 仓库内） | 主要贡献 | 在本目录的映射 |
|---|---|---|
| `warp-fusion/docs`（warp-fusion-intro / competitiveness / useage / design） | 产品定义、WFL 语言、竞争力白皮书、使用方式 | `intro.md`、`advantage.md`、`competitive.md` |
| `wf-examples/performance/nexmark_pk/docs`（BENCH_RESULTS / OSS_VVR_BASELINE / CAPABILITY_GAP_MATRIX 等） | NEXMark 全查询基准数据、白皮书基线、能力覆盖矩阵 | `competitive.md`（全部数据表） |
| `wp-reactor/docs`（user-guide / design / source-architecture） | 核心运行时架构、「为什么快」的机制、正确性方法学 | `advantage.md`（算力与架构节） |
| `warp-fusion/docs/useage/ai_native_rule_dev_loop.md`、`useage/intro.md`、`warp-fusion-intro.md`（§六）、`warp-fusion-competitiveness.md`（§5.2） | AI 原生定位、6 级开发闭环、回执契约、AI 友好度三要素 | `ai-native.md`（全部论据） |
| `wf-skills` / `wf-rules`（wfusion 工作区内） | AI 技能包、18 条真实规则语料 | `ai-native.md`（五、AI 设施） |
| `nexmark-docs` 的机器规格节 + `competitiveness.md` §2.1 | 测试机规格、OSS 实例型号、VVR CU 口径、残余不对等声明 | `resource.md`（全部口径） |

## 引用纪律（写网页/做图时必须遵守）

1. **性能数字只引「单查询权威口径」**：NEXMark、Linux 8 核、blackhole 汇、100M 条事件、2026-08-27 跑批、核心运行时 wp-reactor v2.0.7（配套 WarpFusion 工具 0.5.x）；对照组来自阿里云《Nexmark 性能白皮书》（OSS Flink 1.20.4、VVR vvr-11.5-jdk11-flink-1.20）。
2. **结论作量级参照，非逐位比较**：资源计量口径不同（8 核 vs 8 CU / 3×12 vCPU 三节点），不承诺生产 SLA。
3. **WarpFusion 内存量级（≈32GB）为推断口径**，引用须标注；实测依据为 q18 @100M RSS 峰值 ≈28GB 可完整跑完（详见 `resource.md` §2）。
4. 引用倍数须带**几何/算术均值口径**：几何（24.3× vs OSS、6.8× vs VVR）为头条口径；算术均值（44.7× / 10.1×）仅作上限语境。
5. 诚实边界必须保留：无 exactly-once / checkpoint；生态广度不及 Flink；q18 状态窗内存为已知问题；告警密集场景吞吐需按自身告警率实测。
6. 2026-08-10 的多规则混合负载旧测量已过时，**禁止引用**。

## 构建 WEB 时建议

- 目录结构参考 `contents/warp-parse/` 的用法：本目录三个 md 各自可对应独立页面或落地页的三个 section。
- 数据图表建议直接从 `competitive.md` 的表格取数（如 q1–q22 对照表 → 柱状图；倍数 → 对数刻度图）。
- 文件内不含图片引用，需要配图时请在页面构建阶段补图（如 WFL 五原语图、Q 查询分布图）。
