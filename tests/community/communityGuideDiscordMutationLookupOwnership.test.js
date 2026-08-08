const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
const request = fs.readFileSync(path.join(root, 'src/application/community/guideExecution/GuidePublicationExecutionRequest.js'), 'utf8');

assert.match(runtime, /channel\.messages\.fetch\(guideMessageId\)/);
assert.match(runtime, /await message\.edit\(payload\)/);
assert.match(runtime, /message = await channel\.send\(payload\)/);
assert.equal(/guildId\s*:|channelId\s*:|messageId\s*:|input\.channel|input\.message/.test(request), false);
assert.equal(fs.existsSync(path.join(root, 'src/infrastructure/community/discordGuidePublicationAdapter.js')), false);
assert.equal(fs.existsSync(path.join(root, 'src/composition/communityGuideExecutionFeature.js')), false);
console.log('community Guide Discord mutation lookup ownership passed');
