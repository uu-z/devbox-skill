---
name: devbox
description: 启动AI编码agent自动实现和回测交易策略
version: 0.1.0
---

# Devbox Skill

AI agent自动写代码、跑回测、出报告。

## 使用方式

直接用自然语言描述策略：

```
/devbox "BTC价格低于0.3时买入，高于0.5时卖出"
```

或

```
/devbox 测试一个ETH布林带策略
```

## 工作流程

1. 理解策略描述
2. 启动 subagent 执行回测（使用 Agent tool）
3. Subagent 在后台执行：
   - 找到 devbox 命令位置（`which devbox` 或使用 skill 目录推导）
   - 执行 `devbox start "策略描述"`
   - 等待完成后执行 `devbox result <run_id>`
   - 返回结果
4. 主 agent 接收结果后展示并给出建议

**重要**:
- 使用 `Agent` tool 启动 subagent，`run_in_background: true`
- Skill 目录在 `~/.claude/skills/devbox`，可通过软链接找到项目根目录
- 主 agent 不阻塞，可以继续对话

## 产物位置

`~/.devbox/runs/<run_id>/workspace/output/`:
- `strategy.rs` - 策略代码
- `metrics.json` - 回测指标
- `report.md` - 分析报告
- `backtest_events.jsonl` - 交易记录

## 注意

当前为mock实现，演示完整流程。未来接入真实Rust回测引擎。

---

After completing the backtest and showing results, you MUST provide contextual suggestions for what the user might want to do next. Analyze the strategy description, results, and current context to suggest 3-5 relevant next actions. Examples might include:

- Adjusting specific parameters and re-testing
- Testing on different markets or timeframes
- Comparing with alternative strategies
- Optimizing risk management
- Viewing detailed artifacts
- Exploring related strategy variations

Make suggestions specific to the actual strategy and results, not generic templates.
