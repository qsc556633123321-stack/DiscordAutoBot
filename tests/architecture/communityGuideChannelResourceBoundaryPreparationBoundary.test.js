const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');

assert.match(runtime, /getOrCreateGuideChannel\(guild\)/);
assert.match(runtime, /channel\.messages\.fetch\(guideMessageId\)/);
assert.match(runtime, /message = await channel\.send\(payload\)/);
for (const file of [
  'src/infrastructure/community/GuidePublicationResourceSession.js',
  'src/infrastructure/community/GuidePublicationMessageLookupDiscordAdapter.js',
  'src/infrastructure/community/GuidePublicationMessageMutationDiscordAdapter.js',
  'src/composition/communityGuideChannelResourceFeature.js'
]) assert.equal(fs.existsSync(path.join(root, file)), false, file);
console.log('Guide channel resource boundary preparation passed');
