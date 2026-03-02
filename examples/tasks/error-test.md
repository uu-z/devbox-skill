# Error Handling Test

## Strategy

```json
{
  "steps": [
    { "type": "bash", "command": "echo 'Step 1: This will succeed'" },
    { "type": "bash", "command": "false" },
    { "type": "bash", "command": "echo 'Step 3: This should not run'" }
  ]
}
```

## Data

No external data required.

## Acceptance Criteria

- Step 1 executes successfully
- Step 2 fails (exit code 1)
- Step 3 does not execute
- STATUS.json shows failed state
- STATUS.json contains error message
- EVENTS.log contains step_failed event
