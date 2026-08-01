const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
for (const file of ['src/application/community/CommunityMutationPort.js', 'src/infrastructure/community/discordCommunityMutationAdapter.js', 'src/composition/communityMutationFeature.js']) assert.equal(fs.existsSync(path.join(root, file)), false);
const source = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
assert.match(source, /async function setupCommunityGuide/);
assert.match(source, /async function setupRoadmapPanel/);
console.log('community mutation diff guard passed');
