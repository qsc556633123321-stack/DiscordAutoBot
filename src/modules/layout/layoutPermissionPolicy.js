const communityPermissionService = require('../../services/community/communityPermissionService');

function buildPermissionRepair(guild, options = {}) {
  if (typeof communityPermissionService.buildPermissionPlan === 'function') {
    return communityPermissionService.buildPermissionPlan(guild, options);
  }
  if (typeof communityPermissionService.previewRepair === 'function') {
    return communityPermissionService.previewRepair(guild, options);
  }
  return null;
}

module.exports = { buildPermissionRepair };
