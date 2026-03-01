# Devbox PoC

AI编码agent自动实现和回测交易策略。

## 安装

### 方式1: npm全局安装(推荐)

```bash
npm install -g devbox-poc
```

安装后 `devbox` 命令全局可用。

### 方式2: 本地开发

```bash
npm run dev
```

创建软链接到 `~/.claude/skills/devbox`。

验证：

```bash
ls -la ~/.claude/skills/devbox
devbox start "测试"  # 测试命令
```

## 使用

### Claude Code对话(推荐)

直接用自然语言描述策略：

```
/devbox "BTC价格低于0.3时买入，高于0.5时卖出"
```

或

```
/devbox 测试一个ETH布林带策略
```

我会自动执行并返回结果+AI分析。

### 命令行

```bash
# 启动回测
bin/devbox start "策略描述"

# 查看结果
bin/devbox result <run_id>
```

## 产物

每次运行生成：

- `strategy.rs` - 策略代码
- `metrics.json` - 回测指标
- `report.md` - 分析报告
- `backtest_events.jsonl` - 交易记录

位置：`~/.devbox/runs/<run_id>/workspace/output/`

自定义：`export DEVBOX_RUNS_DIR=/custom/path`

## 架构

```
用户 → Claude Code → devbox skill → shell CLI → mock runner → 产物
```

当前为mock实现，演示完整流程。

## 文档

- `DEMO.md` - 演示说明
- `docs/devbox-poc.md` - 项目概述
- `docs/references/` - RFC设计文档

## 使用

### 方式1: Claude Code对话(推荐)

在Claude Code中：

```
/devbox start "BTC价格低于0.3时买入，高于0.5时卖出"
```

我会自动执行并返回结果。

### 方式2: 命令行

```bash
# 启动回测
bin/devbox start "策略描述"

# 查看结果
bin/devbox result <run_id>
```

## 产物

每次运行生成：

- `strategy.rs` - 策略代码
- `metrics.json` - 回测指标
- `report.md` - 分析报告
- `backtest_events.jsonl` - 交易记录

位置：`~/.devbox/runs/<run_id>/workspace/output/`

## 架构

```
用户 → Claude Code → devbox skill → shell CLI → mock runner → 产物
```

当前为mock实现，演示完整流程。

## 文档

- `TEST.md` - 测试指南
- `DEMO.md` - 演示说明
- `docs/devbox-poc.md` - 项目概述
- `docs/references/` - RFC设计文档
