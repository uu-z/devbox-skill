/**
 * Generate TASK.md with embedded file protocol requirements
 */
export function generateTaskWithProtocol(userTask: string, runId: string): string {
  return `${userTask}

---

## Protocol Requirements (CRITICAL)

You are running in an isolated VM. Follow this file protocol exactly:

**Working Directory**: \`/home/devbox/runs/${runId}/workspace/\`

### 1. STATUS.json - Update on every phase change

Write atomically (tmp + mv):
\`\`\`bash
cat > ../STATUS.json.tmp <<'EOF'
{
  "run_id": "${runId}",
  "state": "running",
  "phase": "implementing",
  "started_at": "2025-03-02T10:00:00Z",
  "updated_at": "$(date -Iseconds)"
}
EOF
mv ../STATUS.json.tmp ../STATUS.json
\`\`\`

**Valid phases**: implementing, building, backtesting, analyzing, writing_report

**Valid states**: running, completed, failed

### 2. EVENTS.log - Append key events

One JSON object per line:
\`\`\`bash
echo '{"ts":"'$(date -Iseconds)'","event":"phase_changed","data":{"phase":"implementing"}}' >> ../EVENTS.log
\`\`\`

**Key events**: phase_changed, step_started, step_completed, error

### 3. HANDOFF.md - Write on completion

\`\`\`bash
cat > ../HANDOFF.md.tmp <<'EOF'
# Run ${runId} Complete

## Summary
[One sentence summary of what was accomplished]

## Results
[Key metrics: P&L, Sharpe ratio, fill rate, etc]

## Recommendations
[Feasibility conclusion and next steps]

## Artifacts
- output/strategy.rs
- output/report.md
- output/metrics.json
EOF
mv ../HANDOFF.md.tmp ../HANDOFF.md
\`\`\`

### 4. Final STATUS.json - Mark as completed

\`\`\`bash
cat > ../STATUS.json.tmp <<'EOF'
{
  "run_id": "${runId}",
  "state": "completed",
  "phase": "finished",
  "started_at": "[keep original timestamp]",
  "updated_at": "$(date -Iseconds)"
}
EOF
mv ../STATUS.json.tmp ../STATUS.json
\`\`\`

### Error Handling

If you encounter errors:
\`\`\`bash
cat > ../STATUS.json.tmp <<'EOF'
{
  "run_id": "${runId}",
  "state": "failed",
  "phase": "error",
  "error": "[error message]",
  "started_at": "[keep original]",
  "updated_at": "$(date -Iseconds)"
}
EOF
mv ../STATUS.json.tmp ../STATUS.json
\`\`\`

---

**Start working now. Update STATUS.json immediately to "running".**
`;
}
