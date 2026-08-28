const assert = require('node:assert/strict');
const { createDiscordGuildChannelInventoryAdapter } = require('../../../src/infrastructure/discord/discordGuildChannelInventoryAdapter');
void (async () => {
  const adapter = createDiscordGuildChannelInventoryAdapter({
    resolveGuild: async () => ({ channels: { cache: new Map([['1', { id: '1', name: 'general', type: 0, parentId: null, position: 2, managed: false, permissionOverwrites: { cache: new Map() } }]]) } }),
    classifyResource: () => ({ canonicalKey: 'channel:general', purpose: 'general_chat', owner: 'MANAGED_CANONICAL', lifecycle: 'persistent' })
  });
  const inventory = await adapter.readGuildInventory({ guildId: 'g1' });
  assert.deepEqual(Object.keys(inventory[0]), ['id', 'name', 'type', 'parentId', 'parentCanonicalKey', 'position', 'permissionSummary', 'managed', 'runtime', 'canonicalKey', 'purpose', 'owner', 'lifecycle', 'accessProfile', 'accessRoleKey', 'replacementKey', 'migrationReviewReason']);
  assert.equal(inventory[0].type, 'text');
  console.log('Discord guild channel inventory adapter tests passed.');
})();
