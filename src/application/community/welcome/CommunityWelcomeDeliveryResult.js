const CommunityWelcomeDeliveryStatus = Object.freeze({
  Delivered: 'Delivered',
  Skipped: 'Skipped',
  Failed: 'Failed'
});

function createCommunityWelcomeDeliveryResult(status, reason) {
  return Object.freeze({ status, reason });
}

module.exports = { CommunityWelcomeDeliveryStatus, createCommunityWelcomeDeliveryResult };
