const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
for (const file of [
  'src/application/community/guidePublication/GuidePublicationPort.js',
  'src/infrastructure/community/discordGuidePublicationAdapter.js',
  'src/composition/communityGuidePublicationFeature.js'
]) assert.equal(fs.existsSync(path.join(root, file)), false, file);
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
assert.match(runtime, /async function setupCommunityGuide/);
assert.match(runtime, /buildGuidePublicationMutationPlan/);
assert.match(runtime, /GuidePublicationOperationType/);
console.log('guide publication mutation plan diff guard passed');
