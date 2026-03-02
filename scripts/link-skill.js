#!/usr/bin/env node
/**
 * Link devbox skill to Claude Code and OpenClaw
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const HOME = process.env.HOME;
const SKILL_SOURCE = path.join(__dirname, '..', 'skills', 'devbox');

const TARGETS = [
  {
    name: 'Claude Code',
    path: path.join(HOME, '.claude', 'skills', 'devbox'),
  },
  {
    name: 'OpenClaw',
    path: path.join(HOME, '.openclaw', 'skills', 'devbox'),
  },
];

console.log('🔗 Linking devbox skill...\n');

let successCount = 0;

for (const target of TARGETS) {
  try {
    // Create parent directory
    const parentDir = path.dirname(target.path);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
      console.log(`✓ Created directory: ${parentDir}`);
    }

    // Remove existing symlink/directory
    if (fs.existsSync(target.path)) {
      const stats = fs.lstatSync(target.path);
      if (stats.isSymbolicLink()) {
        fs.unlinkSync(target.path);
        console.log(`✓ Removed old symlink: ${target.path}`);
      } else {
        console.log(`⚠️  ${target.path} exists but is not a symlink, skipping`);
        continue;
      }
    }

    // Create symlink
    fs.symlinkSync(SKILL_SOURCE, target.path);
    console.log(`✅ Linked to ${target.name}: ${target.path}`);
    successCount++;
  } catch (error) {
    console.error(`❌ Failed to link to ${target.name}:`, error.message);
  }

  console.log('');
}

console.log('═══════════════════════════════════════');
console.log(`✅ Successfully linked to ${successCount}/${TARGETS.length} locations`);
console.log('═══════════════════════════════════════\n');

if (successCount > 0) {
  console.log('Usage:');
  console.log('  /devbox echo hello, date, uname -a');
  console.log('');
  console.log('Verify installation:');
  TARGETS.forEach(target => {
    if (fs.existsSync(target.path)) {
      console.log(`  ls -la ${target.path}`);
    }
  });
}
