# Devbox - AI Agent Orchestrator

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![Docker](https://img.shields.io/badge/docker-required-blue)](https://www.docker.com/)

**Multi-channel AI coding agent orchestrator with Discord/Slack collaboration support**

Built on [nanoclaw](https://github.com/qwibitai/nanoclaw) - Spawn isolated AI agents in Docker containers for secure, collaborative development.

[Features](#features) • [Quick Start](#quick-start) • [Architecture](#architecture) • [Documentation](#documentation)

</div>

---

## Features

### 🤖 Multi-Channel Support
- **Discord** - Mention bot in channels or threads
- **Slack** - Native Slack app integration
- **Telegram** - Bot commands and group chat support
- Extensible skill system for adding new channels

### 🔒 Secure Isolation
- **Docker Containers** - Each agent runs in isolated environment
- **Thread-Level Isolation** - Separate context per conversation
- **Session Persistence** - Maintains context across messages
- **90-Minute Timeout** - Automatic cleanup for long-running tasks

### 🚀 Developer Experience
- **Streaming Responses** - Real-time output in chat threads
- **Claude Agent SDK** - Powered by Anthropic's Claude
- **Hot Reload** - Development mode with auto-restart
- **Monorepo Structure** - Organized with Turborepo

---

## Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **Docker** - For container runtime
- **Anthropic API Key** - Get from [console.anthropic.com](https://console.anthropic.com)
- **Discord/Slack Token** - Bot token from your platform

### Installation

```bash
# Clone the repository
git clone https://github.com/uu-z/devbox-skill.git
cd devbox-skill

# Navigate to nanoclaw app
cd apps/nanoclaw

# Install dependencies
npm install
```

### Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your credentials
nano .env
```

**Required Environment Variables:**

```env
# Anthropic API Key (required)
ANTHROPIC_API_KEY=sk-ant-...

# Discord Configuration (optional)
DISCORD_TOKEN=your_discord_bot_token
DISCORD_CLIENT_ID=your_client_id

# Slack Configuration (optional)
SLACK_BOT_TOKEN=xoxb-...
SLACK_APP_TOKEN=xapp-...
SLACK_SIGNING_SECRET=...

# Telegram Configuration (optional)
TELEGRAM_BOT_TOKEN=...
```

### Build Docker Image

```bash
# Build the agent container
cd container
./build.sh

# Verify image
docker images | grep devbox
```

### Start Development Server

```bash
# Return to nanoclaw directory
cd ..

# Start in development mode
npm run dev

# Or start in production mode
npm start
```

### Usage

**Discord:**
```
@YourBot write a Python script to analyze CSV data
```

**Slack:**
```
@devbox-bot create a REST API with Express.js
```

**Telegram:**
```
/start
/task Implement a binary search algorithm
```

---

## Architecture

```
┌─────────────────────────────────────────┐
│   Discord / Slack / Telegram            │
│   (User mentions bot)                   │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│   Nanoclaw Process                      │
│   - Message routing                     │
│   - Session management                  │
│   - Thread isolation                    │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│   Docker Container                      │
│   - Claude Agent SDK                    │
│   - Isolated filesystem                 │
│   - Resource limits                     │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│   Streaming Response                    │
│   - Real-time output                    │
│   - Thread replies                      │
│   - Error handling                      │
└─────────────────────────────────────────┘
```

### Key Components

- **Nanoclaw Process** - Main orchestrator handling message routing and session management
- **Docker Runtime** - Secure container execution with resource limits
- **Claude Agent SDK** - AI-powered code generation and task execution
- **Channel Adapters** - Platform-specific integrations (Discord, Slack, Telegram)

### Session Management

- Each conversation thread gets a unique session ID
- Sessions persist across messages for context continuity
- Automatic cleanup after 90 minutes of inactivity
- Thread-level isolation prevents context leakage

---

## Adding Channels

Devbox uses a skill-based system for adding new communication channels:

```bash
# In Claude CLI
/add-discord   # Add Discord support
/add-slack     # Add Slack support
/add-telegram  # Add Telegram support
```

Each skill includes:
- Platform authentication
- Message parsing
- Response formatting
- Thread management

See [apps/nanoclaw/README.md](apps/nanoclaw/README.md) for detailed channel configuration.

---

## Project Structure

```
devbox-skill/
├── apps/
│   └── nanoclaw/          # Main orchestrator application
│       ├── src/           # Source code
│       ├── container/     # Docker build files
│       └── README.md      # Detailed app documentation
├── docs/
│   ├── RFC/               # Architecture specifications
│   └── plans/             # Implementation plans
├── examples/              # Usage examples
├── scripts/               # Build and deployment scripts
└── turbo.json            # Monorepo configuration
```

---

## Documentation

### Architecture & Design

- **[RFC 003: Nanoclaw-Based Orchestrator](docs/RFC/RFC%20003:%20Nanoclaw-Based%20Orchestrator.md)**
  - Current architecture specification
  - Design decisions and rationale
  - Implementation guidelines

- **[MVP Design](docs/plans/2026-03-03-nanoclaw-mvp.md)**
  - Minimum viable product scope
  - Development roadmap
  - Feature priorities

- **[RFC 002: Devbox Control Plane](docs/RFC/RFC%20002:%20Devbox%20Control%20Plane.md)** *(Archived)*
  - Previous Incus-based implementation
  - Historical reference only

### Application Docs

- **[Nanoclaw App README](apps/nanoclaw/README.md)**
  - Detailed setup instructions
  - Channel configuration
  - API reference
  - Troubleshooting guide

---

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --grep "session management"

# Watch mode
npm test -- --watch
```

### Building for Production

```bash
# Build all packages
npm run build

# Build specific app
cd apps/nanoclaw && npm run build
```

### Docker Development

```bash
# Build development image
cd apps/nanoclaw/container
./build.sh dev

# Run container locally
docker run -it --rm \
  -e ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY \
  devbox-agent:latest
```

---

## Troubleshooting

### Common Issues

**Docker build fails:**
```bash
# Clean Docker cache
docker system prune -a
cd apps/nanoclaw/container && ./build.sh
```

**Bot doesn't respond:**
- Verify bot token in `.env`
- Check bot has proper permissions in channel
- Review logs: `npm run dev` output

**Session timeout:**
- Default 90 minutes can be adjusted in config
- Check Docker container logs: `docker logs <container_id>`

---

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT License - see [LICENSE](LICENSE) file for details

---

## Acknowledgments

- Built on [nanoclaw](https://github.com/qwibitai/nanoclaw) by Qwibit AI
- Powered by [Anthropic Claude](https://www.anthropic.com)
- Inspired by the AI agent orchestration community

---

<div align="center">

**[⬆ Back to Top](#devbox---ai-agent-orchestrator)**

Made with ❤️ by the Devbox team

</div>
