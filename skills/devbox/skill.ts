#!/usr/bin/env bun
/**
 * Devbox Skill - Launch AI coding agents in isolated Incus VMs
 *
 * Usage: /devbox <task_description>
 */

import { tmpdir } from 'os';
import { join } from 'path';

const DEVBOX_CLI = join(process.cwd(), 'apps/cli/src/devbox.ts');
const DEFAULT_VM = 'devbox-default';

interface Step {
  type: 'bash';
  command: string;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: /devbox <task_description>');
    process.exit(1);
  }

  const taskDescription = args.join(' ');

  console.log('🚀 Launching Devbox agent...');
  console.log(`📝 Task: ${taskDescription}`);
  console.log('');

  // 1. Parse task into steps
  const steps = parseTaskDescription(taskDescription);

  console.log('📋 Execution plan:');
  steps.forEach((step, i) => {
    console.log(`  ${i + 1}. ${step.command}`);
  });
  console.log('');

  // 2. Generate run ID
  const runId = `run-${Date.now()}`;
  const vmId = DEFAULT_VM;

  // 3. Ensure VM exists
  console.log('🔧 Preparing VM...');
  await ensureVM(vmId);

  // 4. Create task file
  const taskFile = join(tmpdir(), `devbox-task-${runId}.json`);
  await Bun.write(taskFile, JSON.stringify({ steps }, null, 2));

  // 5. Start run
  console.log('▶️  Starting agent...');
  await execDevbox(['start', '--task', taskFile, '--vm', vmId, '--id', runId]);

  // 6. Execute agent
  console.log('⚙️  Executing...');
  await execDevbox(['agent', runId, '--vm', vmId]);

  // 7. Get results
  console.log('📊 Collecting results...');
  const handoff = await getHandoff(runId, vmId);

  // 8. Display results
  console.log('');
  console.log('✅ Execution completed!');
  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('📄 HANDOFF REPORT');
  console.log('═══════════════════════════════════════');
  console.log('');
  console.log('Summary:');
  console.log(handoff.summary);
  console.log('');
  console.log('Results:');
  console.log(handoff.results);
  console.log('');
  if (handoff.recommendations) {
    console.log('Recommendations:');
    console.log(handoff.recommendations);
    console.log('');
  }
  console.log('═══════════════════════════════════════');

  // 9. Cleanup task file
  await Bun.spawn(['rm', taskFile]).exited;
}

function parseTaskDescription(description: string): Step[] {
  // Simple parser: split by common delimiters
  const lines = description
    .split(/[,;]|\d+\./)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  if (lines.length === 0) {
    return [{ type: 'bash', command: description }];
  }

  return lines.map(cmd => ({
    type: 'bash',
    command: cmd,
  }));
}

async function ensureVM(vmId: string): Promise<void> {
  // Check if VM exists using incus list
  const proc = Bun.spawn(['incus', 'list', '--format', 'json'], {
    stdout: 'pipe',
  });

  await proc.exited;

  if (proc.exitCode === 0) {
    const output = await new Response(proc.stdout).text();
    const vms = JSON.parse(output);
    const exists = vms.some((vm: any) => vm.name === vmId);

    if (exists) {
      return; // VM already exists
    }
  }

  // VM doesn't exist, create it
  await execDevbox(['vm', 'create', '--id', vmId, '--image', 'images:alpine/3.20']);
}

async function execDevbox(args: string[], silent = false): Promise<string> {
  const proc = Bun.spawn(['bun', 'run', DEVBOX_CLI, ...args], {
    stdout: silent ? 'pipe' : 'inherit',
    stderr: silent ? 'pipe' : 'inherit',
  });

  await proc.exited;

  if (proc.exitCode !== 0) {
    throw new Error(`devbox command failed: ${args.join(' ')}`);
  }

  if (silent && proc.stdout) {
    return await new Response(proc.stdout).text();
  }

  return '';
}

async function getHandoff(runId: string, vmId: string): Promise<any> {
  const proc = Bun.spawn(['bun', 'run', DEVBOX_CLI, 'handoff', runId, '--vm', vmId], {
    stdout: 'pipe',
  });

  await proc.exited;

  if (proc.exitCode !== 0) {
    throw new Error('Failed to get handoff');
  }

  const output = await new Response(proc.stdout).text();
  return JSON.parse(output);
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
