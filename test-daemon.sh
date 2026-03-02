#!/usr/bin/env bash
# Test daemon HANDOFF detection

set -e

echo "🧪 Testing Daemon HANDOFF Detection"
echo "===================================="
echo ""

# 1. Start daemon in background
echo "1️⃣  Starting daemon..."
DEVBOX_VM_ID=devbox-default \
DEVBOX_AUTO_DISCOVER=false \
bun run apps/cli/src/devboxd.ts > /tmp/devboxd-test.log 2>&1 &
DAEMON_PID=$!
echo "✅ Daemon started (PID: $DAEMON_PID)"
sleep 2
echo ""

# 2. Start a run
echo "2️⃣  Starting test run..."
RUN_ID="daemon-test-$(date +%s)"
bun run apps/cli/src/devbox.ts start \
  --task examples/tasks/simple-test.md \
  --vm devbox-default \
  --id "$RUN_ID" \
  --tag test=daemon > /dev/null

echo "✅ Run started: $RUN_ID"
echo ""

# 3. Register run with daemon (simulate)
echo "3️⃣  Waiting for run to complete..."
sleep 5

# 4. Check daemon logs for HANDOFF detection
echo "4️⃣  Checking daemon logs..."
if grep -q "HANDOFF.md detected" /tmp/devboxd-test.log; then
    echo "✅ Daemon detected HANDOFF.md"
else
    echo "⚠️  Daemon did not detect HANDOFF.md (run may have completed too fast)"
fi
echo ""

# 5. Check for run_completed notification
if grep -q "run_completed" /tmp/devboxd-test.log; then
    echo "✅ Daemon sent run_completed notification"
else
    echo "⚠️  No run_completed notification found"
fi
echo ""

# 6. Cleanup
echo "6️⃣  Cleaning up..."
kill $DAEMON_PID 2>/dev/null || true
echo "✅ Daemon stopped"
echo ""

echo "📋 Daemon log excerpt:"
tail -20 /tmp/devboxd-test.log
echo ""

echo "🎉 Test complete!"
