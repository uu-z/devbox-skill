#!/usr/bin/env bun
import { Connector, FileProtocol } from '@devbox/core';
import type { Status } from '@devbox/core';

interface Config {
  vmId: string;
  pollInterval: number;
  heartbeatTimeout: number;
  webhookURL?: string;
  webhookURLs?: string[];
  crashDetection?: boolean;
  autoDiscover?: boolean;
}

interface RunInfo {
  runId: string;
  vmId: string;
  runDir: string;
  connector: Connector;
  protocol: FileProtocol;
  lastStatus: Status | null;
  tmuxSession?: string;
}

class Daemon {
  private runs = new Map<string, RunInfo>();

  constructor(private config: Config) {}

  async run() {
    console.log('devboxd starting...');
    console.log(`VM ID: ${this.config.vmId}`);
    console.log(`Poll interval: ${this.config.pollInterval}ms`);
    console.log(`Heartbeat timeout: ${this.config.heartbeatTimeout}ms`);

    if (this.config.webhookURL) {
      console.log(`Webhook URL: ${this.config.webhookURL}`);
    }

    // Auto-discover existing runs
    if (this.config.autoDiscover) {
      console.log('Auto-discovering existing runs...');
      await this.discoverRuns();
      console.log(`Found ${this.runs.size} active runs`);
    }

    while (true) {
      await this.poll();
      await Bun.sleep(this.config.pollInterval);
    }
  }

  private async poll() {
    await Promise.all(
      Array.from(this.runs.values()).map(run => this.checkRun(run))
    );
  }

  private async checkRun(run: RunInfo) {
    try {
      const status = await run.protocol.readStatus();

      // Check for HANDOFF.md (completion detection)
      const handoffPath = `${run.runDir}/HANDOFF.md`;
      try {
        await run.connector.readFile(handoffPath);
        // HANDOFF.md exists → run completed
        if (status.state !== 'completed' && status.state !== 'failed') {
          console.log(`[${run.runId}] HANDOFF.md detected, marking as completed`);
          await this.notify('run_completed', run.runId, {
            handoff_detected: true,
          });
        }
        this.runs.delete(run.runId); // Remove from monitoring
        return;
      } catch {
        // HANDOFF.md not found yet, continue monitoring
      }

      // Crash detection: check if tmux session exists
      if (this.config.crashDetection && status.state === 'running') {
        await this.checkCrash(run, status);
      }

      // Check for state changes
      if (!run.lastStatus || status.state !== run.lastStatus.state) {
        console.log(`[${run.runId}] State changed: ${run.lastStatus?.state || 'none'} -> ${status.state}`);
        await this.notify('state_changed', run.runId, {
          old_state: run.lastStatus?.state,
          new_state: status.state,
        });
      }

      // Check for phase changes
      if (!run.lastStatus || status.phase !== run.lastStatus.phase) {
        console.log(`[${run.runId}] Phase changed: ${run.lastStatus?.phase || 'none'} -> ${status.phase}`);
        await this.notify('phase_changed', run.runId, {
          old_phase: run.lastStatus?.phase,
          new_phase: status.phase,
        });
      }

      // Check for needs_attention
      if (status.state === 'needs_attention') {
        console.log(`[${run.runId}] Run needs attention`);
        await this.notify('needs_attention', run.runId, {
          phase: status.phase,
          error: status.error,
        });
      }

      // Check for completion (terminal states)
      if (status.state === 'completed' || status.state === 'failed' || status.state === 'stopped') {
        console.log(`[${run.runId}] Run finished: ${status.state}`);
        await this.notify('run_finished', run.runId, { state: status.state });
        this.runs.delete(run.runId); // Clean up finished runs
        return;
      }

      // Check heartbeat
      if (status.state === 'running') {
        const timeSinceUpdate = Date.now() - new Date(status.updated_at).getTime();
        if (timeSinceUpdate > this.config.heartbeatTimeout) {
          console.log(`[${run.runId}] Heartbeat stale: ${timeSinceUpdate}ms since last update`);
          await this.notify('heartbeat_stale', run.runId, {
            last_update: status.updated_at,
            elapsed: timeSinceUpdate,
          });
        }
      }

      // Update tracking
      run.lastStatus = status;
    } catch (err) {
      console.error(`[${run.runId}] Failed to check run:`, err);
    }
  }

  private async checkCrash(run: RunInfo, status: Status) {
    try {
      // Check if tmux session exists
      const tmuxSession = run.tmuxSession || run.runId;
      const alive = await run.connector.tmuxAlive(tmuxSession);

      // If tmux session doesn't exist but status is still running, it crashed
      if (!alive) {
        console.log(`[${run.runId}] Crash detected: tmux session not found`);

        // Mark as failed
        const failedStatus: Status = {
          ...status,
          state: 'failed',
          error: 'Agent crashed: tmux session terminated unexpectedly',
          updated_at: new Date().toISOString(),
        };

        const runDir = `/home/devbox/runs/${run.runId}`;
        await run.connector.writeFile(`${runDir}/STATUS.json`, JSON.stringify(failedStatus, null, 2));

        // Append crash event
        await run.protocol.appendEvent({
          ts: new Date().toISOString(),
          event: 'agent_crashed',
          data: { reason: 'tmux_session_terminated' },
        });

        await this.notify('agent_crashed', run.runId, {
          reason: 'tmux_session_terminated',
        });
      }
    } catch (err) {
      // Ignore errors in crash detection
    }
  }

  private async notify(event: string, runId: string, data: any) {
    const notification = {
      event,
      run_id: runId,
      timestamp: new Date().toISOString(),
      data,
    };

    console.log('Notification:', JSON.stringify(notification));

    // Send webhooks
    const urls = this.config.webhookURLs || (this.config.webhookURL ? [this.config.webhookURL] : []);

    for (const url of urls) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'devboxd/1.0',
          },
          body: JSON.stringify(notification),
        });

        if (!response.ok) {
          console.error(`Webhook failed (${url}): ${response.status} ${response.statusText}`);
        } else {
          console.log(`Webhook sent to ${url}`);
        }
      } catch (err) {
        console.error(`Webhook error (${url}):`, err);
      }
    }
  }

  registerRun(runId: string, vmId: string, tmuxSession?: string) {
    const conn = new Connector(vmId);
    const runDir = `/home/devbox/runs/${runId}`;
    const proto = new FileProtocol(runDir, conn);

    this.runs.set(runId, {
      runId,
      vmId,
      runDir,
      connector: conn,
      protocol: proto,
      lastStatus: null,
      tmuxSession: tmuxSession || runId,
    });
    console.log(`Registered run: ${runId} on VM: ${vmId}`);
  }

  unregisterRun(runId: string) {
    this.runs.delete(runId);
    console.log(`Unregistered run: ${runId}`);
  }

  listRuns(): string[] {
    return Array.from(this.runs.keys());
  }

  private async discoverRuns() {
    const conn = new Connector(this.config.vmId);

    try {
      const output = await conn.execCommand('ls -1 /home/devbox/runs/ 2>/dev/null || true');
      const runIds = output.trim().split('\n').filter(id => id.length > 0);

      for (const runId of runIds) {
        const runDir = `/home/devbox/runs/${runId}`;
        const proto = new FileProtocol(runDir, conn);

        try {
          const status = await proto.readStatus();
          // Only monitor non-terminal runs
          if (status.state !== 'completed' && status.state !== 'failed' && status.state !== 'stopped') {
            this.registerRun(runId, this.config.vmId);
          }
        } catch {
          // Skip runs without valid STATUS.json
        }
      }
    } catch (err) {
      console.error('Failed to discover runs:', err);
    }
  }
}

// Main
const config: Config = {
  vmId: process.env.DEVBOX_VM_ID || 'devbox-default',
  pollInterval: 15000, // 15 seconds
  heartbeatTimeout: 180000, // 3 minutes
  webhookURL: process.env.DEVBOX_WEBHOOK_URL,
  webhookURLs: process.env.DEVBOX_WEBHOOK_URLS?.split(','),
  crashDetection: process.env.DEVBOX_CRASH_DETECTION !== 'false',
  autoDiscover: process.env.DEVBOX_AUTO_DISCOVER !== 'false',
};

const daemon = new Daemon(config);

// TODO: Load runs from registry or config
// For now, runs must be registered manually

daemon.run();
