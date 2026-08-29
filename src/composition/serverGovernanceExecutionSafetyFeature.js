const { buildFullGuildDesiredState } = require('../domain/community/serverGovernanceDesiredState');
const { createExecuteApprovedGovernancePlanUseCase } = require('../application/community/executeApprovedGovernancePlanUseCase');
const { createJsonGovernanceExecutionTransactionStore } = require('../infrastructure/storage/jsonGovernanceExecutionTransactionStore');
const { createDiscordGovernancePlanExecutionAdapter } = require('../infrastructure/discord/discordGovernancePlanExecutionAdapter');
const { createJsonGovernanceApprovedPlanStore } = require('../infrastructure/storage/jsonGovernanceApprovedPlanStore');
const { createJsonGovernanceReviewDecisionStore } = require('../infrastructure/storage/jsonGovernanceReviewDecisionStore');
const { getServerGovernanceConfiguration } = require('../core/serverGovernanceConfiguration');

// Intentionally unregistered: public governance execution remains disabled.
function createServerGovernanceExecutionSafetyFeature({ resolveGuild, classifyResource, transactionStore = createJsonGovernanceExecutionTransactionStore(), planStore = createJsonGovernanceApprovedPlanStore(), decisionStore = createJsonGovernanceReviewDecisionStore(), mutationGateway = createDiscordGovernancePlanExecutionAdapter({ resolveGuild, classifyResource }), configuration = getServerGovernanceConfiguration() } = {}) {
  const executeApprovedPlan = createExecuteApprovedGovernancePlanUseCase({ transactionStore, mutationGateway, executionEnabled: configuration.executionEnabled });
  const desiredState = buildFullGuildDesiredState();
  return Object.freeze({ serverGovernanceExecutionSafety: Object.freeze({
    execute({ guildId, actorId, confirmation }) { return executeApprovedPlan.execute({ guildId, actorId, planRecord: planStore.loadLatestPlan({ guildId }), confirmation, freshDesiredState: desiredState, freshDecisions: decisionStore.listDecisions({ guildId }) }); },
    recoverInterrupted({ guildId }) { return executeApprovedPlan.recoverInterrupted({ guildId }); }
  }) });
}
module.exports = { createServerGovernanceExecutionSafetyFeature };
