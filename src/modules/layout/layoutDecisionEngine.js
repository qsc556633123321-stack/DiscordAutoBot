const legacyEngine = require('../../legacy/layout/legacyLayoutDecisionEngine');

function buildLayoutRepairPlan(guild, options = {}) {
  return legacyEngine.buildLayoutRepairPlan(guild, options);
}

function executeLayoutRepairPlan(guild, plan, options = {}) {
  return legacyEngine.executeLayoutRepairPlan(guild, plan, options);
}

function buildLayoutDoctorReport(guild) {
  return legacyEngine.buildLayoutDoctorReport(guild);
}

module.exports = {
  ...legacyEngine,
  buildLayoutDoctorReport,
  buildLayoutRepairPlan,
  executeLayoutRepairPlan
};
