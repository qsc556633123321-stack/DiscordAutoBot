const runtime = require('../../../legacy/interactions/legacyInteractionRuntime');

const GAME_BUTTON_PREFIXES = [
  'game_suggest_',
  'game_registry_doctor_cancel_',
  'game_registry_doctor_confirm_'
];

function matches(customId = '') {
  return GAME_BUTTON_PREFIXES.some((prefix) => customId.startsWith(prefix));
}

async function handle(interaction) {
  return runtime.execute(interaction);
}

module.exports = { handle, matches };
