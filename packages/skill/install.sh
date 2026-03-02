#!/bin/bash
# Install devbox skill to Claude Code

set -e

SKILL_DIR="$(cd "$(dirname "$0")" && pwd)/skills"
CLAUDE_SKILLS_DIR="$HOME/.claude/skills"

echo "Installing devbox skill..."
echo "Source: $SKILL_DIR"
echo "Target: $CLAUDE_SKILLS_DIR"

# Create skills directory if it doesn't exist
mkdir -p "$CLAUDE_SKILLS_DIR"

# Copy skill files
cp -r "$SKILL_DIR"/* "$CLAUDE_SKILLS_DIR/"

echo "✓ Devbox skill installed successfully!"
echo ""
echo "Available commands:"
echo "  /devbox-vm-create    - Create a new devbox VM"
echo "  /devbox-vm-destroy   - Destroy a devbox VM"
echo "  /devbox-start        - Start a task in a VM"
echo "  /devbox-status       - Check task status"
echo "  /devbox-events       - Stream task events"
echo "  /devbox-get          - Get task output"
