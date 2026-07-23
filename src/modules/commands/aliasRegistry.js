const fs = require('node:fs');
const path = require('node:path');

const LEGACY_COMMANDS_DIR = path.join(__dirname, '..', '..', 'legacy', 'commands');
const ACTIVE_COMMANDS = Object.freeze({
  'community-about': '../../presentation/commands/communityAboutCommand',
  'community-roadmap': '../../presentation/commands/communityRoadmapCommand',
  'memberguard-settings': '../../presentation/commands/memberguardSettingsCommand',
  'memberguard-release': '../../presentation/commands/memberguardReleaseCommand'
});

function loadAliases() {
  if (!fs.existsSync(LEGACY_COMMANDS_DIR)) return new Map();
  const aliases = new Map();
  for (const file of fs.readdirSync(LEGACY_COMMANDS_DIR).filter((name) => name.endsWith('.js'))) {
    const command = require(path.join(LEGACY_COMMANDS_DIR, file));
    if (command.data?.name && typeof command.execute === 'function') aliases.set(command.data.name, command);
  }
  for (const [name, modulePath] of Object.entries(ACTIVE_COMMANDS)) {
    const command = require(modulePath);
    if (command.data?.name === name && typeof command.execute === 'function') aliases.set(name, command);
  }
  return aliases;
}

module.exports = { ACTIVE_COMMANDS, LEGACY_COMMANDS_DIR, loadAliases };
