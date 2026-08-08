const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../../../..');

for (const file of [
  'src/application/community/ports/GuidePublicationMessageLookupPort.js',
  'src/application/community/guideLookup/GuidePublicationMessageLookupRequest.js',
  'src/application/community/guideLookup/GuidePublicationMessageLookupResult.js'
]) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  assert.equal(/PersistCommunityPublication|Repository|saveOnboarding|JSON|Roadmap|node:fs/.test(source), false, file);
}
console.log('Guide publication message lookup persistence separation passed');
