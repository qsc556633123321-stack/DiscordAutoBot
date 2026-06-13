const { fromThrowable, ok } = require('../../core/result');
const { buildGuestGatePlan, checkGuestVisibility, checkNativeOnboardingReferences } = require('../../systems/guestGate');
const { buildLayoutRepairPlan } = require('../../systems/layoutDecisionEngine');

function buildRepairPlan(guild, options = {}) {
  try {
    const scope = options.scope || 'all';
    const plan = scope === 'guest_gate'
      ? buildGuestGatePlan(guild, options)
      : buildLayoutRepairPlan(guild, { ...options, scope: scope === 'all' ? 'permissions' : scope });
    plan.actions = plan.actions.filter((item) => ['sync_permission', 'sync_metadata', 'create_category', 'create_channel'].includes(item.action));
    return ok(plan);
  } catch (error) {
    return fromThrowable(error, 'PERMISSION_PLAN_FAILED');
  }
}

async function inspectGuestGate(guild) {
  try {
    return ok({
      visibility: checkGuestVisibility(guild),
      onboarding: await checkNativeOnboardingReferences(guild)
    });
  } catch (error) {
    return fromThrowable(error, 'GUEST_GATE_INSPECTION_FAILED');
  }
}

module.exports = { buildRepairPlan, inspectGuestGate, repairGuestGate: buildRepairPlan };
