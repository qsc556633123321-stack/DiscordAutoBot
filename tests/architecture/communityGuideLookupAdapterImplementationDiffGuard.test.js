const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');
const adapter = fs.readFileSync(path.join(root, 'src/infrastructure/community/guidePublication/GuidePublicationMessageLookupDiscordAdapter.js'), 'utf8');

for (const forbidden of ['discord.js', 'client.channels.fetch', 'guild.channels.fetch', 'GuidePublicationMessageMutationDiscordAdapter', 'createGuidePublicationResourceSession']) {
  assert.equal(adapter.includes(forbidden), false, forbidden);
}
console.log('Guide production lookup adapter implementation diff guard passed');
