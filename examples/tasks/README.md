# Task Examples

This directory contains example TASK.md files for testing devbox-poc.

## Available Examples

### 1. simple-test.md
Basic command execution test with 3 simple steps.

**Usage:**
```bash
bun run apps/cli/src/devbox.ts start \
  --task examples/tasks/simple-test.md \
  --vm devbox-default \
  --id simple-001
```

**Expected:**
- Execution time: ~2 seconds
- Events: 8 (1 started + 3×2 steps + 1 completed)
- Output: Command outputs in HANDOFF.md

---

### 2. backtest-ma.md
Moving average strategy backtest simulation with file generation.

**Usage:**
```bash
bun run apps/cli/src/devbox.ts start \
  --task examples/tasks/backtest-ma.md \
  --vm devbox-default \
  --id backtest-001
```

**Expected:**
- Execution time: ~3 seconds
- Events: 14 (1 started + 6×2 steps + 1 completed)
- Generated files:
  - output/prices.csv (price data)
  - output/ma.txt (average: 101.6)
  - output/report.md (backtest report)
  - output/metrics.json (quantitative metrics)

---

### 3. error-test.md
Error handling test with intentional failure.

**Usage:**
```bash
bun run apps/cli/src/devbox.ts start \
  --task examples/tasks/error-test.md \
  --vm devbox-default \
  --id error-001
```

**Expected:**
- Execution time: ~1 second
- Final state: failed
- Events: 5 (1 started + 1 step_started + 1 step_completed + 1 step_started + 1 step_failed)
- Step 3 does not execute

---

## Task File Format

All task files follow the RFC 002 TASK.md format:

```markdown
# Task Title

## Strategy

\`\`\`json
{
  "steps": [
    { "type": "bash", "command": "echo 'hello'" }
  ]
}
\`\`\`

## Data

Description of input data (optional)

## Acceptance Criteria

- Criterion 1
- Criterion 2
```

## Checking Results

After starting a run, check its status:

```bash
# Check status
bun run apps/cli/src/devbox.ts status <run_id> --vm devbox-default

# Get handoff
bun run apps/cli/src/devbox.ts handoff <run_id> --vm devbox-default

# View events
bun run apps/cli/src/devbox.ts events <run_id> --vm devbox-default

# List generated files
incus exec devbox-default -- ls -lh /home/devbox/runs/<run_id>/
```

## Creating Custom Tasks

To create your own task:

1. Copy an example file
2. Modify the steps array with your commands
3. Update the acceptance criteria
4. Run with `devbox start --task your-task.md`

**Tips:**
- Use `mkdir -p output` to create output directory
- Use heredoc (`<< 'EOF'`) for multi-line file content
- Escape special characters in bash commands
- Test commands locally first
