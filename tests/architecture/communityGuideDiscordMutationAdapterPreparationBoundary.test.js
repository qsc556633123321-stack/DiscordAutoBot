const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');

const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
assert.match(runtime, /await message\.edit\(payload\)/);
assert.match(runtime, /message = await channel\.send\(payload\)/);
assert.doesNotMatch(runtime, /saveOnboarding\(guild\.id/);
for (const file of [
  'src/infrastructure/community/GuidePublicationMessageMutationDiscordAdapter.js',
  'src/infrastructure/community/discordGuidePublicationAdapter.js',
  'src/composition/communityGuideDiscordMutationFeature.js'
]) assert.equal(fs.existsSync(path.join(root, file)), false, file);
console.log('Guide Discord mutation adapter preparation boundary passed');
