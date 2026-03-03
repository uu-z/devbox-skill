# Devbox Control Plane

A control plane for orchestrating AI coding agents inside isolated [Incus](https://linuxcontainers.org/incus/) VMs. Fully compliant with the RFC 002 specification.

Devbox lets you launch, monitor, steer, and collect results from autonomous coding agents running in sandboxed Linux environments — all through a simple CLI or as a Claude Code / OpenClaw skill.

## Features

| Feature | Status |
|---|---|
| Incus VM provisioning & management | Done |
| Run lifecycle (start / status / stop) | Done |
| Agent executor | Done |
| File protocol (TASK.md, STATUS.json, EVENTS.log, HANDOFF.md) | Done |
| CONTROL/ steering | Done |
| State machine (pending, running, needs\_attention, completed, failed, stopped) | Done |
| Daemon monitoring (`devboxd`) | Done |
| Crash detection | Done |
| Webhook notifications | Done |
| Claude Code / OpenClaw integration | Done |

## Architecture

```
+--------------------+      +--------------------+      +----------------------+
|   Orchestrator     |      |   Control Plane    |      |     Devbox VM        |
|  (OpenClaw,        | CLI  |                    | incus|                      |
|   Claude Code,     | ---> |  devbox  (CLI)     | exec |  /home/devbox/       |
|   human)           |      |  devboxd (daemon)  | file |  runs/<id>/          |
|                    | <--- |                    | ---> |    workspace/        |
|                    | JSON |                    |      |    CONTROL/          |
|                    | notify                    | <--- |    coding agent      |
+--------------------+      +--------------------+ files+----------------------+
```

1. The **Orchestrator** (a human, Claude Code, or OpenClaw) submits a task via the CLI.
2. The **Control Plane** creates or reuses an Incus VM, writes the task, and launches the agent.
3. The **Devbox VM** executes the task in full isolation, communicating progress through the RFC 002 file protocol.

## Quick Start

### Option 1: Claude Code / OpenClaw Skill (Recommended)

```bash
# Install the skill
ln -s $(pwd)/skills/devbox ~/.claude/skills/devbox

# Run a task
/devbox echo hello, date, uname -a
```

See [skills/devbox/INSTALL.md](skills/devbox/INSTALL.md) for detailed installation and usage.

### Option 2: CLI

**Run the E2E test suite (uses bundled example tasks):**

```bash
./test-e2e.sh
```

**Or run a task manually:**

```bash
bun run apps/cli/src/devbox.ts start \
  --task examples/tasks/backtest-ma.md \
  --vm devbox-default \
  --id test-001
```

See [examples/tasks/README.md](examples/tasks/README.md) for more example tasks.

## Installation

### Linux

```bash
# Install Incus
sudo snap install incus
incus admin init --minimal

# Run the demo
cd apps/cli
./demo.sh
```

### macOS / Windows (via Colima)

```bash
# Install Colima (macOS)
brew install colima

# Start Colima with virtualization support
colima start --vm-type=vz --vz-rosetta --mount-type=virtiofs

# Install Incus inside Colima
colima ssh
sudo snap install incus
sudo incus admin init --minimal
exit

# Run the demo
cd apps/cli
./demo.sh
```

## CLI Reference

### VM Management

```bash
devbox vm create --id <vm_id> --image <image>
devbox vm destroy <vm_id>
```

### Run Management

```bash
devbox start   --task <file> --vm <vm_id> --id <run_id>
devbox status  <run_id>  --vm <vm_id>
devbox events  <run_id>  --vm <vm_id> [--follow]
devbox list    --vm <vm_id>
devbox stop    <run_id>  --vm <vm_id>
```

### Steering

```bash
devbox steer <run_id> --vm <vm_id> --cmd <command> [--instruction <file>]
```

### Debugging

```bash
devbox snapshot <run_id> --vm <vm_id> [--output <file>]
devbox handoff  <run_id> --vm <vm_id>
devbox get      <run_id> --vm <vm_id> --output-dir <path>
```

## Project Structure

This is a [Turborepo](https://turbo.build/) monorepo with the following packages:

| Package | Description |
|---|---|
| `apps/cli` | CLI binaries (`devbox` and `devboxd`) |
| `packages/core` | Core library — interfaces, protocol, Incus/local provisioners, agent logic |
| `packages/skill` | Claude Code skill installer |
| `skills/devbox` | Skill definition (SKILL.md, INSTALL.md, skill.ts) |
| `examples/tasks` | Example TASK.md files for testing |

## Why Incus?

- **RFC 002 compliant** — the only supported backend, designed around the spec.
- **Full Linux environment** — system containers, not application containers. Agents get a real OS.
- **Strong isolation** — independent CPU, memory, and network per VM.
- **Production-ready** — stable, well-maintained, and battle-tested.

## Documentation

- [RFC 002 — Devbox Control Plane Specification](docs/RFC/RFC%20002:%20Devbox%20Control%20Plane.md)
- [Incus Testing Guide](docs/TESTING-INCUS.md)
- [Quick Start Guide](QUICKSTART.md)

## Roadmap

- [x] Agent executor logic
- [x] Orchestrator integration
- [ ] Production deployment

## License

MIT
