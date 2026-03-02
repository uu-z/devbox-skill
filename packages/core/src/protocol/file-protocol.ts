import type { Protocol, Task, Status, Event, Handoff, Connector } from '../interfaces/index.ts';
import { FILE_NAMES } from '../constants.ts';
import { appendLine, escapeShellArg } from '../utils/shell';

export class FileProtocol implements Protocol {
  constructor(
    private runDir: string,
    private connector: Connector
  ) {}

  async writeTask(task: Task): Promise<void> {
    const content = `# Execution Plan

## Strategy
${task.description}

## Data
${task.data || ''}

## Acceptance
${task.acceptance || ''}
`;

    const path = `${this.runDir}/${FILE_NAMES.TASK}`;
    await this.connector.writeFile(path, content);
  }

  async readStatus(): Promise<Status> {
    const path = `${this.runDir}/${FILE_NAMES.STATUS}`;
    const data = await this.connector.readFile(path);
    return JSON.parse(data);
  }

  async updateStatus(updates: Partial<Status>): Promise<void> {
    const path = `${this.runDir}/${FILE_NAMES.STATUS}`;
    const tmpPath = `${path}.tmp`;

    const current = await this.readStatus();
    const updated = { ...current, ...updates };

    // Atomic write: write to .tmp, then mv
    await this.connector.writeFile(tmpPath, JSON.stringify(updated, null, 2));
    await this.connector.execCommand(`mv ${tmpPath} ${path}`);
  }

  async tailEvents(since: Date): Promise<Event[]> {
    const path = `${this.runDir}/${FILE_NAMES.EVENTS}`;

    try {
      const data = await this.connector.readFile(path);
      const lines = data.trim().split('\n').filter(line => line);

      const events: Event[] = [];
      for (const line of lines) {
        const event = JSON.parse(line);
        const eventTime = new Date(event.ts);
        if (eventTime > since) {
          events.push(event);
        }
      }

      return events;
    } catch {
      return [];
    }
  }

  async appendEvent(event: Event): Promise<void> {
    const path = `${this.runDir}/${FILE_NAMES.EVENTS}`;
    const line = JSON.stringify(event);
    await appendLine(this.connector, path, line);
  }

  async readHandoff(): Promise<Handoff | null> {
    const path = `${this.runDir}/${FILE_NAMES.HANDOFF}`;

    try {
      const content = await this.connector.readFile(path);

      // Parse markdown sections
      const sections = this.parseMarkdownSections(content);

      return {
        run_id: sections['Run ID'] || '',
        summary: sections['Summary'] || '',
        results: sections['Results'],
        recommendations: sections['Recommendations'],
        artifacts: sections['Artifacts']?.split('\n').filter(l => l.trim()),
      };
    } catch {
      return null;
    }
  }

  async writeHandoff(handoff: Handoff): Promise<void> {
    const content = `# Handoff: ${handoff.run_id}

## Summary
${handoff.summary}

${handoff.results ? `## Results\n${handoff.results}\n` : ''}
${handoff.recommendations ? `## Recommendations\n${handoff.recommendations}\n` : ''}
${handoff.artifacts ? `## Artifacts\n${handoff.artifacts.join('\n')}\n` : ''}
`;

    const path = `${this.runDir}/${FILE_NAMES.HANDOFF}`;
    const tmpPath = `${path}.tmp`;

    // Atomic write: write to .tmp, then mv
    await this.connector.writeFile(tmpPath, content);
    await this.connector.execCommand(`mv ${tmpPath} ${path}`);
  }

  async writeSteeringCommand(cmd: string): Promise<void> {
    const controlDir = `${this.runDir}/${FILE_NAMES.CONTROL_DIR}`;
    const path = `${controlDir}/${FILE_NAMES.CMD_QUEUE}`;

    await this.connector.execCommand(`mkdir -p ${escapeShellArg(controlDir)}`);
    await appendLine(this.connector, path, cmd);
  }

  async writeSteeringInstruction(instruction: string): Promise<void> {
    const controlDir = `${this.runDir}/${FILE_NAMES.CONTROL_DIR}`;
    const path = `${controlDir}/${FILE_NAMES.INSTRUCTION}`;

    await this.connector.execCommand(`mkdir -p ${escapeShellArg(controlDir)}`);
    await this.connector.writeFile(path, instruction);
  }

  async readSteeringCommands(): Promise<string[]> {
    const controlDir = `${this.runDir}/${FILE_NAMES.CONTROL_DIR}`;
    const path = `${controlDir}/${FILE_NAMES.CMD_QUEUE}`;

    try {
      const content = await this.connector.readFile(path);
      return content.trim().split('\n').filter(line => line.trim());
    } catch {
      return [];
    }
  }

  private parseMarkdownSections(content: string): Record<string, string> {
    const sections: Record<string, string> = {};
    const lines = content.split('\n');
    let currentSection = '';
    let currentContent: string[] = [];

    for (const line of lines) {
      if (line.startsWith('## ')) {
        if (currentSection) {
          sections[currentSection] = currentContent.join('\n').trim();
        }
        currentSection = line.substring(3).trim();
        currentContent = [];
      } else if (currentSection) {
        currentContent.push(line);
      }
    }

    if (currentSection) {
      sections[currentSection] = currentContent.join('\n').trim();
    }

    return sections;
  }
}

