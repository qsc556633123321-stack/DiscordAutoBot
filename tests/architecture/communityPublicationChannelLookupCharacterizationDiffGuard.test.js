const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');

assert.match(runtime, /async function sendConciergeWelcome\(member\)/);
assert.match(runtime, /member\.guild\.channels\.cache\.get\(data\.guideChannelId\)/);
assert.match(runtime, /member\.guild\.channels\.fetch\(data\.guideChannelId\)\.catch\(\(\) => null\)/);
assert.equal(/CommunityPublicationChannelLookup(?:Adapter|Port|Feature)|resolveGuideChannelIdentity/.test(runtime), false);
for (const forbidden of [
  'src/infrastructure/community/communityPublicationChannelLookupAdapter.js',
  'src/application/community/communityPublicationChannelLookupPort.js',
  'src/composition/communityPublicationChannelLookupFeature.js'
]) assert.equal(fs.existsSync(path.join(root, forbidden)), false, `unexpected production integration ${forbidden}`);
console.log('community publication channel lookup characterization diff guard passed');
