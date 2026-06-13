const communityArchitectService = require('../../services/community/communityArchitectService');
const communityPermissionService = require('../../services/community/communityPermissionService');
const communityRebuildService = require('../../services/community/communityRebuildService');

module.exports = {
  communityArchitect: communityArchitectService,
  permissions: communityPermissionService,
  rebuild: communityRebuildService
};
