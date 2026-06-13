const architecture = require('./communityArchitectureV3');

const allowed = new Set(architecture.onboardingAllowedChannels);
const forbidden = new Set(['voice_hub', 'game_center', 'lobby']);

function isNativeOnboardingAllowed(channelKey) {
  return allowed.has(channelKey) && !forbidden.has(channelKey);
}

function validateNativeOnboardingChannel(channelKey) {
  return isNativeOnboardingAllowed(channelKey)
    ? { allowed: true }
    : { allowed: false, reason: 'Only Community V3 public entry channels may be native onboarding tasks.' };
}

module.exports = { isNativeOnboardingAllowed, validateNativeOnboardingChannel };
