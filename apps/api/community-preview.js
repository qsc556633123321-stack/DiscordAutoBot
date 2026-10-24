const { ensureBot } = require('./discord');
const db = require('./db');
const { createCommunityReconciliationPreviewFeature } = require('../../src/composition/communityReconciliationPreviewFeature');

function createCommunityPreviewFeature({ resolveGuild, bindingRepository = db, snapshotRepository, now } = {}) {
  return createCommunityReconciliationPreviewFeature({ resolveGuild, bindingRepository, snapshotRepository, now });
}

async function previewCommunityLayout(guildId) {
  const feature = createCommunityPreviewFeature({ resolveGuild: async (id) => (await ensureBot()).guilds.fetch(id) });
  return feature.preview({ guildId });
}

module.exports = { createCommunityPreviewFeature, previewCommunityLayout };
