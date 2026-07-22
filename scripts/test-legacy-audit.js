const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.join(__dirname, '..');
const inventory = path.join(ROOT, 'docs', 'refactor-audit', 'LEGACY_INVENTORY.md');
const aliases = path.join(ROOT, 'docs', 'refactor-audit', 'COMMAND_ALIAS_MATRIX.md');

execFileSync(process.execPath, [path.join(__dirname, 'generate-legacy-audit.js')], {
  cwd: ROOT,
  stdio: 'inherit'
});

const inventoryText = fs.readFileSync(inventory, 'utf8');
const aliasText = fs.readFileSync(aliases, 'utf8');

for (const required of ['BOOT_REQUIRED', 'ALIAS_REQUIRED', 'EVENT_REQUIRED', 'UNKNOWN_DYNAMIC_REFERENCE']) {
  if (!inventoryText.includes(`| ${required} |`)) throw new Error(`Legacy inventory is missing ${required}`);
}

if (!aliasText.includes('exposes 65 final alias names')) {
  throw new Error('Alias audit did not preserve the expected 65 final aliases.');
}

for (const command of ['check-onboarding-visibility.js', 'dev-audit-commands.js', 'memory-list.js', 'learn-channel.js', 'forget-channel-rule.js', 'memberguard-status.js']) {
  const row = inventoryText.split('\n').find((line) => line.startsWith(`| src/legacy/commands/${command} |`));
  if (!row?.includes('Migrated; wrapper remaining')) {
    throw new Error(`Legacy inventory did not record migrated wrapper status for ${command}`);
  }
}

for (const command of ['memberguard-settings.js', 'memberguard-release.js']) {
  const row = inventoryText.split('\n').find((line) => line.startsWith(`| src/legacy/commands/${command} |`));
  if (!row?.includes('Migrated; wrapper remaining')) {
    throw new Error(`Legacy inventory did not record thin-wrapper migration for ${command}`);
  }
}

console.log('Legacy audit generator tests passed.');
