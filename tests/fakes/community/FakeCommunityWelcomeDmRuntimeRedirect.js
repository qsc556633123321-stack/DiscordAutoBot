const {
  createCommunityWelcomeDmDeliveryAdapter
} = require('../../../src/infrastructure/community/CommunityWelcomeDmDeliveryAdapter');

async function deliverWelcomeDmCandidate({
  member,
  guideChannel,
  createPayload,
  createDmDelivery = createCommunityWelcomeDmDeliveryAdapter
} = {}) {
  if (!guideChannel) return;
  const payload = createPayload(guideChannel);
  const dmDelivery = createDmDelivery({ member });
  await dmDelivery.send(payload);
}

module.exports = { deliverWelcomeDmCandidate };
