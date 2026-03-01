# Devbox Skill

AI编码agent自动实现和回测交易策略。

## 安装

在 Claude Code 中说：

```
从 https://github.com/yourusername/devbox-poc 安装 devbox skill
```

Claude 会自动：
1. Clone 仓库
2. 安装 skill 到 `~/.claude/skills/devbox`
3. 设置 devbox 命令

## 使用

```
/devbox "BTC价格低于0.3时买入，高于0.5时卖出"
```

或

```
/devbox 测试一个ETH布林带策略
```

## 特性

- 自然语言描述策略
- 后台自动执行回测
- 智能分析结果
- 动态建议下一步

## 产物

每次运行生成：
- `strategy.rs` - 策略代码
- `metrics.json` - 回测指标
- `report.md` - 分析报告
- `backtest_events.jsonl` - 交易记录

位置：`~/.devbox/runs/<run_id>/workspace/output/`

## 注意

当前为 mock 实现，演示完整流程。未来接入真实 Rust 回测引擎。
