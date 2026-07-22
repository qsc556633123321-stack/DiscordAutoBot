const { fail, ok } = require('../../core/result');

function authorizeInspection(hasManageChannels) {
  return hasManageChannels
    ? ok()
    : fail('ONBOARDING_VISIBILITY_PERMISSION_DENIED', 'ManageChannels permission is required.');
}

module.exports = { authorizeInspection };
