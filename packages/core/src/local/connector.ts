import type { Connector } from '../interfaces/index.ts';

/**
 * LocalConnector - Executes commands directly on the local machine (VM-internal use)
 * Used by agent running inside the VM, not for remote control
 */
export class LocalConnector implements Connector {
  async execCommand(cmd: string): Promise<string> {
    const proc = Bun.spawn(['sh', '-c', cmd], {
      stdout: 'pipe',
      stderr: 'pipe',
    });

    const output = await new Response(proc.stdout).text();
    await proc.exited;

    if (proc.exitCode !== 0) {
      const error = await new Response(proc.stderr).text();
      throw new Error(`Command failed (exit ${proc.exitCode}): ${error}`);
    }

    return output;
  }

  async readFile(path: string): Promise<string> {
    return await Bun.file(path).text();
  }

  async writeFile(path: string, data: string): Promise<void> {
    await Bun.write(path, data);
  }

  async copyDir(remotePath: string, localPath: string): Promise<void> {
    // For local connector, just use cp command
    await this.execCommand(`cp -r ${remotePath} ${localPath}`);
  }

  async tmuxStart(session: string, command: string): Promise<void> {
    const proc = Bun.spawn(['tmux', 'new-session', '-d', '-s', session, command], {
      stdout: 'pipe',
      stderr: 'pipe',
    });
    await proc.exited;
    if (proc.exitCode !== 0) {
      const error = await new Response(proc.stderr).text();
      throw new Error(`Failed to start tmux session: ${error}`);
    }
  }

  async tmuxCapture(session: string, lines: number): Promise<string> {
    const proc = Bun.spawn(['tmux', 'capture-pane', '-t', session, '-p', '-S', `-${lines}`], {
      stdout: 'pipe',
      stderr: 'pipe',
    });
    const output = await new Response(proc.stdout).text();
    await proc.exited;
    if (proc.exitCode !== 0) {
      const error = await new Response(proc.stderr).text();
      throw new Error(`Failed to capture tmux pane: ${error}`);
    }
    return output;
  }

  async tmuxAlive(session: string): Promise<boolean> {
    const proc = Bun.spawn(['tmux', 'has-session', '-t', session], {
      stdout: 'pipe',
      stderr: 'pipe',
    });
    await proc.exited;
    return proc.exitCode === 0;
  }

  async tmuxKill(session: string): Promise<void> {
    const proc = Bun.spawn(['tmux', 'kill-session', '-t', session], {
      stdout: 'pipe',
      stderr: 'pipe',
    });
    await proc.exited;
    // Ignore errors (session might not exist)
  }
}
