const runtime = require('../../../legacy/interactions/legacyInteractionRuntime');

const ROLE_BUTTON_PREFIXES = [
  'guest_cleanup_confirm_',
  'guest_cleanup_cancel_',
  'roleperm_confirm_',
  'roleperm_cancel_'
];

function matches(customId = '') {
  return ROLE_BUTTON_PREFIXES.some((prefix) => customId.startsWith(prefix));
}

async function handle(interaction) {
  return runtime.execute(interaction);
}

module.exports = { handle, matches };
