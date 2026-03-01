# devbox-poc

Devbox agent orchestration — start coding agents, monitor progress, collect results.

## Setup (one time)

```bash
npm run dev
```

This creates symlinks so all changes auto-reflect:

- `~/.claude/skills/devbox` → `skills/devbox/`
- `~/.openclaw/extensions/devbox-poc` → project root

## Dev

Edit any file → changes auto-reflect in Claude Code (skill reads SKILL.md live).

For OpenClaw, after changing tool logic:

```bash
npm run reload:openclaw
```

## Test

```bash
npm test                    # acceptance test (3 strategies in parallel)
```

## Iterate

After changing code, run `npm test` to validate. The acceptance test:

- Runs BTC MA20, ETH Bollinger, SOL RSI in parallel
- Validates: run lifecycle, handoff content, metrics, P&L, artifacts
- Reports pass/fail with improvement suggestions on failure
