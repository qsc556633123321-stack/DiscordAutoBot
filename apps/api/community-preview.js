const { ensureBot } = require('./discord');
const db = require('./db');
const { createCommunityLayoutPreviewFeature } = require('../../src/composition/communityLayoutPreviewFeature');

function createCommunityPreviewFeature({ resolveGuild, bindingRepository = db } = {}) {
  return createCommunityLayoutPreviewFeature({ resolveGuild, bindingRepository });
}

async function previewCommunityLayout(guildId) {
  const feature = createCommunityPreviewFeature({ resolveGuild: async (id) => (await ensureBot()).guilds.fetch(id) });
  return feature.preview({ guildId });
}

module.exports = { createCommunityPreviewFeature, previewCommunityLayout };
