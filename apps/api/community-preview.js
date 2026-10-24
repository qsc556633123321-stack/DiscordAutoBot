const { ensureBot } = require('./discord');
const db = require('./db');
const { createCommunityReconciliationPreviewFeature } = require('../../src/composition/communityReconciliationPreviewFeature');
const { createCommunityRepositoryMigrationReadinessFeature } = require('../../src/composition/communityRepositoryMigrationReadinessFeature');

function createCommunityPreviewFeature({ resolveGuild, bindingRepository = db, snapshotRepository, now } = {}) {
  return createCommunityReconciliationPreviewFeature({ resolveGuild, bindingRepository, snapshotRepository, now });
}

async function previewCommunityLayout(guildId) {
  const feature = createCommunityPreviewFeature({ resolveGuild: async (id) => (await ensureBot()).guilds.fetch(id) });
  const [preview, migrationReadiness] = await Promise.all([
    feature.preview({ guildId }),
    createCommunityRepositoryMigrationReadinessFeature().preview({ guildId })
  ]);
  if (!preview.ok) return preview;
  return { ...preview, data: { ...preview.data, migrationReadiness: migrationReadiness.ok ? migrationReadiness.data : null } };
}

module.exports = { createCommunityPreviewFeature, previewCommunityLayout };
