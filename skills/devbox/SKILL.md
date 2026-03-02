---
name: devbox
description: Launch AI coding agent to automatically implement and execute tasks in isolated Incus VM
---

# Devbox Skill

Launch isolated AI coding agents in Incus VMs to execute tasks autonomously.

## When to Use

- Execute multi-step bash commands in isolated environment
- Run potentially risky operations safely
- Need complete Linux environment (not just container)
- Want to collect structured execution results

## Usage

```
/devbox <task_description>
```

## What It Does

1. Creates/reuses Incus VM
2. Writes task to TASK.md (RFC 002 format)
3. Launches agent executor
4. Monitors execution via STATUS.json
5. Returns HANDOFF.md with results

## Examples

**Run tests in isolation:**
```
/devbox Run npm install && npm test, collect coverage report
```

**Execute risky script:**
```
/devbox Download and run setup.sh from https://example.com/setup.sh
```

**Multi-step deployment:**
```
/devbox 1. Build Docker image 2. Push to registry 3. Deploy to staging
```

## Implementation

The skill:
1. Parses user request into bash steps
2. Creates task JSON
3. Calls `devbox start --task <file> --vm <id> --id <run_id>`
4. Polls `devbox status` until completed/failed
5. Retrieves `devbox handoff` for results
6. Cleans up VM if requested

## Output

Returns structured handoff:
- Summary of execution
- Full command outputs
- Recommendations
- Artifacts (if any)

## Safety

- Each run in isolated VM
- No access to host filesystem by default
- Can destroy VM after completion
- All operations logged to EVENTS.log
