const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');

for (const file of [
  'src/systems/communityConcierge.js',
  'src/application/community/ports/GuidePublicationMessageLookupPort.js',
  'src/infrastructure/community/guidePublication/GuidePublicationMessageLookupDiscordAdapter.js'
]) assert.equal(fs.existsSync(path.join(root, file)), true, file);
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
assert.match(runtime, /channel\.messages\.fetch\(guideMessageId\)\.catch\(\(\) => null\)/);
assert.doesNotMatch(runtime, /lookupPort\.lookup\s*\(/);
console.log('Community guide runtime lookup redirect preparation diff guard passed');
