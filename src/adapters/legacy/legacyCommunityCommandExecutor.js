// fallbackAllowed: controlled legacy compatibility path
const { fromThrowable, ok } = require('../../core/result');

const legacyCommands = {
  analyzeServer: require('../../legacy/commands/analyze_server'),
  aiReorganizeServer: require('../../legacy/commands/ai_reorganize_server'),
  autoOrganize: require('../../legacy/commands/auto_organize'),
  deepCleanup: require('../../legacy/commands/deep_cleanup'),
  planCleanup: require('../../legacy/commands/plan_cleanup'),
  rebuildServer: require('../../legacy/commands/rebuild_server')
};

async function executeLegacy(name, interaction) {
  try {
    const command = legacyCommands[name];
    if (!command) throw new Error(`Unknown legacy community command: ${name}`);
    return ok(await command.execute(interaction));
  } catch (error) {
    return fromThrowable(error, 'LEGACY_COMMUNITY_COMMAND_FAILED');
  }
}

module.exports = { executeLegacy };
