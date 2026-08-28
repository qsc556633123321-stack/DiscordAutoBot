const { buildFullGuildDesiredState } = require('../domain/community/serverGovernanceDesiredState');
const { createServerGovernanceResourceIdentityPolicy } = require('../domain/community/serverGovernanceResourceIdentityPolicy');
const { buildFullGuildGovernancePreview } = require('../application/community/createServerGovernancePlanUseCase');
const { createServerGovernanceReviewDecisionUseCase } = require('../application/community/serverGovernanceReviewDecisionUseCase');
const { createDiscordGuildChannelInventoryAdapter } = require('../infrastructure/discord/discordGuildChannelInventoryAdapter');
const { createJsonGovernanceReviewDecisionStore } = require('../infrastructure/storage/jsonGovernanceReviewDecisionStore');

function createServerGovernanceReviewFeature({ resolveGuild, classifyResource, decisionStore = createJsonGovernanceReviewDecisionStore() } = {}) {
  const desiredState = buildFullGuildDesiredState();
  const resourceIdentityPolicy = createServerGovernanceResourceIdentityPolicy({ desiredState });
  const inventoryPort = createDiscordGuildChannelInventoryAdapter({ resolveGuild, classifyResource, classifyInventory: resourceIdentityPolicy.classifyInventory });
  const decisions = createServerGovernanceReviewDecisionUseCase({ decisionStore, desiredState });
  async function context(guildId) {
    const inventory = await inventoryPort.readGuildInventory({ guildId });
    const records = decisionStore.listDecisions({ guildId });
    const preview = buildFullGuildGovernancePreview({ inventory, desiredState, decisions: records });
    const review = decisions.list({ guildId, inventory, plan: preview.plan });
    return { inventory, preview: { ...preview, reviewManifest: review.manifest, resolvedPlan: review.resolvedPlan }, review };
  }
  return Object.freeze({ serverGovernanceReview: Object.freeze({
    async inspect({ guildId }) { return context(guildId); },
    async decide(input) {
      const current = await context(input.guildId);
      const resource = current.inventory.find((item) => item.id === input.resourceId);
      if (!resource) throw new Error(`Review resource not found: ${input.resourceId}`);
      decisions.decide({ ...input, resource, reasonAtDecision: current.preview.reviewManifest.entries.find((item) => item.resourceId === resource.id)?.reason });
      return context(input.guildId);
    },
    async reset({ guildId, resourceId, actorId }) { decisions.reset({ guildId, resourceId, actorId }); return context(guildId); },
    async bulkIgnoreUserManaged({ guildId, actorId, confirmation }) {
      const current = await context(guildId);
      decisions.bulkIgnoreUserManaged({ guildId, actorId, confirmation, entries: current.preview.reviewManifest.entries });
      return context(guildId);
    },
    listAudit({ guildId }) { return decisions.listAudit({ guildId }); }
  }) });
}

module.exports = { createServerGovernanceReviewFeature };
