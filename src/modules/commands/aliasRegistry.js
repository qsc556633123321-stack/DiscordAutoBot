const fs = require('node:fs');
const path = require('node:path');

const LEGACY_COMMANDS_DIR = path.join(__dirname, '..', '..', 'legacy', 'commands');
const ACTIVE_COMMANDS = Object.freeze({
  'community-about': '../../presentation/commands/communityAboutCommand',
  'community-roadmap': '../../presentation/commands/communityRoadmapCommand',
  'memberguard-settings': '../../presentation/commands/memberguardSettingsCommand',
  'memberguard-release': '../../presentation/commands/memberguardReleaseCommand'
});
const ROUTE_ONLY_COMMANDS = Object.freeze({
  'game-role-preview': '../../presentation/commands/gameRoleProvisioningPreviewCommand',
  'game-role-provision': '../../presentation/commands/gameRoleProvisioningExecutionCommand',
  'game-role-selection': '../../presentation/commands/gameRoleSelectionCommand',
  'server-governance-preview': '../../presentation/commands/serverGovernancePreviewCommand',
  'server-governance-dry-run': '../../presentation/commands/serverGovernanceDryRunCommand'
});

function loadCommandMap(commandMap) {
  const commands = new Map();
  for (const [name, modulePath] of Object.entries(commandMap)) {
    const command = require(modulePath);
    if (command.data?.name === name && typeof command.execute === 'function') commands.set(name, command);
  }
  return commands;
}

function loadAliases() {
  if (!fs.existsSync(LEGACY_COMMANDS_DIR)) return new Map();
  const aliases = new Map();
  for (const file of fs.readdirSync(LEGACY_COMMANDS_DIR).filter((name) => name.endsWith('.js'))) {
    const command = require(path.join(LEGACY_COMMANDS_DIR, file));
    if (command.data?.name && typeof command.execute === 'function') aliases.set(command.data.name, command);
  }
  for (const [name, command] of loadCommandMap(ACTIVE_COMMANDS)) aliases.set(name, command);
  return aliases;
}

function loadRouteCommands() {
  return new Map([...loadAliases(), ...loadCommandMap(ROUTE_ONLY_COMMANDS)]);
}

module.exports = { ACTIVE_COMMANDS, ROUTE_ONLY_COMMANDS, LEGACY_COMMANDS_DIR, loadAliases, loadRouteCommands };
