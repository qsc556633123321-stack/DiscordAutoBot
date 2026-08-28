const { loadRouteCommands } = require('./aliasRegistry');

const ROUTES = Object.freeze({
  community: {
    games: { target: 'game-role-selection' },
    rebuild: { target: 'rebuild-community-v3' },
    'repair-permissions': { target: 'repair-channel-permissions' },
    'check-guest': { target: 'check-guest-visibility' },
    'check-role': { target: 'check-role-visibility' },
    audit: { target: 'community-architect', defaults: { mode: 'diagnose', scope: 'all', strategy: 'balanced' } }
  },
  game: {
    setup: { target: 'setup-game' },
    suggest: { target: 'suggest-game' },
    fix: { target: 'fix-game-category' },
    doctor: { target: 'game-registry-doctor' }
  },
  voice: {
    create: { target: 'create-party' },
    panel: { target: 'tempvoice-panel' },
    hub: { target: 'setup-voicehub' },
    profile: { target: 'voice-profile' },
    leaderboard: { target: 'voice-leaderboard' },
    status: { target: 'voice-status' }
  },
  security: {
    linkguard: { target: 'linkguard-settings' },
    memberguard: { target: 'memberguard-settings' },
    automod: { target: 'automod-settings' },
    status: { target: 'memberguard-status' }
  },
  panel: {
    setup: { target: 'setup-channel-panels', defaults: { mode: 'create', target: 'all' }, omitOptions: ['mode'] },
    refresh: { target: 'setup-channel-panels', defaults: { mode: 'refresh', target: 'all' }, omitOptions: ['mode'] },
    force: { target: 'setup-channel-panels', defaults: { mode: 'force', target: 'all' }, omitOptions: ['mode'] }
  },
  admin: {
    announce: { target: 'announce' },
    lock: { target: 'lock' },
    unlock: { target: 'unlock' },
    ticket: { target: 'setup-ticket' },
    logs: { target: 'analyze-server' },
    'game-role-preview': { target: 'game-role-preview' },
    'game-role-provision': { target: 'game-role-provision' },
    'server-governance-preview': { target: 'server-governance-preview' },
    'server-governance-dry-run': { target: 'server-governance-dry-run' },
    'server-governance-review': { target: 'server-governance-review' },
    'server-governance-plan': { target: 'server-governance-plan' }
  },
  dev: {
    'audit-commands': { target: 'dev-audit-commands' },
    'debug-permissions': { target: 'debug-permissions' },
    report: { target: 'dev-audit-commands' }
  }
});

function withDefaults(interaction, defaults = {}) {
  if (!Object.keys(defaults).length) return interaction;
  const routed = Object.create(interaction);
  routed.options = new Proxy(interaction.options, {
    get(target, property) {
      if (['getString', 'getBoolean', 'getInteger', 'getNumber'].includes(property)) {
        return (name, ...args) => Object.hasOwn(defaults, name) ? defaults[name] : target[property](name, ...args);
      }
      const value = target[property];
      return typeof value === 'function' ? value.bind(target) : value;
    }
  });
  return routed;
}

async function route(interaction) {
  const group = interaction.commandName;
  const subcommand = interaction.options.getSubcommand();
  const routeConfig = ROUTES[group]?.[subcommand];
  if (!routeConfig) throw new Error(`Unknown command route: ${group}/${subcommand}`);
  const command = loadRouteCommands().get(routeConfig.target);
  if (!command) throw new Error(`Missing legacy command handler: ${routeConfig.target}`);
  return command.execute(withDefaults(interaction, routeConfig.defaults));
}

async function routeAlias(name, interaction) {
  const command = loadRouteCommands().get(name);
  if (!command) throw new Error(`Missing legacy alias handler: ${name}`);
  return command.execute(interaction);
}

module.exports = { ROUTES, route, routeAlias };
