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
2. 调用 `devbox start "策略描述"` 启动回测
3. 等待完成后调用 `devbox result <run_id>` 获取结果
4. 展示结果

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
