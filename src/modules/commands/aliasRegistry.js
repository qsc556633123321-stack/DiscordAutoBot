const fs = require('node:fs');
const path = require('node:path');

const LEGACY_COMMANDS_DIR = path.join(__dirname, '..', '..', 'legacy', 'commands');

function loadAliases() {
  if (!fs.existsSync(LEGACY_COMMANDS_DIR)) return new Map();
  const aliases = new Map();
  for (const file of fs.readdirSync(LEGACY_COMMANDS_DIR).filter((name) => name.endsWith('.js'))) {
    const command = require(path.join(LEGACY_COMMANDS_DIR, file));
    if (command.data?.name && typeof command.execute === 'function') aliases.set(command.data.name, command);
  }
  return aliases;
}

module.exports = { LEGACY_COMMANDS_DIR, loadAliases };
