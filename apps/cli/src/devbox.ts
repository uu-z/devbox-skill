#!/usr/bin/env bun
import { Command } from 'commander';
import { Provisioner, Connector, FileProtocol } from '@devbox/core';
import type { Status } from '@devbox/core';

const program = new Command();

program
  .name('devbox')
  .description('Devbox Control Plane - manage coding agent runs')
  .version('0.3.0');

// VM commands
const vm = program.command('vm').description('Manage VMs');

vm
  .command('create')
  .description('Create a new VM')
  .option('--id <vm_id>', 'VM identifier', `devbox-${Date.now()}`)
  .option('--image <image>', 'Container image', 'images:alpine/3.19')
  .action(async (options) => {
    const prov = new Provisioner();
    const result = await prov.create({
      id: options.id,
      image: options.image,
      tags: { managed: 'devbox' },
    });
    console.log(JSON.stringify(result, null, 2));
  });

vm
  .command('destroy')
  .description('Destroy a VM')
  .argument('<vm_id>', 'VM identifier')
  .action(async (vmId) => {
    const prov = new Provisioner();
    await prov.destroy(vmId);
    console.log(JSON.stringify({ status: 'destroyed', vm_id: vmId }, null, 2));
  });

// Start command
program
  .command('start')
  .description('Start a new run')
  .requiredOption('--task <file>', 'Task file path')
  .requiredOption('--vm <vm_id>', 'VM identifier')
  .option('--id <run_id>', 'Run identifier', `run-${Date.now()}`)
  .option('--tag <key=value...>', 'Add tags (can be used multiple times)')
  .action(async (options) => {
    const { task: taskFile, vm: vmId, id: runId } = options;

    // Parse tags
    const tags: Record<string, string> = {};
    if (options.tag) {
      const tagArray = Array.isArray(options.tag) ? options.tag : [options.tag];
      for (const tag of tagArray) {
        const [key, value] = tag.split('=');
        if (key && value) {
          tags[key] = value;
        }
      }
    }

    // Read task file
    const taskContent = await Bun.file(taskFile).text();

    // Create connector
    const conn = new Connector(vmId);

    // Create run directory
    const runDir = `/home/devbox/runs/${runId}`;
    await conn.execCommand(`mkdir -p ${runDir}/workspace ${runDir}/CONTROL`);

    // Deploy agent code to VM (one-time setup per VM)
    const agentBinDir = '/home/devbox/bin';
    await conn.execCommand(`mkdir -p ${agentBinDir}`);

    // Copy agent-entry.ts
    const agentEntryPath = new URL('./agent-entry.ts', import.meta.url).pathname;
    await conn.writeFile(`${agentBinDir}/agent-entry.ts`, await Bun.file(agentEntryPath).text());

    // Copy core package (simplified: just copy the built files)
    // In production, this should be a proper bundle
    const coreDir = new URL('../../../packages/core/src', import.meta.url).pathname;
    await conn.execCommand(`rm -rf ${agentBinDir}/core && mkdir -p ${agentBinDir}/core`);

    // Copy core files recursively
    const copyCore = async (dir: string, targetPrefix: string = '') => {
      const entries = await Array.fromAsync(new Bun.Glob('**/*.ts').scan({ cwd: dir }));
      for (const entry of entries) {
        const sourcePath = `${dir}/${entry}`;
        const targetPath = `${agentBinDir}/core/${targetPrefix}${entry}`;
        const targetDir = targetPath.substring(0, targetPath.lastIndexOf('/'));
        await conn.execCommand(`mkdir -p ${targetDir}`);
        await conn.writeFile(targetPath, await Bun.file(sourcePath).text());
      }
    };
    await copyCore(coreDir);

    // Write TASK.md
    const proto = new FileProtocol(runDir, conn);
    await proto.writeTask({ description: taskContent });

    // Write initial STATUS.json
    const status: Status = {
      run_id: runId,
      state: 'pending',
      phase: 'initializing',
      started_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await conn.writeFile(`${runDir}/STATUS.json`, JSON.stringify(status, null, 2));

    // Write tags metadata
    if (Object.keys(tags).length > 0) {
      await conn.writeFile(`${runDir}/TAGS.json`, JSON.stringify(tags, null, 2));
    }

    // Start agent in tmux session
    const tmuxSession = `run_${runId}`;
    const bunPath = '/root/.bun/bin/bun';
    const agentCmd = `cd ${runDir} && ${bunPath} run ${agentBinDir}/agent-entry.ts ${runId}`;
    await conn.tmuxStart(tmuxSession, agentCmd);

    console.log(JSON.stringify({
      run_id: runId,
      vm_id: vmId,
      state: 'pending',
      run_dir: runDir,
      tmux_session: tmuxSession,
    }, null, 2));
  });

// Status command
program
  .command('status')
  .description('Get run status')
  .argument('<run_id>', 'Run identifier')
  .requiredOption('--vm <vm_id>', 'VM identifier')
  .action(async (runId, options) => {
    const conn = new Connector(options.vm);
    const runDir = `/home/devbox/runs/${runId}`;
    const proto = new FileProtocol(runDir, conn);

    const status = await proto.readStatus();
    console.log(JSON.stringify(status, null, 2));
  });

// List command
program
  .command('list')
  .description('List all runs')
  .requiredOption('--vm <vm_id>', 'VM identifier')
  .option('--state <state>', 'Filter by state')
  .option('--tag <key=value>', 'Filter by tag')
  .action(async (options) => {
    const conn = new Connector(options.vm);
    const output = await conn.execCommand('ls /home/devbox/runs 2>/dev/null || echo ""');
    const runIds = output.trim().split('\n').filter(id => id);

    const runs: Status[] = [];
    for (const runId of runIds) {
      try {
        const runDir = `/home/devbox/runs/${runId}`;
        const proto = new FileProtocol(runDir, conn);
        const status = await proto.readStatus();

        // Filter by state
        if (options.state && status.state !== options.state) {
          continue;
        }

        // Filter by tag
        if (options.tag) {
          try {
            const tagsContent = await conn.readFile(`${runDir}/TAGS.json`);
            const tags = JSON.parse(tagsContent);
            const [key, value] = options.tag.split('=');
            if (!tags[key] || tags[key] !== value) {
              continue;
            }
          } catch {
            // No tags file or parse error, skip this run
            continue;
          }
        }

        runs.push(status);
      } catch {
        // Skip invalid runs
      }
    }

    console.log(JSON.stringify(runs, null, 2));
  });

// Stop command
program
  .command('stop')
  .description('Stop a run')
  .argument('<run_id>', 'Run identifier')
  .requiredOption('--vm <vm_id>', 'VM identifier')
  .option('--force', 'Force kill without graceful shutdown')
  .action(async (runId, options) => {
    const conn = new Connector(options.vm);
    const runDir = `/home/devbox/runs/${runId}`;
    const tmuxSession = `run_${runId}`;

    if (!options.force) {
      // Graceful shutdown: write stop command to CONTROL/cmd.queue
      try {
        await conn.execCommand(`mkdir -p ${runDir}/CONTROL`);
        await conn.execCommand(`echo "stop" >> ${runDir}/CONTROL/cmd.queue`);
        console.log('Graceful stop requested, waiting for agent to finish...');

        // Wait up to 10 seconds for graceful shutdown
        for (let i = 0; i < 10; i++) {
          const alive = await conn.tmuxAlive(tmuxSession);
          if (!alive) {
            console.log('Agent stopped gracefully');
            break;
          }
          await Bun.sleep(1000);
        }
      } catch (err) {
        console.error('Failed to request graceful stop:', err);
      }
    }

    // Kill tmux session (force or after graceful timeout)
    await conn.tmuxKill(tmuxSession);

    // Update status
    const proto = new FileProtocol(runDir, conn);
    try {
      const status = await proto.readStatus();
      status.state = 'stopped';
      status.updated_at = new Date().toISOString();
      await conn.writeFile(`${runDir}/STATUS.json`, JSON.stringify(status, null, 2));
    } catch {
      // STATUS.json might not exist yet
    }

    console.log(JSON.stringify({ status: 'stopped', run_id: runId, force: !!options.force }, null, 2));
  });

// Handoff command
program
  .command('handoff')
  .description('Get run handoff')
  .argument('<run_id>', 'Run identifier')
  .requiredOption('--vm <vm_id>', 'VM identifier')
  .action(async (runId, options) => {
    const conn = new Connector(options.vm);
    const runDir = `/home/devbox/runs/${runId}`;
    const proto = new FileProtocol(runDir, conn);

    const handoff = await proto.readHandoff();
    console.log(JSON.stringify(handoff, null, 2));
  });

// Events command
program
  .command('events')
  .description('Get run events')
  .argument('<run_id>', 'Run identifier')
  .requiredOption('--vm <vm_id>', 'VM identifier')
  .option('--follow', 'Follow events in real-time')
  .action(async (runId, options) => {
    const conn = new Connector(options.vm);
    const runDir = `/home/devbox/runs/${runId}`;
    const proto = new FileProtocol(runDir, conn);

    if (options.follow) {
      let lastCheck = new Date(0);
      while (true) {
        const events = await proto.tailEvents(lastCheck);
        for (const event of events) {
          console.log(JSON.stringify(event));
          lastCheck = new Date(event.ts);
        }
        await Bun.sleep(5000);
      }
    } else {
      const events = await proto.tailEvents(new Date(0));
      console.log(JSON.stringify(events, null, 2));
    }
  });

// Agent command (manual execution, for testing)
program
  .command('agent')
  .description('Manually execute agent for a run (for testing)')
  .argument('<run_id>', 'Run identifier')
  .requiredOption('--vm <vm_id>', 'VM identifier')
  .action(async (runId, options) => {
    const conn = new Connector(options.vm);
    const agentBinDir = '/home/devbox/bin';
    const runDir = `/home/devbox/runs/${runId}`;
    const bunPath = '/root/.bun/bin/bun';

    console.log(`Executing agent for run: ${runId}`);

    // Execute agent directly (not in tmux, for debugging)
    const output = await conn.execCommand(
      `cd ${runDir} && ${bunPath} run ${agentBinDir}/agent-entry.ts ${runId}`
    );

    console.log(output);
  });

// Snapshot command
program
  .command('snapshot')
  .description('Capture tmux output for debugging')
  .argument('<run_id>', 'Run identifier')
  .requiredOption('--vm <vm_id>', 'VM identifier')
  .option('--lines <n>', 'Number of lines to capture', '200')
  .action(async (runId, options) => {
    const conn = new Connector(options.vm);
    const lines = parseInt(options.lines);
    const tmuxSession = `run_${runId}`;

    const alive = await conn.tmuxAlive(tmuxSession);
    if (!alive) {
      console.error(JSON.stringify({
        error: 'Tmux session not found or already exited',
        run_id: runId,
        tmux_session: tmuxSession
      }, null, 2));
      process.exit(1);
    }

    const output = await conn.tmuxCapture(tmuxSession, lines);

    console.log(JSON.stringify({
      run_id: runId,
      captured_at: new Date().toISOString(),
      lines: lines,
      content: output
    }, null, 2));
  });

// Logs command
program
  .command('logs')
  .description('View agent LOG.md')
  .argument('<run_id>', 'Run identifier')
  .requiredOption('--vm <vm_id>', 'VM identifier')
  .option('--follow', 'Follow log output (tail -f)')
  .action(async (runId, options) => {
    const conn = new Connector(options.vm);
    const runDir = `/home/devbox/runs/${runId}`;
    const logPath = `${runDir}/workspace/LOG.md`;

    try {
      if (options.follow) {
        // Note: This will block, use Ctrl+C to exit
        console.log(`Following ${logPath}...`);
        await conn.execCommand(`tail -f ${logPath}`);
      } else {
        const content = await conn.readFile(logPath);
        console.log(content);
      }
    } catch (error) {
      console.error(`Error reading LOG.md: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  });

// Watch command
program
  .command('watch')
  .description('Watch for run events (blocks until completion or needs_attention)')
  .argument('<run_id>', 'Run identifier')
  .requiredOption('--vm <vm_id>', 'VM identifier')
  .option('--interval <seconds>', 'Polling interval in seconds', '5')
  .option('--timeout <seconds>', 'Maximum wait time in seconds (0 = no timeout)', '0')
  .action(async (runId, options) => {
    const conn = new Connector(options.vm);
    const runDir = `/home/devbox/runs/${runId}`;
    const proto = new FileProtocol(runDir, conn);
    const interval = parseInt(options.interval) * 1000;
    const timeout = parseInt(options.timeout) * 1000;
    const startTime = Date.now();

    let lastStatus: Status | null = null;
    let lastEventCount = 0;

    console.error(`Watching run: ${runId} (interval: ${options.interval}s)`);

    while (true) {
      try {
        // Check timeout
        if (timeout > 0 && Date.now() - startTime > timeout) {
          console.error('Watch timeout reached');
          process.exit(1);
        }

        // Read current status
        const status = await proto.readStatus();

        // Emit status change event
        if (!lastStatus || status.state !== lastStatus.state || status.phase !== lastStatus.phase) {
          console.log(JSON.stringify({
            event: 'status_changed',
            timestamp: new Date().toISOString(),
            run_id: runId,
            old_state: lastStatus?.state,
            new_state: status.state,
            old_phase: lastStatus?.phase,
            new_phase: status.phase,
          }));
        }

        // Emit new events
        const events = await proto.tailEvents(new Date(0));
        if (events.length > lastEventCount) {
          for (let i = lastEventCount; i < events.length; i++) {
            console.log(JSON.stringify({
              event: 'agent_event',
              timestamp: new Date().toISOString(),
              run_id: runId,
              agent_event: events[i],
            }));
          }
          lastEventCount = events.length;
        }

        // Check for terminal states
        if (status.state === 'completed' || status.state === 'failed' || status.state === 'stopped') {
          console.log(JSON.stringify({
            event: 'run_finished',
            timestamp: new Date().toISOString(),
            run_id: runId,
            final_state: status.state,
          }));
          process.exit(0);
        }

        // Check for needs_attention
        if (status.state === 'needs_attention') {
          console.log(JSON.stringify({
            event: 'needs_attention',
            timestamp: new Date().toISOString(),
            run_id: runId,
            phase: status.phase,
            error: status.error,
          }));
          process.exit(0);
        }

        lastStatus = status;
      } catch (error) {
        console.error(JSON.stringify({
          event: 'watch_error',
          timestamp: new Date().toISOString(),
          run_id: runId,
          error: error instanceof Error ? error.message : String(error),
        }));
      }

      await Bun.sleep(interval);
    }
  });

// Steer command
program
  .command('steer')
  .description('Send steering command to running agent')
  .argument('<run_id>', 'Run identifier')
  .argument('<command>', 'Steering command (continue, summarize, stop, interrupt)')
  .requiredOption('--vm <vm_id>', 'VM identifier')
  .option('--instruction <file>', 'Instruction file for rich context')
  .action(async (runId, command, options) => {
    const conn = new Connector(options.vm);
    const runDir = `/home/devbox/runs/${runId}`;
    const proto = new FileProtocol(runDir, conn);

    // Validate command
    const validCommands = ['continue', 'summarize', 'stop', 'interrupt'];
    if (!validCommands.includes(command)) {
      console.error(`Invalid command: ${command}`);
      console.error(`Valid commands: ${validCommands.join(', ')}`);
      process.exit(1);
    }

    // Write command to queue
    await proto.writeSteeringCommand(command);
    console.log(JSON.stringify({
      run_id: runId,
      command: command,
      queued_at: new Date().toISOString(),
    }, null, 2));

    // Write instruction if provided
    if (options.instruction) {
      const instructionContent = await Bun.file(options.instruction).text();
      await proto.writeSteeringInstruction(instructionContent);
      console.log(JSON.stringify({
        instruction_file: options.instruction,
        instruction_written: true,
      }, null, 2));
    }
  });

program.parse();
