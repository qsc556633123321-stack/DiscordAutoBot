const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');

assert.match(runtime, /await message\.edit\(payload\)/);
assert.match(runtime, /message = await channel\.send\(payload\)/);
assert.doesNotMatch(runtime, /saveOnboarding\(guild\.id/);
assert.equal(fs.existsSync(path.join(root, 'src/infrastructure/community/discordGuidePublicationAdapter.js')), false);
assert.equal(fs.existsSync(path.join(root, 'src/composition/communityGuideDiscordMutationFeature.js')), false);
console.log('Guide Discord mutation Application port diff guard passed');
