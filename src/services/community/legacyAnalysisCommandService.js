const { fromThrowable, ok } = require('../../core/result');

const commands = {
  analyzeServer: require('../../legacy/commands/analyze_server'),
  aiReorganizeServer: require('../../legacy/commands/ai_reorganize_server'),
  autoOrganize: require('../../legacy/commands/auto_organize'),
  deepCleanup: require('../../legacy/commands/deep_cleanup'),
  planCleanup: require('../../legacy/commands/plan_cleanup')
  ,rebuildServer: require('../../legacy/commands/rebuild_server')
};

async function execute(name, interaction) {
  try {
    await commands[name].execute(interaction);
    return ok();
  } catch (error) {
    return fromThrowable(error, 'LEGACY_ANALYSIS_COMMAND_FAILED');
  }
}

module.exports = { commands, execute };
