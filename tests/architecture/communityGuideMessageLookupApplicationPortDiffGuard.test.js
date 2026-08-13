const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');

assert.match(runtime, /channel\.messages\.fetch\(guideMessageId\)\.catch\(\(\) => null\)/);
assert.match(runtime, /await message\.edit\(payload\)/);
assert.match(runtime, /message = await channel\.send\(payload\)/);
assert.doesNotMatch(runtime, /saveOnboarding\(guild\.id/);
for (const forbidden of [
  'src/infrastructure/community/GuidePublicationMessageLookupDiscordAdapter.js',
  'src/composition/communityGuidePublicationMessageLookupFeature.js'
]) assert.equal(fs.existsSync(path.join(root, forbidden)), false, forbidden);
console.log('Guide message lookup Application port diff guard passed');
