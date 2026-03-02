/**
 * Shell safety utilities
 */

export function escapeShellArg(str: string): string {
  return `'${str.replace(/'/g, "'\\''")}'`;
}

export interface Connector {
  execCommand(cmd: string): Promise<string>;
}

export async function appendLine(
  connector: Connector,
  path: string,
  line: string
): Promise<void> {
  await connector.execCommand(`echo ${escapeShellArg(line)} >> ${path}`);
}
