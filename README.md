# Devbox - AI Agent Orchestrator

AI coding agent orchestration system based on [nanoclaw](https://github.com/qwibitai/nanoclaw), supporting Discord/Slack multi-user collaboration.

## Quick Start

```bash
cd apps/nanoclaw

# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env
# Edit .env, fill in ANTHROPIC_API_KEY and channel tokens

# 3. Build Docker image
cd container && ./build.sh

# 4. Start service
npm run dev
```

## Architecture

```
Discord/Slack
    ↓ (@mention bot)
nanoclaw process
    ↓ (spawn container)
Docker container (Claude Agent SDK)
    ↓ (execute tasks)
Results stream back to thread
```

**Core Features**:
- Discord/Slack dual-channel support
- Thread-level isolation (each task in separate thread)
- Session persistence (maintain context across messages)
- Docker container security isolation
- 90-minute timeout (suitable for strategy backtesting)

## Adding Channels

nanoclaw uses skill system to dynamically add channels:

```bash
# Run in claude CLI
/add-discord   # Add Discord support
/add-slack     # Add Slack support
/add-telegram  # Add Telegram support
```

See [apps/nanoclaw/README.md](apps/nanoclaw/README.md) for details

## Documentation

- [RFC 003](docs/RFC/RFC%20003:%20Nanoclaw-Based%20Orchestrator.md) - Architecture specification
- [MVP Design](docs/plans/2026-03-03-nanoclaw-mvp.md) - Implementation plan
- [RFC 002](docs/RFC/RFC%20002:%20Devbox%20Control%20Plane.md) - Legacy architecture (archived)

## Legacy Implementation

The Incus-based implementation from RFC 002 has been archived to `archive/` directory for reference only.

## License

MIT
