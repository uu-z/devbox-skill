// Provisioner manages VM lifecycle
export interface Provisioner {
  create(spec: VMSpec): Promise<VM>;
  destroy(id: string): Promise<void>;
  get(id: string): Promise<VM>;
}

export interface VMSpec {
  id: string;
  image: string;
  tags?: Record<string, string>;
}

export interface VM {
  id: string;
  address: string;
  state: string;
}

// Connector handles VM communication
export interface Connector {
  execCommand(cmd: string): Promise<string>;
  readFile(path: string): Promise<string>;
  writeFile(path: string, data: string): Promise<void>;
  copyDir(remotePath: string, localPath: string): Promise<void>;

  // Tmux operations
  tmuxStart(session: string, command: string): Promise<void>;
  tmuxCapture(session: string, lines: number): Promise<string>;
  tmuxAlive(session: string): Promise<boolean>;
  tmuxKill(session: string): Promise<void>;
}

// Protocol manages file-based contract
export interface Protocol {
  writeTask(task: Task): Promise<void>;
  readStatus(): Promise<Status>;
  tailEvents(since: Date): Promise<Event[]>;
  appendEvent(event: Event): Promise<void>;
  readHandoff(): Promise<Handoff | null>;
  writeHandoff(handoff: Handoff): Promise<void>;
  writeSteeringCommand(cmd: string): Promise<void>;
  writeSteeringInstruction(instruction: string): Promise<void>;
  readSteeringCommands(): Promise<string[]>;
}

export interface Task {
  description: string;
  data?: string;
  acceptance?: string;
}

export interface Status {
  run_id: string;
  state: 'pending' | 'running' | 'needs_attention' | 'completed' | 'failed' | 'stopped';
  phase: string;
  started_at: string;
  updated_at: string;
  error?: string;
}

export interface Event {
  ts: string;
  event: string;
  data?: Record<string, any>;
}

export interface Handoff {
  run_id: string;
  summary: string;
  results?: string;
  recommendations?: string;
  artifacts?: string[];
}
