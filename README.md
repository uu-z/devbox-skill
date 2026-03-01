# Devbox Skill

AI agent that automatically implements and backtests trading strategies.

## Installation

In Claude Code, say:

```
Install devbox skill from https://github.com/uu-z/devbox-skill
```

Claude will automatically:
1. Clone the repository
2. Install skill to `~/.claude/skills/devbox`
3. Set up the devbox command

### Verify Installation

Check that the skill is installed correctly:

```bash
# Check skill directory exists
ls ~/.claude/skills/devbox/skills/devbox/SKILL.md

# Check command is available
ls ~/.claude/skills/devbox/bin/devbox
```

**Expected output**: Both files should exist.

### Test the Skill

Restart your Claude Code session, then try:

```
/devbox "BTC buy below 0.3, sell above 0.5"
```

**Expected behavior**:
- ✓ Subagent starts in background
- ✓ Main agent remains responsive
- ✓ Results returned with contextual suggestions
- ✓ Artifacts saved to `~/.devbox/runs/<run_id>/workspace/output/`

## Usage

```
/devbox "BTC buy below 0.3, sell above 0.5"
```

or

```
/devbox test an ETH Bollinger Bands strategy
```

## Features

- Natural language strategy description
- Background execution (non-blocking)
- Intelligent result analysis
- Dynamic next-step suggestions

## Output Artifacts

Each run generates:
- `strategy.rs` - Strategy code
- `metrics.json` - Backtest metrics
- `report.md` - Analysis report
- `backtest_events.jsonl` - Trade records

Location: `~/.devbox/runs/<run_id>/workspace/output/`

## Troubleshooting

### Skill not found

```bash
# Reinstall
cd ~/.claude/skills
rm -rf devbox
git clone https://github.com/uu-z/devbox-skill.git devbox
```

Then restart Claude Code session.

### Command not found

The skill uses dynamic path resolution. If you see "command not found", check:

```bash
ls ~/.claude/skills/devbox/bin/devbox
```

If the file exists, the skill will find it automatically.

## Development

Current implementation is a mock for demonstration. Future versions will integrate with real Rust backtesting engine.

## License

MIT
