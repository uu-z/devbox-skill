# Devbox - AI Agent Orchestrator

An AI coding agent orchestration system built on [nanoclaw](https://github.com/qwibitai/nanoclaw), with Discord/Slack multi-user collaboration support.

## Quick Start

```bash
cd apps/nanoclaw

# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env
# Edit .env and fill in ANTHROPIC_API_KEY and channel tokens

# 3. Build the Docker image
cd container && ./build.sh

# 4. Start the service
npm run dev
```

## Architecture

```
Discord / Slack
    |  (@mention bot)
    v
nanoclaw process
    |  (spawn container)
    v
Docker container (Claude Agent SDK)
    |  (execute task)
    v
Results streamed back to thread
```

**Core Features:**

- **Multi-channel support** — Discord and Slack out of the box
- **Thread-level isolation** — each task runs in its own thread
- **Session persistence** — context is maintained across messages
- **Docker container sandboxing** — secure, isolated execution
- **90-minute timeout** — suitable for long-running tasks like strategy backtesting

## Adding Channels

Devbox uses a skill system to dynamically add channel integrations:

```bash
# Run inside the Claude CLI
/add-discord   # Add Discord support
/add-slack     # Add Slack support
/add-telegram  # Add Telegram support
```

See [apps/nanoclaw/README.md](apps/nanoclaw/README.md) for details.

## Project Structure

```
devbox-poc/
├── apps/
│   └── nanoclaw/              # nanoclaw fork
│       ├── src/
│       │   ├── channels/      # Discord, Slack, WhatsApp adapters
│       │   ├── container-runner.ts
│       │   ├── group-queue.ts
│       │   ├── config.ts
│       │   └── index.ts
│       ├── container/
│       │   ├── Dockerfile
│       │   ├── entrypoint.sh
│       │   └── agent-runner/
│       ├── groups/            # Runtime data
│       └── data/              # SQLite storage
├── docs/
│   ├── RFC/
│   │   ├── RFC 003            # Current architecture spec
│   │   └── RFC 002            # Legacy spec (archived)
│   └── plans/
│       └── 2026-03-03-nanoclaw-mvp.md
├── examples/tasks/            # Example TASK.md files
└── README.md
```

## Documentation

- [RFC 003 — Nanoclaw-Based Orchestrator](docs/RFC/RFC%20003:%20Nanoclaw-Based%20Orchestrator.md) — Architecture specification
- [MVP Design](docs/plans/2026-03-03-nanoclaw-mvp.md) — Implementation plan
- [RFC 002 — Devbox Control Plane](docs/RFC/RFC%20002:%20Devbox%20Control%20Plane.md) — Legacy architecture (archived)

## Legacy Implementation

The original RFC 002 Incus-based implementation has been archived to the `archive/` directory for reference only.

## License

MIT
