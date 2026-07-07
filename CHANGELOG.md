# Changelog

## 2026-07-07

### Changed

- **基准测试数据更新**：`index_zh.html` 和 `index.html` 中的性能数据更新至最新基准测试结果
  - 测试环境：AWS EC2 → 腾讯云 SA9
  - Mixed 日志大小：867B → 1,260B
  - 日志类型：Sysmon (1K) → Firewall (1,122B)
  - Linux 全日志性能倍数更新至 `report_linux.md`（16C32G）实测数据
  - Mac 全日志性能倍数更新至 `report_mac.md`（Mac mini M4 10C16G）实测数据

### Added

- **监控入口**：Header 导航栏新增 Monitor 按钮，跳转至 `https://monitor.alpha.warpparse.ai/`
  - 位于 Editor 和 更多/More 之间
  - 中文版显示"监控"，英文版显示"Monitor"
