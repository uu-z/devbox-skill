import type { Connector } from '../interfaces/index.ts';
import { FileProtocol } from '../protocol/file-protocol.ts';

export interface Step {
  type: 'bash';
  command: string;
}

export interface Task {
  steps: Step[];
}

export class AgentExecutor {
  private protocol: FileProtocol;

  constructor(
    private runDir: string,
    private connector: Connector
  ) {
    this.protocol = new FileProtocol(runDir, connector);
  }

  async execute(): Promise<void> {
    try {
      // 1. Read TASK.md
      const taskContent = await this.connector.readFile(`${this.runDir}/TASK.md`);
      const task = this.parseTask(taskContent);

      // 2. Update status to running
      await this.protocol.updateStatus({
        state: 'running',
        phase: 'executing',
        updated_at: new Date().toISOString(),
      });

      await this.protocol.appendEvent({
        ts: new Date().toISOString(),
        event: 'execution_started',
        data: { step_count: task.steps.length },
      });

      // 3. Execute steps
      const results: string[] = [];
      for (let i = 0; i < task.steps.length; i++) {
        const step = task.steps[i];

        await this.protocol.appendEvent({
          ts: new Date().toISOString(),
          event: 'step_started',
          data: { step: i, command: step.command },
        });

        try {
          const output = await this.connector.execCommand(step.command);
          results.push(`Step ${i + 1}: ${step.command}\n${output}`);

          await this.protocol.appendEvent({
            ts: new Date().toISOString(),
            event: 'step_completed',
            data: { step: i, output: output.slice(0, 200) },
          });
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : String(error);
          results.push(`Step ${i + 1} FAILED: ${step.command}\n${errMsg}`);

          await this.protocol.appendEvent({
            ts: new Date().toISOString(),
            event: 'step_failed',
            data: { step: i, error: errMsg },
          });

          throw error;
        }
      }

      // 4. Update status to completed
      await this.protocol.updateStatus({
        state: 'completed',
        phase: 'finished',
        updated_at: new Date().toISOString(),
      });

      await this.protocol.appendEvent({
        ts: new Date().toISOString(),
        event: 'execution_completed',
        data: { total_steps: task.steps.length },
      });

      // 5. Write HANDOFF.md
      await this.protocol.writeHandoff({
        run_id: this.runDir.split('/').pop() || 'unknown',
        summary: `Executed ${task.steps.length} steps successfully`,
        results: results.join('\n\n'),
        recommendations: 'All steps completed without errors',
        artifacts: [],
      });

    } catch (error) {
      await this.protocol.updateStatus({
        state: 'failed',
        phase: 'error',
        updated_at: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
      });

      await this.protocol.appendEvent({
        ts: new Date().toISOString(),
        event: 'execution_failed',
        data: { error: error instanceof Error ? error.message : String(error) },
      });

      throw error;
    }
  }

  private parseTask(content: string): Task {
    // Try to extract JSON from markdown code block first
    const codeBlockMatch = content.match(/```json\n([\s\S]*?)\n```/);
    if (codeBlockMatch) {
      return JSON.parse(codeBlockMatch[1].trim());
    }

    // Fallback: extract from Strategy section
    const strategyMatch = content.match(/## Strategy\n([\s\S]*?)\n\n/);
    if (!strategyMatch) {
      throw new Error('Invalid TASK.md: missing Strategy section');
    }

    const strategyJson = strategyMatch[1].trim();
    return JSON.parse(strategyJson);
  }
}
