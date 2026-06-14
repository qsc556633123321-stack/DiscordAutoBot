const { fromThrowable, ok } = require('../../../../core/result');

const commands = {
  analyzeServer: require('../../../commands/analyze_server'),
  aiReorganizeServer: require('../../../commands/ai_reorganize_server'),
  autoOrganize: require('../../../commands/auto_organize'),
  deepCleanup: require('../../../commands/deep_cleanup'),
  planCleanup: require('../../../commands/plan_cleanup'),
  rebuildServer: require('../../../commands/rebuild_server')
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
