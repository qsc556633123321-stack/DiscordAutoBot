const engine = require('./layoutDecisionEngine');
const { runDeleteCandidateRule } = require('./rules/deleteCandidateRule');
const { runDuplicateGameRule } = require('./rules/duplicateGameRule');
const { runGuestGateRule } = require('./rules/guestGateRule');
const { runOrphanChannelRule } = require('./rules/orphanChannelRule');
const { runRenameNormalizeRule } = require('./rules/renameNormalizeRule');

function runExtractedRules(context = {}) {
  const results = [];
  if (context.record) results.push(runGuestGateRule(context.record));
  if (context.channel) {
    results.push(runOrphanChannelRule(context.channel));
    results.push(runDeleteCandidateRule(context.channel));
    results.push(runRenameNormalizeRule(context.channel));
  }
  if (context.gameCategories) {
    results.push(...runDuplicateGameRule(context.gameCategories));
  }
  return results.filter(Boolean);
}

function runLayoutRules(guild, options = {}) {
  const extractedRuleResults = runExtractedRules(options.context);
  const plan = engine.buildLayoutRepairPlan(guild, options);
  return {
    ...plan,
    extractedRuleResults
  };
}

module.exports = { runExtractedRules, runLayoutRules };
