const { fromThrowable, ok } = require('../../core/result');
const { buildGuestGatePlan, checkGuestVisibility, checkNativeOnboardingReferences } = require('../../systems/guestGate');
const { buildLayoutRepairPlan } = require('../../systems/layoutDecisionEngine');
const rolePermissions = require('../../systems/rolePermissions');
const communityBootstrap = require('../../systems/communityBootstrapSystem');
const permissionWriter = require('../../infrastructure/discord/discordPermissionWriter');

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

function buildRolePlan(guild, requestedById) {
  try {
    return ok(rolePermissions.buildPermissionPlan(guild, requestedById));
  } catch (error) {
    return fromThrowable(error, 'ROLE_PERMISSION_PLAN_FAILED');
  }
}

function inspectOnboarding(guild) {
  try {
    return ok(communityBootstrap.checkOnboardingVisibility(guild));
  } catch (error) {
    return fromThrowable(error, 'ONBOARDING_INSPECTION_FAILED');
  }
}

async function setChannelLocked(channel, everyoneRole, locked, actorTag) {
  return permissionWriter.edit(
    channel,
    everyoneRole,
    { SendMessages: locked ? false : null },
    `Channel ${locked ? 'locked' : 'unlocked'} by ${actorTag}`
  );
}

module.exports = {
  buildGuestVisibilityEmbed: require('../../systems/guestGate').buildGuestVisibilityEmbed,
  buildOnboardingEmbed: communityBootstrap.buildOnboardingCheckEmbed,
  buildRepairPlan,
  buildRepairEmbed: require('../../systems/layoutDecisionEngine').buildLayoutRepairEmbed,
  buildRolePlan,
  buildRolePlanEmbed: rolePermissions.buildRolePermissionEmbed,
  inspectGuestGate,
  inspectOnboarding,
  repairGuestGate: buildRepairPlan,
  saveRepairPlan: require('../../systems/layoutDecisionEngine').saveLayoutRepairPlan,
  saveRolePlan: rolePermissions.saveRolePermissionPlan,
  setChannelLocked
};
