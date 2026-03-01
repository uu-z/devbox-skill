# Devbox Skill

AI agent that automatically implements and backtests trading strategies.

## Quick Start

### For Claude Code

```
Install devbox skill from https://github.com/uu-z/devbox-skill
```

Then restart your session and try:
```
/devbox "BTC buy below 0.3, sell above 0.5"
```

### For OpenClaw

```
从 https://github.com/uu-z/devbox-skill 安装 skill
```

Then restart gateway:
```
openclaw gateway restart
```

Or in OpenClaw chat:
```
重启 gateway
```

Then try:
```
/devbox "BTC价格低于0.3时买入，高于0.5时卖出"
```

## Verify Installation

After installation, check:

```bash
# Check skill is installed
ls ~/.claude/skills/devbox/skills/devbox/SKILL.md

# Check command exists
ls ~/.claude/skills/devbox/bin/devbox
```

Both files should exist.

## Post-Installation Test

**Test command**:
```
/devbox "test strategy: BTC buy low sell high"
```

**Expected behavior**:
- ✓ Subagent starts in background
- ✓ Progress updates shown
- ✓ Results returned with metrics
- ✓ Contextual suggestions provided
- ✓ Artifacts saved to `~/.devbox/runs/<run_id>/workspace/output/`

**If it doesn't work**:
1. Restart your Claude Code session or OpenClaw gateway
2. Check installation with commands above
3. See Troubleshooting section below

## Usage

Natural language strategy description:

```
/devbox "BTC buy below 0.3, sell above 0.5"
/devbox "test an ETH Bollinger Bands strategy"
/devbox "SOL RSI oversold buy strategy"
```

## Features

- 🗣️ Natural language input
- ⚡ Background execution (non-blocking)
- 📊 Automatic result analysis
- 💡 Dynamic next-step suggestions
- 📁 Complete artifacts (code + metrics + report)

## Output Artifacts

Each run generates:
- `strategy.rs` - Strategy implementation
- `metrics.json` - Backtest metrics (return, win rate, Sharpe, drawdown)
- `report.md` - Analysis report
- `backtest_events.jsonl` - Trade records

Location: `~/.devbox/runs/<run_id>/workspace/output/`

## Troubleshooting

### Skill not found after installation

**Claude Code**:
```bash
cd ~/.claude/skills
rm -rf devbox
git clone https://github.com/uu-z/devbox-skill.git devbox
```
Then restart Claude Code session.

**OpenClaw**:
```bash
cd ~/.claude/skills
rm -rf devbox
git clone https://github.com/uu-z/devbox-skill.git devbox
openclaw gateway restart
```

### Command not working

1. **Verify installation**:
   ```bash
   ls ~/.claude/skills/devbox/bin/devbox
   ```

2. **Check skill is loaded**:
   - Claude Code: Restart session
   - OpenClaw: Run `openclaw gateway restart`

3. **Test with simple command**:
   ```
   /devbox "test"
   ```

### No suggestions after results

This means the skill loaded an old cached version. Restart your session to load the latest SKILL.md.

## Development Status

Current: Mock implementation for demonstration
- Fixed metrics for all strategies
- Simulated execution phases
- Complete file protocol demonstration

Future: Integration with real Rust backtesting engine

## Contributing

Issues and PRs welcome at https://github.com/uu-z/devbox-skill

## License

MIT
