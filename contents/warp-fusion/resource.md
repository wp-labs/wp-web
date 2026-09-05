# 测试资源口径对照（Benchmark 资源对比）

> 用途：对外回答「WarpFusion 是不是占了资源便宜的便宜」——把三家引擎在 NEXMark 对照中各自的
> 部署形态、算力、内存量级与来源口径摆到一张表里。**引用任何“xx 倍领先”时，请一并携带本表的口径声明。**

---

## 一、资源对照总表

| 维度 | WarpFusion | Flink OSS | 阿里云 VVR |
|---|---|---|---|
| 版本 | **wp-reactor v2.0.7**（性能跑批口径；配套 WarpFusion 工具链 0.5.x，当期约 0.5.4） | 1.20.4 | vvr-11.5-jdk11-flink-1.20 |
| 部署形态 | **单机**（一台 Linux 服务器） | **三节点分布式**（3 台 ECS） | 托管集群（8 CU） |
| 实例规格 | 与 VVR 同型号云服务器 | 3 × ecs.g6a.xlarge（每台 4 vCPU / 16 GiB） | 8 CU |
| vCPU | **8 核**（实测 CPU 峰值可达 ~950%+，机器可用核数 ≥10） | 每台 4 vCPU × 3 台，**合计 12 vCPU** | ≈ **8 vCPU** |
| 内存 | 大内存机，**≈32GB 量级（推断，见 §2）** | 每台 16 GiB × 3 台，**合计 48 GiB** | ≈ **32 GiB** |
| 来源口径 | 仓库内跑批实测（2026-08-27 权威轮） | 阿里云《Nexmark 性能白皮书》 | 阿里云《Nexmark 性能白皮书》 |

**结论句（引用模板）**：WarpFusion 以单机 8 核对 OSS 三节点 12 vCPU/48GiB 集群、对 VVR 8 CU 托管集群，
NEXMark 几何平均领先 24.3×（vs OSS）/ 6.8×（vs VVR）——**结论作量级参照，非逐位比较、非生产 SLA 承诺**。

---

## 二、逐项说明（口径细节，含诚实标注）

### 0. 版本归属：v2.0.7 是核心运行时版本，不是产品版本 ⚠

- NEXMark 跑批里的版本号 **v2.0.7 / v2.0.8 来自 wp-reactor（核心运行时仓库）**；
- WarpFusion 产品（`wfusion` / `wfl` / `wfgen` 等可执行工具）自身的版本序列是 **0.5.x**——跑批当期配套约 **0.5.4**，当前仓库为 **0.5.6**（核心运行时已至 **2.0.18**）；
- 对外表述建议：**“引擎基于 wp-reactor 运行时 v2.0.7（WarpFusion 工具 0.5.x）”**，不要把 2.0.7 写成 WarpFusion 产品版本。

### 1. OSS：3 台是“每台 4C16G”加总 = 合计 12C48G（不是每台 12C48G）

- `ecs.g6a.xlarge` 单台规格 = **4 vCPU / 16 GiB**；
- 3 台合计 = **12 vCPU / 48 GiB**（每台 4 vCPU/16 GiB × 3 台），且是**分布式**部署（JobManager + TaskManager），不是单机更大，也**不是“每台 12C48G ×3”**；
- 引用时建议写全：「3 台 ecs.g6a.xlarge（每台 4C16G）合计 12C48G」，避免 ×3 歧义。

### 2. VVR：8 CU ≈ 8 vCPU / 32 GiB

- VVR 为阿里云「实时计算 Flink」商业托管版（开源 Flink 内核 + 闭源商业增强），按 CU 计费；
- 8 CU 为官方白皮书口径，折算 ≈8 vCPU / 32 GiB，属托管集群形态。

### 3. WarpFusion：8 核确认；“≈32GB”是推断，不是文档明示值 ⚠

- 文档明示：跑批机为「Linux **8 核**（与 VVR **同型号云服务器**）」，跑批归档亦称「8 核、**大内存机**」；
- 内存量级的推断依据：q18 @100M 的 RSS 峰值实测约 **27.9–28.6 GB** 且能完整跑完 → 机器内存至少 32GB 量级；
- **因此对外引用请写“8 核 / 32GB 量级”，并注明 32GB 为推断口径**，不要写成文档既定值。

### 4. 残余不对等（必须承认的部分）

| 不对等项 | 说明 |
|---|---|
| 部署形态 | OSS 三节点分布式 vs WarpFusion 单机；VVR 为云托管集群 |
| 资源计量 | 8 核 vs 8 CU / 3×12 vCPU，计量口径不同 |
| 指标口径 | WarpFusion EPS（哨兵口径，引擎消化速率）vs 白皮书 RPS（输入量/用时），不可直接逐位比较 |

---

## 三、WarpFusion 自身的内存观测（供容量规划/口径引用）

> 只与 WarpFusion 自身跨规模可比；白皮书无三方 RSS 对照数据，**不能据此判定优于/劣于 Flink**。

| 观测 | 数值 | 口径 |
|---|---|---|
| 100M 状态型查询峰值 | q18 RSS_peak ≈ 27.9–28.6 GB；q17 ≈ 18.1 GB；q4 ≈ 18.5 GB | `ps rss` 100ms 采样峰值，@100M |
| 无状态/轻量查询 | 100M 下 RSS 约 3.9–5.3 GB | 同上 |
| 引用 RSS 注意 | 须标注 `parse_buffer_bytes`（默认 128MB；吞吐优先 2GB） | 跑批配置 |
| 内存优化进展 | wp-reactor v2.0.8（spill + 规则级 `max_memory`）使 30M 规模 q18 RSS 峰值下降约 25%（16.5→12.4GB） | wp-reactor v2.0.8 vs v2.0.7 同规模对比 |
| 已知问题 | q18 状态窗内存随数据量线性增长（30M→100M 规模退化 0.34×，属预期内状态型特征，非 bug） | BENCH_RESULTS |

---

## 四、引用纪律

1. 引用倍数必须带资源与口径注脚（单机 8 核 / OSS 3×12 vCPU-48GiB 分布式 / VVR 8 CU）；
2. “32GB”标注为推断口径；如需实锤，请重跑并公开机器规格；
3. 结论作量级参照、非生产 SLA 承诺；A/B 单轮噪声约 ±8%；
4. 若做对外页/图，建议口径表与图表放同一屏（见 `README.md` 构建建议）。

## 数据来源

- `wf-examples/performance/nexmark_pk/docs/BENCH_RESULTS.md`（WarpFusion 机器规格与 RSS 观测）
- `wf-examples/performance/nexmark_pk/docs/OSS_VVR_BASELINE.md`（白皮书 OSS 3×ecs.g6a.xlarge / VVR 8 CU 口径）
- `warp-fusion/docs/warp-fusion-competitiveness.md` §2.1（测试条件与残余不对等声明）
