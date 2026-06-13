const communityPermissionService = require('../../services/community/communityPermissionService');
const communityRebuildService = require('../../services/community/communityRebuildService');

module.exports = {
  communityArchitect: communityRebuildService,
  permissions: communityPermissionService,
  rebuild: communityRebuildService
};
