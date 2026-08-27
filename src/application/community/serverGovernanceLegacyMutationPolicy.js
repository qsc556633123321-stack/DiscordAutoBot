const GOVERNANCE_BLOCKED_MESSAGE = 'Server Governance 已接管伺服器結構，此舊版整理指令已停用。請使用 /admin server-governance-preview 或 /admin server-governance-dry-run。';
const { getServerGovernanceConfiguration } = require('../../core/serverGovernanceConfiguration');

const BLOCK_WHEN_GOVERNANCE_ENABLED = Object.freeze(new Set([
  'ai-layout-repair', 'ai-reorganize-server', 'apply-role-permissions',
  'archive-inactive-games', 'auto-organize', 'bootstrap-community',
  'cleanup-empty-categories', 'community-architect', 'dedupe-layout',
  'deep-cleanup', 'factory-reset-server', 'fix-game-category',
  'game-registry-doctor', 'move-channel', 'plan-cleanup',
  'polish-server-design', 'rebuild-community-layout', 'rebuild-community-v3',
  'rebuild-server', 'rename-channel', 'repair-channel-permissions',
  'restore-active-channels', 'setup-community-guide', 'setup-game',
  'setup-roles', 'setup-server', 'suggest-game'
]));

const CONFIRMATION_PREFIXES = Object.freeze([
  ['ai_layout_confirm_', 'ai-layout-repair'],
  ['ai_reorganize_confirm_', 'ai-reorganize-server'],
  ['community_architect_confirm_', 'community-architect'],
  ['community_v3_confirm_', 'rebuild-community-v3'],
  ['confirm_auto_organize_', 'auto-organize'],
  ['confirm_deep_cleanup_', 'deep-cleanup'],
  ['cleanup_confirm_', 'cleanup-empty-categories'],
  ['dedupe_confirm_', 'dedupe-layout'],
  ['factory_reset_confirm_', 'factory-reset-server'],
  ['game_registry_doctor_confirm_', 'game-registry-doctor'],
  ['perm_repair_confirm_', 'repair-channel-permissions'],
  ['permrepair_confirm_', 'repair-channel-permissions'],
  ['polish_confirm_', 'polish-server-design'],
  ['rebuild_confirm_', 'rebuild-server'],
  ['restore_active_confirm_', 'restore-active-channels'],
  ['roleperm_confirm_', 'apply-role-permissions']
]);

function isServerGovernanceEnabled(environment) {
  return getServerGovernanceConfiguration(environment).governanceEnabled;
}

function getLegacyMutationOperationFromCustomId(customId = '') {
  if (typeof customId !== 'string') return null;
  return CONFIRMATION_PREFIXES.find(([prefix]) => customId.startsWith(prefix))?.[1] || null;
}

function assertLegacyGuildMutationAllowed(operation, { environment } = {}) {
  const blocked = isServerGovernanceEnabled(environment) && BLOCK_WHEN_GOVERNANCE_ENABLED.has(operation);
  return Object.freeze({ allowed: !blocked, message: blocked ? GOVERNANCE_BLOCKED_MESSAGE : null });
}

module.exports = {
  BLOCK_WHEN_GOVERNANCE_ENABLED,
  CONFIRMATION_PREFIXES,
  GOVERNANCE_BLOCKED_MESSAGE,
  assertLegacyGuildMutationAllowed,
  getServerGovernanceConfiguration,
  getLegacyMutationOperationFromCustomId,
  isServerGovernanceEnabled
};
