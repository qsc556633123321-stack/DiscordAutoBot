const { buildFullGuildDesiredState } = require('../domain/community/serverGovernanceDesiredState');
const { buildFullGuildGovernancePreview } = require('../application/community/createServerGovernancePlanUseCase');
const { createServerGovernanceReviewDecisionUseCase } = require('../application/community/serverGovernanceReviewDecisionUseCase');
const { createDiscordGuildChannelInventoryAdapter } = require('../infrastructure/discord/discordGuildChannelInventoryAdapter');
const { createServerGovernanceResourceIdentityPolicy } = require('../domain/community/serverGovernanceResourceIdentityPolicy');
const { createJsonGovernanceReviewDecisionStore } = require('../infrastructure/storage/jsonGovernanceReviewDecisionStore');

function createServerGovernancePreviewFeature({ resolveGuild, classifyResource, decisionStore = createJsonGovernanceReviewDecisionStore() } = {}) {
  const desiredState = buildFullGuildDesiredState();
  const resourceIdentityPolicy = createServerGovernanceResourceIdentityPolicy({ desiredState });
  const inventoryPort = createDiscordGuildChannelInventoryAdapter({ resolveGuild, classifyResource, classifyInventory: resourceIdentityPolicy.classifyInventory });
  const reviewDecisions = createServerGovernanceReviewDecisionUseCase({ decisionStore, desiredState });
  return Object.freeze({ serverGovernancePreview: Object.freeze({ async previewFullGuildGovernance({ guildId }) {
    const inventory = await inventoryPort.readGuildInventory({ guildId });
    const preview = buildFullGuildGovernancePreview({ inventory, desiredState, decisions: decisionStore.listDecisions({ guildId }) });
    const review = reviewDecisions.list({ guildId, inventory, plan: preview.plan });
    return Object.freeze({ ...preview, reviewManifest: review.manifest, resolvedPlan: review.resolvedPlan });
  } }) });
}
module.exports = { createServerGovernancePreviewFeature };
