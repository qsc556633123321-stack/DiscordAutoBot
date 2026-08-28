const assert = require('node:assert/strict');
const { PermissionFlagsBits } = require('discord.js');
const { createServerGovernanceReviewCommand } = require('../../../src/presentation/commands/serverGovernanceReviewCommand');

function interaction({ ownerId = 'owner', userId = 'admin', administrator = true, action = 'summary' } = {}) {
  const replies = [];
  return {
    guild: { id: 'guild', ownerId }, user: { id: userId }, memberPermissions: { has: (permission) => administrator && permission === PermissionFlagsBits.Administrator },
    options: { getString: (name, required) => name === 'action' ? action : required ? null : null, getInteger: () => null },
    deferReply: async () => {}, editReply: async (message) => replies.push(message), replies
  };
}
const feature = { serverGovernanceReview: { inspect: async () => ({ preview: { reviewManifest: { entries: [] } }, review: { resolvedPlan: { counts: {}, blockers: [], status: 'BLOCKED_REVIEW_DECISIONS' } } }) } };
const command = createServerGovernanceReviewCommand({ createFeature: () => feature });
const moderator = interaction({ administrator: false, userId: 'mod' });
command.execute(moderator).then(async () => {
  assert.equal(String(moderator.replies[0]).includes('Administrator'), true);
  const owner = interaction({ administrator: false, userId: 'owner' });
  await command.execute(owner);
  assert.equal(String(owner.replies[0]).includes('SERVER GOVERNANCE REVIEW DECISIONS'), true);
  assert.equal(command.data.name, 'server-governance-review');
  console.log('Server governance review command tests passed.');
});
