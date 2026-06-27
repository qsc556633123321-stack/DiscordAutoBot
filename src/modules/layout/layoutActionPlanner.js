const engine = require('./layoutDecisionEngine');

function planLayoutActions(guild, options = {}) {
  const plan = engine.buildLayoutRepairPlan(guild, options);
  return plan.actions || [];
}

module.exports = { planLayoutActions };
