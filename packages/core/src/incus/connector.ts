import type { Connector } from '../interfaces/index.ts';
import { execProcess } from '../utils/process';

export class IncusConnector implements Connector {
  constructor(private instanceName: string) {}

  async execCommand(cmd: string): Promise<string> {
    return await execProcess(['incus', 'exec', this.instanceName, '--', 'sh', '-c', cmd]);
  }

  async readFile(path: string): Promise<string> {
    const tmpFile = `/tmp/devbox-read-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    try {
      await execProcess(['incus', 'file', 'pull', `${this.instanceName}${path}`, tmpFile]);
      const content = await Bun.file(tmpFile).text();
      await Bun.spawn(['rm', tmpFile]).exited;
      return content;
    } catch (err) {
      try {
        await Bun.spawn(['rm', tmpFile]).exited;
      } catch {}
      throw err;
    }
  }

  async writeFile(path: string, data: string): Promise<void> {
    const tmpFile = `/tmp/devbox-write-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    try {
      await Bun.write(tmpFile, data);
      await execProcess(['incus', 'file', 'push', tmpFile, `${this.instanceName}${path}`]);
      await Bun.spawn(['rm', tmpFile]).exited;
    } catch (err) {
      try {
        await Bun.spawn(['rm', tmpFile]).exited;
      } catch {}
      throw err;
    }
  }

  async copyDir(remotePath: string, localPath: string): Promise<void> {
    await execProcess(['incus', 'file', 'pull', '-r', `${this.instanceName}${remotePath}`, localPath]);
  }

  async tmuxStart(session: string, command: string): Promise<void> {
    await execProcess(['incus', 'exec', this.instanceName, '--', 'tmux', 'new-session', '-d', '-s', session, command]);
  }

  async tmuxCapture(session: string, lines: number): Promise<string> {
    return await execProcess(['incus', 'exec', this.instanceName, '--', 'tmux', 'capture-pane', '-t', session, '-p', '-S', `-${lines}`]);
  }

  async tmuxAlive(session: string): Promise<boolean> {
    try {
      await execProcess(['incus', 'exec', this.instanceName, '--', 'tmux', 'has-session', '-t', session]);
      return true;
    } catch {
      return false;
    }
  }

  async tmuxKill(session: string): Promise<void> {
    try {
      await execProcess(['incus', 'exec', this.instanceName, '--', 'tmux', 'kill-session', '-t', session]);
    } catch {
      // Session might not exist, ignore error
    }
  }
}
