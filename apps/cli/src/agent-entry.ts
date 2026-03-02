#!/usr/bin/env bun
/**
 * Agent Entry Point - Runs inside the VM
 *
 * This script is deployed to /home/devbox/bin/agent-entry.ts
 * and executed by devbox start via tmux.
 *
 * Usage: bun run agent-entry.ts <run_id>
 */

// Import from local core directory (deployed alongside this file)
import { AgentExecutor } from './core/agent/executor.ts';
import { LocalConnector } from './core/local/connector.ts';

async function main() {
  const runId = process.argv[2];

  if (!runId) {
    console.error('Usage: agent-entry.ts <run_id>');
    process.exit(1);
  }

  const runDir = `/home/devbox/runs/${runId}`;
  const connector = new LocalConnector();

  console.log(`[Agent] Starting execution for run: ${runId}`);
  console.log(`[Agent] Run directory: ${runDir}`);

  try {
    const executor = new AgentExecutor(runDir, connector);
    await executor.execute();
    console.log(`[Agent] Execution completed successfully`);
  } catch (error) {
    console.error(`[Agent] Execution failed:`, error);
    process.exit(1);
  }
}

main();
