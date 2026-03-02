#!/usr/bin/env bash
# E2E Test for RFC 002 Phase 1 MVP

set -e

echo "🧪 RFC 002 E2E Test"
echo "==================="
echo ""

# 1. Check prerequisites
echo "1️⃣  Checking prerequisites..."
if ! command -v incus &> /dev/null; then
    echo "❌ incus not found"
    exit 1
fi

if ! incus list --format json | grep -q "devbox-default"; then
    echo "❌ devbox-default VM not found"
    exit 1
fi

echo "✅ Prerequisites OK"
echo ""

# 2. Create test task
echo "2️⃣  Using example task..."
TEST_TASK="examples/tasks/simple-test.md"

if [ ! -f "$TEST_TASK" ]; then
    echo "❌ Example task not found: $TEST_TASK"
    exit 1
fi

echo "✅ Using task: $TEST_TASK"
echo ""

# 3. Start run
echo "3️⃣  Starting run..."
RUN_ID="e2e-test-$(date +%s)"
START_OUTPUT=$(bun run apps/cli/src/devbox.ts start --task "$TEST_TASK" --vm devbox-default --id "$RUN_ID")
echo "$START_OUTPUT"

if ! echo "$START_OUTPUT" | grep -q "\"run_id\": \"$RUN_ID\""; then
    echo "❌ Failed to start run"
    exit 1
fi

echo "✅ Run started: $RUN_ID"
echo ""

# 4. Wait for completion
echo "4️⃣  Waiting for completion..."
MAX_WAIT=30
ELAPSED=0

while [ $ELAPSED -lt $MAX_WAIT ]; do
    STATUS=$(bun run apps/cli/src/devbox.ts status "$RUN_ID" --vm devbox-default)
    STATE=$(echo "$STATUS" | grep -o '"state": "[^"]*"' | cut -d'"' -f4)

    echo "   Status: $STATE (${ELAPSED}s elapsed)"

    if [ "$STATE" = "completed" ] || [ "$STATE" = "failed" ]; then
        break
    fi

    sleep 2
    ELAPSED=$((ELAPSED + 2))
done

if [ "$STATE" != "completed" ]; then
    echo "❌ Run did not complete (state: $STATE)"
    exit 1
fi

echo "✅ Run completed"
echo ""

# 5. Verify HANDOFF
echo "5️⃣  Verifying HANDOFF..."
HANDOFF=$(bun run apps/cli/src/devbox.ts handoff "$RUN_ID" --vm devbox-default)

if ! echo "$HANDOFF" | grep -q "Hello from devbox agent"; then
    echo "❌ HANDOFF missing expected output"
    exit 1
fi

echo "✅ HANDOFF verified"
echo ""

# 6. Verify file structure
echo "6️⃣  Verifying file structure..."
FILES=$(incus exec devbox-default -- ls /home/devbox/runs/"$RUN_ID"/)

for FILE in TASK.md STATUS.json EVENTS.log HANDOFF.md workspace CONTROL; do
    if ! echo "$FILES" | grep -q "$FILE"; then
        echo "❌ Missing file: $FILE"
        exit 1
    fi
done

echo "✅ File structure verified"
echo ""

# 7. Verify EVENTS.log
echo "7️⃣  Verifying EVENTS.log..."
EVENTS=$(incus exec devbox-default -- cat /home/devbox/runs/"$RUN_ID"/EVENTS.log)

if ! echo "$EVENTS" | grep -q "execution_started"; then
    echo "❌ EVENTS.log missing execution_started"
    exit 1
fi

if ! echo "$EVENTS" | grep -q "execution_completed"; then
    echo "❌ EVENTS.log missing execution_completed"
    exit 1
fi

EVENT_COUNT=$(echo "$EVENTS" | wc -l | tr -d ' ')
if [ "$EVENT_COUNT" -lt 7 ]; then
    echo "❌ EVENTS.log has too few events (expected ≥7, got $EVENT_COUNT)"
    exit 1
fi

echo "✅ EVENTS.log verified ($EVENT_COUNT events)"
echo ""

# 8. Cleanup
echo "8️⃣  Cleanup complete (no temp files created)"
echo ""

echo "🎉 All tests passed!"
echo ""
echo "Summary:"
echo "  Run ID: $RUN_ID"
echo "  State: $STATE"
echo "  Events: $EVENT_COUNT"
