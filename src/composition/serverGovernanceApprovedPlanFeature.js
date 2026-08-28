const { buildFullGuildDesiredState } = require('../domain/community/serverGovernanceDesiredState');
const { createServerGovernanceResourceIdentityPolicy } = require('../domain/community/serverGovernanceResourceIdentityPolicy');
const { createDiscordGuildChannelInventoryAdapter } = require('../infrastructure/discord/discordGuildChannelInventoryAdapter');
const { createJsonGovernanceReviewDecisionStore } = require('../infrastructure/storage/jsonGovernanceReviewDecisionStore');
const { createJsonGovernanceApprovedPlanStore } = require('../infrastructure/storage/jsonGovernanceApprovedPlanStore');
const { createServerGovernanceApprovedPlanUseCase } = require('../application/community/serverGovernanceApprovedPlanUseCase');

function createServerGovernanceApprovedPlanFeature({ resolveGuild, classifyResource, decisionStore = createJsonGovernanceReviewDecisionStore(), planStore = createJsonGovernanceApprovedPlanStore() } = {}) {
  const desiredState = buildFullGuildDesiredState();
  const identityPolicy = createServerGovernanceResourceIdentityPolicy({ desiredState });
  const inventoryPort = createDiscordGuildChannelInventoryAdapter({ resolveGuild, classifyResource, classifyInventory: identityPolicy.classifyInventory });
  const plans = createServerGovernanceApprovedPlanUseCase({ planStore });
  return Object.freeze({ serverGovernanceApprovedPlan: Object.freeze({
    async compile({ guildId, actorId }) {
      const inventory = await inventoryPort.readGuildInventory({ guildId });
      const decisions = decisionStore.listDecisions({ guildId });
      const plan = plans.compile({ guildId, compiledBy: actorId, inventory, desiredState, decisions });
      return plans.save({ plan, actorId });
    },
    latest({ guildId }) { return plans.latest({ guildId }); },
    async verify({ guildId, actorId = null }) {
      const record = plans.latest({ guildId });
      if (!record) return Object.freeze({ status: 'BLOCKED', blockers: Object.freeze(['PLAN_NOT_FOUND']) });
      return plans.verify({ plan: record.plan, freshInventory: await inventoryPort.readGuildInventory({ guildId }), currentDesiredState: desiredState, currentDecisions: decisionStore.listDecisions({ guildId }), actorId });
    },
    audit({ guildId }) { return plans.audit({ guildId }); }
  }) });
}
module.exports = { createServerGovernanceApprovedPlanFeature };
