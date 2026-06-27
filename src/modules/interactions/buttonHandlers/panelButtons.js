// fallbackAllowed: controlled legacy compatibility path
const runtime = require('../../../legacy/interactions/legacyInteractionRuntime');

function matches(customId = '') {
  return customId.startsWith('panel_');
}

async function handle(interaction) {
  return runtime.execute(interaction);
}

module.exports = { handle, matches };
