---
name: devbox
description: Launch AI coding agent to automatically implement and backtest trading strategies
version: 0.1.0
---

# Devbox Skill

AI agent that automatically writes code, runs backtests, and generates reports.

## Usage

Describe your strategy in natural language:

```
/devbox "BTC buy below 0.3, sell above 0.5"
```

or

```
/devbox test an ETH Bollinger Bands strategy
```

## Workflow

1. Understand the strategy description
2. Launch subagent to execute backtest (using Agent tool)
3. Subagent runs in background:
   - Find devbox command location (`which devbox` or derive from skill directory)
   - Execute `devbox start "strategy description"`
   - Wait for completion, then execute `devbox result <run_id>`
   - Return results
4. Main agent displays results and provides suggestions

**Important**:
- Use `Agent` tool to launch subagent with `run_in_background: true`
- Skill directory is at `~/.claude/skills/devbox`, can find project root via symlink
- Main agent remains non-blocking and can continue conversation

## Output Artifacts

`~/.devbox/runs/<run_id>/workspace/output/`:
- `strategy.rs` - Strategy code
- `metrics.json` - Backtest metrics
- `report.md` - Analysis report
- `backtest_events.jsonl` - Trade records

## Note

Current implementation is a mock for demonstration. Future versions will integrate with real Rust backtesting engine.

---

After completing the backtest and showing results, you MUST provide contextual suggestions for what the user might want to do next. Analyze the strategy description, results, and current context to suggest 3-5 relevant next actions. Examples might include:

- Adjusting specific parameters and re-testing
- Testing on different markets or timeframes
- Comparing with alternative strategies
- Optimizing risk management
- Viewing detailed artifacts
- Exploring related strategy variations

Make suggestions specific to the actual strategy and results, not generic templates.
