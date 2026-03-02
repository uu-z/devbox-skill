/**
 * Shared process execution utilities using execa
 */
import { execa } from 'execa';

export async function execProcess(args: string[]): Promise<string> {
  const [command, ...commandArgs] = args;
  const { stdout } = await execa(command, commandArgs);
  return stdout;
}

export async function execProcessSilent(args: string[]): Promise<void> {
  const [command, ...commandArgs] = args;
  await execa(command, commandArgs);
}
