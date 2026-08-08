const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');

const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
assert.match(runtime, /buildGuidePublicationMutationPlan/);
assert.match(runtime, /await message\.edit\(payload\)/);
assert.match(runtime, /message = await channel\.send\(payload\)/);
assert.match(runtime, /saveOnboarding\(guild\.id/);

for (const forbidden of [
  'src/infrastructure/community/discordGuidePublicationAdapter.js',
  'src/composition/communityGuideDiscordMutationFeature.js'
]) assert.equal(fs.existsSync(path.join(root, forbidden)), false, forbidden);
console.log('community Guide Discord mutation port preparation diff guard passed');
