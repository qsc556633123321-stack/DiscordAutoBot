const onboardingVisibilityPolicy = require('../../domain/community/onboardingVisibilityPolicy');
const permissionService = require('../../services/community/communityPermissionService');

function createCheckOnboardingVisibilityUseCase({
  policy = onboardingVisibilityPolicy,
  permissions = permissionService
} = {}) {
  return {
    buildEmbed: (report) => permissions.buildOnboardingEmbed(report),
    async execute({ guild, hasManageChannels }) {
      const authorization = policy.authorizeInspection(hasManageChannels);
      if (!authorization.ok) return authorization;
      return permissions.inspectOnboarding(guild);
    }
  };
}

module.exports = { createCheckOnboardingVisibilityUseCase };
