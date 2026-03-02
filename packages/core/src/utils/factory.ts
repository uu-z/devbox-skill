/**
 * Factory utilities for common object creation patterns
 */

import { FileProtocol } from "../protocol/file-protocol";
import type { Connector } from "../interfaces/index";

export function createRunContext(
  vmId: string,
  runId: string,
  ConnectorClass: new (vmId: string) => Connector
) {
  const connector = new ConnectorClass(vmId);
  const runDir = `/home/devbox/runs/${runId}`;
  const protocol = new FileProtocol(runDir, connector);

  return { connector, protocol, runDir };
}
