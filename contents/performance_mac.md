# WarpParse vs Vector 性能基准测试报告

## 1. 技术概述与测试背景

### 1.1 测试背景

本报告旨在深度对比 **WarpParse** 与 **Vector** 在高性能日志处理场景下的能力差异。基于最新基线数据，测试覆盖了从轻量级 Web 日志到复杂的安全威胁日志，重点评估两者在单机环境下的解析（Parse）与转换（Transform）性能、资源消耗及规则维护成本。

### 1.2 被测对象

*   **WarpParse**: 大禹安全公司研发的高性能 ETL 核心引擎，采用 Rust 构建，专为极致吞吐和复杂安全日志分析设计。
*   **Vector**: 开源领域标杆级可观测性数据管道工具，同样采用 Rust 构建，以高性能和广泛的生态兼容性著称。

## 2. 测试环境与方法

### 2.1 测试环境

*   **平台**: Mac M4 Mini
*   **操作系统**: MacOS
*   **硬件规格**: 10C16G

### 2.2 测试范畴 (Scope)

*   **日志类型**:
    *   **Nginx Access Log** (239B): 典型 Web 访问日志，高吞吐场景。
    *   **AWS ELB Log** (411B): 云设施负载均衡日志，中等复杂度。
    *   **Sysmon JSON** (1K): 终端安全监控日志，JSON 结构，字段较多。
    *   **APT Threat Log** (3K): 模拟的高级持续性威胁日志，大体积、长文本。
    *   **Mixed Log**  (): 上述四类日志混合起来形成的日志类型。
*   **数据拓扑**:
    *   **File -> BlackHole**: 测算引擎极限 I/O 读取与处理能力 (基准)。
    *   **TCP -> BlackHole**: 测算网络接收与处理能力。
    *   **TCP -> File**: 测算端到端完整落地能力。
*   **测试能力**:
    *   **解析 (Parse)**: 仅进行正则提取/JSON解析与字段标准化。
    *   **解析+转换 (Parse+Transform)**: 在解析基础上增加字段映射、富化、类型转换等逻辑。

### 2.3 评估指标

*   **EPS (Events Per Second)**: 每秒处理事件数（核心吞吐指标）。
*   **MPS (MiB/s)**: 每秒处理数据量。
*   **CPU/Memory**: 进程平均与峰值资源占用。
*   **Rule Size**: 规则配置文件体积，评估分发与维护成本。

## 3. 详细性能对比分析

### 3.1 日志解析能力 (Parse Only)

在纯解析场景下，WarpParse 展现出压倒性的性能优势，尤其在小包高并发场景下。

#### 3.1.1 Nginx Access Log (239B)

| 引擎          | 拓扑              | EPS           | MPS    | CPU (Avg/Peak) | MEM (Avg/Peak)  | 性能倍数  |
| :------------ | :---------------- | :------------ | :----- | :------------- | :-------------- | :-------- |
| **WarpParse** | File -> BlackHole | **2,456,100** | 559.81 | 684% / 825%    | 107 MB / 120 MB | **4.5x**  |
| Vector-VRL         | File -> BlackHole | 540,540       | 123.20 | 342% / 405%    | 231 MB / 251 MB | 1.0x      |
| Vector-Fixed    | File -> BlackHole | 513,181       | 116.97 | 466% / 538%    | 232 MB / 245 MB | 0.95x     |
| **WarpParse** | TCP -> BlackHole  | **1,737,200** | 395.96 | 507% / 651%    | 426 MB / 450 MB | **1.8x**  |
| Vector-VRL         | TCP -> BlackHole  | 974,100       | 222.02 | 531% / 661%    | 233 MB / 238 MB | 1.0x      |
| Vector-Fixed    | TCP -> BlackHole  | 730,700       | 166.55 | 592% / 658%    | 212 MB / 220 MB | 0.75x     |
| **WarpParse** | TCP -> File       | **1,084,600** | 247.21 | 541% / 722%    | 697 MB / 700 MB | **11.9x** |
| Vector-VRL         | TCP -> File       | 91,200        | 20.79  | 186% / 195%    | 231 MB / 244 MB | 1.0x      |
| Vector-Fixed    | TCP -> File       | 92,300        | 21.04  | 201% / 214%    | 195 MB / 208 MB | 1.01x     |

> 解析规则大小：
>
> - WarpParse：174B
> - Vector：416B
> - Vector-Fixed：86B
> 
> **Vector-Fixed 的性能倍数：以同场景下的 Vector EPS 为基准（1.0x）进行对比计算**

#### 3.1.2 AWS ELB Log (411B)

| 引擎          | 拓扑              | EPS           | MPS    | CPU (Avg/Peak) | MEM (Avg/Peak)  | 性能倍数 |
| :------------ | :---------------- | :------------ | :----- | :------------- | :-------------- | :------- |
| **WarpParse** | File -> BlackHole | **1,012,400** | 396.82 | 827% / 938%    | 237 MB / 264 MB | **6.4x** |
| Vector-VRL         | File -> BlackHole | 158,730       | 62.22  | 634% / 730%    | 297 MB / 307 MB | 1.0x     |
| Vector-Fixed    | File -> BlackHole | 491,739       | 192.74 | 514% / 537%    | 259 MB / 284 MB | 3.10x    |
| **WarpParse** | TCP -> BlackHole  | **884,700**   | 346.76 | 612% / 814%    | 710 MB / 743 MB | **5.4x** |
| Vector-VRL         | TCP -> BlackHole  | 163,600       | 64.12  | 629% / 675%    | 264 MB / 276 MB | 1.0x     |
| Vector-Fixed    | TCP -> BlackHole  | 555,500       | 217.73 | 465% / 523%    | 250 MB / 255 MB | 3.40x    |
| **WarpParse** | TCP -> File       | **347,800**   | 136.32 | 496% / 615%    | 481 MB / 848 MB | **4.7x** |
| Vector-VRL         | TCP -> File       | 74,700        | 29.28  | 374% / 410%    | 265 MB / 274 MB | 1.0x     |
| Vector-Fixed    | TCP -> File       | 86,900        | 34.06  | 199% / 208%    | 252 MB / 264MB  | 1.16x    |

> 解析规则大小：
>
> - WarpParse：1153B
> - Vector：2289B
> - Vector-Fixed：64B
> 
> **Vector-Fixed 的性能倍数：以同场景下的 Vector EPS 为基准（1.0x）进行对比计算**

#### 3.1.3 Sysmon JSON Log (1K)

| 引擎          | 拓扑              | EPS         | MPS    | CPU (Avg/Peak) | MEM (Avg/Peak)  | 性能倍数 |
| :------------ | :---------------- | :---------- | :----- | :------------- | :-------------- | :------- |
| **WarpParse** | File -> BlackHole | **440,000** | 413.74 | 852% / 944%    | 224 MB / 338 MB | **5.7x** |
| Vector-VRL         | File -> BlackHole | 76,717      | 72.14  | 463% / 564%    | 295 MB / 313 MB | 1.0x     |
| Vector-Fixed    | File -> BlackHole | 94,285      | 88.66  | 474% / 563%    | 202 MB / 209 MB | 1.23x    |
| **WarpParse** | TCP -> BlackHole  | **418,900** | 393.90 | 720% / 815%    | 456 MB / 461 MB | **3.7x** |
| Vector-VRL         | TCP -> BlackHole  | 111,900     | 105.22 | 720% / 809%    | 363 MB / 377 MB | 1.0x     |
| Vector-Fixed    | TCP -> BlackHole  | 134,400     | 126.39 | 689% / 757%    | 328 MB / 346 MB | 1.20x    |
| **WarpParse** | TCP -> File       | **279,700** | 263.01 | 713% / 789%    | 441 MB / 453 MB | **4.5x** |
| Vector-VRL         | TCP -> File       | 62,100      | 58.39  | 471% / 543%    | 344 MB / 356 MB | 1.0x     |
| Vector-Fixed    | TCP -> File       | 67,300      | 63.29  | 435% / 473%    | 312 MB / 323 MB | 1.08x    |

> 解析规则大小：
>
> - WarpParse：1552B
> - Vector：3259B
> - Vector-Fixed：1852B
> 
> **Vector-Fixed 的性能倍数：以同场景下的 Vector EPS 为基准（1.0x）进行对比计算**

#### 3.1.4 APT Threat Log (3K)

| 引擎          | 拓扑              | EPS         | MPS     | CPU (Avg/Peak) | MEM (Avg/Peak)    | 性能倍数 |
| :------------ | :---------------- | :---------- | :------ | :------------- | :---------------- | :------- |
| **WarpParse** | File -> BlackHole | **314,200** | 1062.84 | 700% / 826%    | 176 MB / 181 MB   | **9.3x** |
| Vector-VRL         | File -> BlackHole | 33,614      | 113.71  | 563% / 678%    | 261 MB / 278 MB   | 1.0x     |
| Vector-Fixed    | File -> BlackHole | 37,857      | 128.06  | 570% / 670%    | 262 MB / 277 MB   | 1.13x    |
| **WarpParse** | TCP -> BlackHole  | **298,200** | 1008.72 | 694% / 762%    | 409 MB / 481 MB   | **6.5x** |
| Vector-VRL         | TCP -> BlackHole  | 46,100      | 155.94  | 849% / 922%    | 421 MB / 446 MB   | 1.0x     |
| Vector-Fixed    | TCP -> BlackHole  | 51,500      | 174.21  | 838% / 897%    | 409 MB / 427 MB   | 1.12x    |
| **WarpParse** | TCP -> File       | **179,600** | 607.53  | 606% / 853%    | 1016 MB / 1988 MB | **5.0x** |
| Vector-VRL         | TCP -> File       | 36,200      | 122.45  | 688% / 755%    | 369 MB / 397 MB   | 1.0x     |
| Vector-Fixed    | TCP -> File       | 38,200      | 129.21  | 668% / 746%    | 351 MB / 368 MB   | 1.05x    |

> 解析规则大小：
>
> - WarpParse：985B
>
> - Vector：1759B
>
> - Vector-Fixed：872B
>
> **Vector-Fixed 的性能倍数：以同场景下的 Vector EPS 为基准（1.0x）进行对比计算**

#### 3.1.5 Mixed log (平均日志大小：867B)

| 引擎          | 拓扑              | EPS         | MPS    | CPU (Avg/Peak) | MEM (Avg/Peak)  | 性能倍数  |
| :------------ | :---------------- | :---------- | :----- | :------------- | :-------------- | :-------- |
| **WarpParse** | File -> BlackHole | **672,500** | 556.05 | 815% / 904%    | 218 MB / 250 MB | **4.68x** |
| Vector-VRL         | File -> BlackHole | **143,608** | 118.74 | 845% / 958%    | 271 MB / 290 MB | 1.0x      |
| Vector-Fixed    | File -> BlackHole | 200,000     | 165.37 | 820% / 904%    | 246 MB / 275 MB | 1.39x     |
| **WarpParse** | TCP -> BlackHole  | **613,000** | 506.85 | 652% / 805%    | 365 MB / 580 MB | **3.81x** |
| Vector-VRL         | TCP -> BlackHole  | **161,000** | 133.12 | 919% / 957%    | 324 MB / 333 MB | 1.0x      |
| Vector-Fixed    | TCP -> BlackHole  | 204,300     | 168.92 | 892% / 926%    | 291 MB / 307 MB | 1.27x     |
| **WarpParse** | TCP -> File       | **308,400** | 255.00 | 535% / 598%    | 320 MB / 346 MB | **4.44x** |
| Vector-VRL         | TCP -> File       | **695,00**  | 57.47  | 447% / 478%    | 370 MB / 388 MB | 1.0x      |
| Vector-Fixed    | TCP -> File       | 75,000      | 62.01  | 389% / 414%    | 331 MB / 355 MB | 1.08x     |

> 解析规则大小：
>
> - WarpParse：3864B
> - Vector：7723B
> - Vector-Fixed：4725B
>
> 混合日志规则：
>
> - 4类日志按照3:2:1:1混合
> **Vector-Fixed 的性能倍数：以同场景下的 Vector EPS 为基准（1.0x）进行对比计算**

### 3.2 解析 + 转换能力 (Parse + Transform)

引入转换逻辑后，WarpParse 依然保持显著领先，表明其数据处理管线极其高效，转换操作未成为瓶颈。

#### 3.2.1 Nginx Access Log（239B）

| 引擎          | 拓扑              | EPS           | MPS    | CPU (Avg/Peak) | MEM (Avg/Peak)  | 性能倍数  |
| :------------ | :---------------- | :------------ | :----- | :------------- | :-------------- | :-------- |
| **WarpParse** | File -> BlackHole | **1,749,200** | 398.69 | 763% / 866%    | 143 MB / 159 MB | **3.7x**  |
| Vector-VRL         | File -> BlackHole | 470,312       | 107.20 | 372% / 423%    | 254 MB / 280 MB | 1.0x      |
| Vector-Fixed    | File -> BlackHole | 456,500       | 104.05 | 576% / 623%    | 268 MB / 280 MB | 0.97x     |
| **WarpParse** | TCP -> BlackHole  | **1,219,100** | 277.87 | 485% / 625%    | 415 MB / 440 MB | **1.4x**  |
| Vector-VRL         | TCP -> BlackHole  | 870,500       | 198.41 | 514% / 640%    | 238 MB / 258 MB | 1.0x      |
| Vector-Fixed    | TCP -> BlackHole  | 575,500       | 131.18 | 591% / 663%    | 220 MB / 228 MB | 0.66x     |
| **WarpParse** | TCP -> File       | **797,700**   | 181.82 | 492% / 621%    | 523 MB / 540 MB | **11.3x** |
| Vector-VRL         | TCP -> File       | 70,800        | 16.14  | 161% / 181%    | 226 MB / 236 MB | 1.0x      |
| Vector-Fixed    | TCP -> File       | 84,300        | 19.22  | 212% / 222%    | 207 MB / 216 MB | 1.19x     |

> 解析+转换规则大小：
>
> - WarpParse：521B
> - Vector：682B
> - Vector-Fixed：549B
> 
**Vector-Fixed 的性能倍数：以同场景下的 Vector EPS 为基准（1.0x）进行对比计算**


#### 3.2.2 AWS ELB Log（411B）

| 引擎          | 拓扑              | EPS         | MPS    | CPU (Avg/Peak) | MEM (Avg/Peak)  | 性能倍数 |
| :------------ | :---------------- | :---------- | :----- | :------------- | :-------------- | :------- |
| **WarpParse** | File -> BlackHole | **710,400** | 278.45 | 837% / 912%    | 230 MB / 252 MB | **5.5x** |
| Vector-VRL         | File -> BlackHole | 129,743     | 50.85  | 593% / 665%    | 283 MB / 298 MB | 1.0x     |
| Vector-Fixed    | File -> BlackHole | 169,000     | 66.24  | 614% / 694%    | 263 MB / 280 MB | 1.30x    |
| **WarpParse** | TCP -> BlackHole  | **611,800** | 239.80 | 624% / 753%    | 478 MB / 487 MB | **4.0x** |
| Vector-VRL         | TCP -> BlackHole  | 152,900     | 59.93  | 612% / 678%    | 288 MB / 294 MB | 1.0x     |
| Vector-Fixed    | TCP -> BlackHole  | 181,000     | 70.95  | 623% / 671%    | 258 MB / 265 MB | 1.18x    |
| **WarpParse** | TCP -> File       | **318,200** | 124.72 | 593% / 733%    | 409 MB / 547 MB | **5.5x** |
| Vector-VRL         | TCP -> File       | 58,200      | 22.81  | 332% / 374%    | 276 MB / 288 MB | 1.0x     |
| Vector-Fixed    | TCP -> File       | 77,800      | 30.50  | 366% / 394%    | 249 MB / 263 MB | 1.34x    |

> 解析+转换规则大小：
>
> - WarpParse：1694B
> - Vector：2650B
> - Vector-Fixed：1796B
> 
**Vector-Fixed 的性能倍数：以同场景下的 Vector EPS 为基准（1.0x）进行对比计算**

#### 3.2.3 Sysmon JSON Log (1K)

| 引擎          | 拓扑              | EPS         | MPS    | CPU (Avg/Peak) | MEM (Avg/Peak)  | 性能倍数 |
| :------------ | :---------------- | :---------- | :----- | :------------- | :-------------- | :------- |
| **WarpParse** | File -> BlackHole | **354,800** | 333.63 | 880% / 935%    | 157 MB / 170 MB | **6.1x** |
| Vector-VRL         | File -> BlackHole | 58,200      | 54.73  | 431% / 528%    | 296 MB / 317 MB | 1.0x     |
| Vector-Fixed    | File -> BlackHole | 91,500      | 86.04  | 471% / 586%    | 251 MB / 274 MB | 1.57x    |
| **WarpParse** | TCP -> BlackHole  | **299,500** | 281.63 | 665% / 749%    | 367 MB / 377 MB | **3.1x** |
| Vector-VRL         | TCP -> BlackHole  | 97,200      | 91.40  | 711% / 807%    | 399 MB / 424 MB | 1.0x     |
| Vector-Fixed    | TCP -> BlackHole  | 128,000     | 120.37 | 692% / 768%    | 373 MB / 389 MB | 1.32x    |
| **WarpParse** | TCP -> File       | **219,900** | 206.78 | 719% / 817%    | 431 MB / 457 MB | **5.5x** |
| Vector-VRL         | TCP -> File       | 40,300      | 37.90  | 391% / 497%    | 394 MB / 409 MB | 1.0x     |
| Vector-Fixed    | TCP -> File       | 67,100      | 63.10  | 445% / 497%    | 359 MB / 383 MB | 1.67x    |

> 解析+转换规则大小：
>
> - WarpParse：2249B
> - Vector：3782B
> - Vector-Fixed：2344B
> 
**Vector-Fixed 的性能倍数：以同场景下的 Vector EPS 为基准（1.0x）进行对比计算**

#### 3.2.4 APT Threat Log (3K)

| 引擎          | 拓扑              | EPS         | MPS    | CPU (Avg/Peak) | MEM (Avg/Peak)   | 性能倍数 |
| :------------ | :---------------- | :---------- | :----- | :------------- | :--------------- | :------- |
| **WarpParse** | File -> BlackHole | **280,000** | 947.15 | 769% / 869%    | 172 MB / 178 MB  | **9.1x** |
| Vector-VRL         | File -> BlackHole | 30,612      | 103.55 | 561% / 654%    | 248 MB / 273 MB  | 1.0x     |
| Vector-Fixed    | File -> BlackHole | -           | -      | -              | -                | -        |
| **WarpParse** | TCP -> BlackHole  | **238,900** | 808.12 | 657% / 705%    | 364 MB / 389 MB  | **7.0x** |
| Vector-VRL         | TCP -> BlackHole  | 34,000      | 115.01 | 693% / 849%    | 408 MB / 430 MB  | 1.0x     |
| Vector-Fixed    | TCP -> BlackHole  | -           | -      | -              | -                | -        |
| **WarpParse** | TCP -> File       | **169,800** | 574.38 | 664% / 884%    | 871 MB / 1500 MB | **6.8x** |
| Vector-VRL         | TCP -> File       | 24,900      | 84.23  | 539% / 645%    | 393 MB / 420 MB  | 1.0x     |
| Vector-Fixed    | TCP -> File       | -           | -      | -              | -                | -        |

> 解析+转换规则大小：
>
> - WarpParse：1638B
> - Vector：2259B
> - Vector-Fixed：2259B
> - **规则没有变化，数据保持不变**

#### 3.2.5 Mixed Log (平均日志大小：867B)

| 引擎          | 拓扑              | EPS         | MPS    | CPU (Avg/Peak) | MEM (Avg/Peak)  | 性能倍数  |
| :------------ | :---------------- | :---------- | :----- | :------------- | :-------------- | :-------- |
| **WarpParse** | File -> BlackHole | **560,600** | 463.52 | 865% / 931%    | 228 MB / 239 MB | **4.06x** |
| Vector-VRL         | File -> BlackHole | 138,157     | 114.23 | 851% / 971%    | 261 MB / 283 MB | 1.0x      |
| Vector-Fixed    | File -> BlackHole | 147,619     | 122.06 | 846% / 942%    | 252 MB / 275 MB | 1.07x     |
| **WarpParse** | TCP -> BlackHole  | **515,300** | 426.07 | 706% / 822%    | 309 MB / 320 MB | **3.30x** |
| Vector-VRL         | TCP -> BlackHole  | 156,000     | 128.99 | 885% / 955%    | 337 MB / 351 MB | 1.0x      |
| Vector-Fixed    | TCP -> BlackHole  | 161,000     | 133.12 | 918% / 949%    | 287 MB / 307 MB | 1.03x     |
| **WarpParse** | TCP -> File       | **299,600** | 247.72 | 649% / 761%    | 415 MB / 500 MB | **4.31x** |
| Vector-VRL         | TCP -> File       | 69,500      | 57.47  | 457% / 505%    | 367 MB / 393 MB | 1.0x      |
| Vector-Fixed    | TCP -> File       | 70,200      | 58.04  | 453% / 478%    | 332 MB / 355 MB | 1.01x     |

> 解析+转换规则大小：
>
> - WarpParse：6102B
> - Vector：9373B
> - Vector-Fixed：7165B
>
> 混合日志规则：
>
> - 4类日志按照3:2:1:1混合
> 
**Vector-Fixed 的性能倍数：以同场景下的 Vector EPS 为基准（1.0x）进行对比计算**


## 4. 核心发现与架构优势分析

### 4.1 性能与资源效率

**核心发现**:

1.  **吞吐量碾压**: 在所有 24 组对比测试中，WarpParse 均取得领先。解析场景下平均领先 **3.7x - 11.9x**，解析+转换场景下领先 **1.4x - 11.3x**。
2.  **算力利用率**: WarpParse 倾向于"以算力换吞吐"，CPU 占用率普遍高于 Vector，但换来了数倍的处理能力。例如在 Sysmon 解析中，WarpParse 用 1.8 倍的 CPU 换取了 Vector 5.7 倍的吞吐。
3.  **大日志处理**: 在 APT (3K) 这种大体积日志场景下，WarpParse 展现出极强的稳定性，MPS 达到 **1062 MiB/s**，接近千兆处理能力，而 Vector 在该场景下吞吐下降明显。

### 4.2 规则与维护成本

**优势分析**:

*   **规则体积更小**: 同等语义下，WarpParse 的 WPL/OML 规则体积显著小于 Vector 的 VRL 脚本。
    *   Nginx: 174B (WarpParse) vs 416B (Vector)
    *   APT: 985B (WarpParse) vs 1759B (Vector)
*   **维护性**: 更小的规则体积意味着更快的网络分发速度、更短的冷启动时间，这在边缘计算或大规模 Agent 下发场景中至关重要。

### 4.3 稳定性

*   在整个高压测试过程中，WarpParse 保持了极高的吞吐稳定性，未观察到显著的 Backpressure（背压）导致的处理崩塌。
*   **注意点**: 在 TCP -> File 的端到端场景中，WarpParse 的内存占用在部分大包场景下会有所上升（如 APT 场景达到 1GB+），这与其为了维持高吞吐而使用的缓冲策略有关。

## 5. 总结与建议

| 决策维度           | 建议方案      | 理由                                                         |
| :----------------- | :------------ | :----------------------------------------------------------- |
| **追求极致性能**   | **WarpParse** | 无论是小包高频还是大包吞吐，WarpParse 均提供 5-10倍 的性能红利。 |
| **资源受限环境**   | **WarpParse** | 尽管峰值 CPU 较高，但完成同等数据量所需的**总 CPU 时间**远少于 Vector；且小包场景内存控制优异。 |
| **边缘/Agent部署** | **WarpParse** | 规则文件极小，便于快速热更新；单机处理能力强，减少对中心端的压力。 |
| **通用生态兼容**   | **WarpParse** | 提供面向开发者的 API 与插件扩展机制，支持用户快速开发自定义输入 / 输出模块；在满足性能要求的同时，也具备良好的生态扩展能力。 |

**结论**:
对于专注于日志分析、安全事件处理（SIEM/SOC）、以及对实时性有苛刻要求的 ETL 场景，**WarpParse 是优于 Vector 的选择**。它通过更高效的 Rust 实现和专用的 WPL/OML 语言，成功打破了通用 ETL 工具的性能天花板。
