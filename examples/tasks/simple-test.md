# Simple Command Test

## Strategy

```json
{
  "steps": [
    { "type": "bash", "command": "echo 'Hello from devbox agent'" },
    { "type": "bash", "command": "date" },
    { "type": "bash", "command": "uname -a" }
  ]
}
```

## Data

No external data required.

## Acceptance Criteria

- All 3 commands execute successfully
- STATUS.json shows completed state
- HANDOFF.md contains all command outputs
