// Main exports for @devbox/core
// Incus implementation (RFC 002 compliant)
export { IncusProvisioner as Provisioner } from './incus/provisioner';
export { IncusConnector as Connector } from './incus/connector';
export { LocalConnector } from './local/connector';

export { FileProtocol } from './protocol/file-protocol';
export { generateTaskWithProtocol } from './protocol/task-generator';
export { AgentExecutor } from './agent/executor';

// Re-export interfaces
export type {
  Provisioner as IProvisioner,
  Connector as IConnector,
  Protocol,
  VM,
  VMSpec,
  Task,
  Status,
  Event,
  Handoff
} from './interfaces';
