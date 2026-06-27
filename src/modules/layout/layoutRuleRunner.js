const engine = require('./layoutDecisionEngine');

function runLayoutRules(guild, options = {}) {
  return engine.buildLayoutRepairPlan(guild, options);
}

module.exports = { runLayoutRules };
