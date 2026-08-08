const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');

assert.match(runtime, /channel\.messages\.fetch\(guideMessageId\)\.catch\(\(\) => null\)/);
assert.doesNotMatch(runtime, /lookupPort\.lookup\s*\(/);
assert.doesNotMatch(runtime, /mutationPort\.(?:edit|send)\s*\(/);
assert.doesNotMatch(fs.readFileSync(path.join(root, 'src/application/community/guideLookup/GuidePublicationMessageLookupResult.js'), 'utf8'), /DiscordMessage|Session|discord\.js/);
console.log('Community guide lookup message identity handoff preparation boundary passed');
