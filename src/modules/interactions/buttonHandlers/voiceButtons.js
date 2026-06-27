// fallbackAllowed: controlled legacy compatibility path
const runtime = require('../../../legacy/interactions/legacyInteractionRuntime');

const VOICE_BUTTON_PREFIXES = ['tempvoice_', 'lfg_'];

function matches(customId = '') {
  return VOICE_BUTTON_PREFIXES.some((prefix) => customId.startsWith(prefix));
}

async function handle(interaction) {
  return runtime.execute(interaction);
}

module.exports = { handle, matches };
