// fallbackAllowed: controlled legacy compatibility path
const runtime = require('../../../legacy/interactions/legacyInteractionRuntime');

const ADMIN_BUTTON_PREFIXES = [
  'ai_layout_confirm_',
  'ai_layout_cancel_',
  'perm_repair_confirm_',
  'perm_repair_cancel_',
  'dedupe_confirm_',
  'dedupe_cancel_',
  'community_architect_confirm_',
  'community_architect_cancel_',
  'community_v3_confirm_',
  'community_v3_cancel_',
  'polish_confirm_',
  'polish_cancel_',
  'rebuild_confirm_',
  'rebuild_cancel_',
  'cleanup_confirm_',
  'cleanup_cancel_',
  'factory_reset_confirm_',
  'factory_reset_cancel_',
  'ai_reorganize_confirm_',
  'ai_reorganize_cancel_',
  'restore_active_confirm_',
  'restore_active_cancel_',
  'confirm_auto_organize_',
  'cancel_auto_organize_',
  'confirm_deep_cleanup_',
  'cancel_deep_cleanup_'
];

const ADMIN_BUTTON_IDS = [
  'create_ticket',
  'close_ticket',
  'confirm_close_ticket',
  'cancel_close_ticket'
];

function matches(customId = '') {
  return ADMIN_BUTTON_IDS.includes(customId) ||
    ADMIN_BUTTON_PREFIXES.some((prefix) => customId.startsWith(prefix));
}

async function handle(interaction) {
  return runtime.execute(interaction);
}

module.exports = { handle, matches };
