# Devbox Skill Installation

## For Claude Code

```bash
# 1. Link skill to Claude Code
ln -s $(pwd)/skills/devbox ~/.claude/skills/devbox

# 2. Verify installation
ls -la ~/.claude/skills/devbox

# 3. Use in Claude Code
/devbox echo hello, date, uname -a
```

## For OpenClaw

```bash
# 1. Link skill to OpenClaw
ln -s $(pwd)/skills/devbox ~/.openclaw/skills/devbox

# 2. Verify installation
ls -la ~/.openclaw/skills/devbox

# 3. Use in OpenClaw
/devbox npm install && npm test
```

## Usage Examples

**Simple command:**
```
/devbox echo "Hello World"
```

**Multiple steps:**
```
/devbox 1. Install dependencies, 2. Run tests, 3. Build project
```

**With commas:**
```
/devbox git clone repo, cd repo, npm install, npm test
```

**Complex task:**
```
/devbox Download https://example.com/data.csv, process with awk, generate report
```

## How It Works

1. Parses your task description into bash steps
2. Creates Incus VM (reuses if exists)
3. Executes steps in isolated environment
4. Returns structured results with:
   - Summary
   - Full command outputs
   - Recommendations
   - Error details (if any)

## Requirements

- Incus installed and running
- Bun runtime
- devbox-poc project built

## Troubleshooting

**Skill not found:**
```bash
# Check symlink
ls -la ~/.claude/skills/devbox
# Should point to: /path/to/devbox-poc/skills/devbox
```

**VM creation fails:**
```bash
# Check Incus
incus list
colima status  # if using Colima
```

**Permission denied:**
```bash
chmod +x skills/devbox/skill.ts
```
