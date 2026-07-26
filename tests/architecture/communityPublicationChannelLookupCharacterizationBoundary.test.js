const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const source = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
const event = fs.readFileSync(path.join(root, 'src/events/guildMemberAdd.js'), 'utf8');

assert.match(source, /async function sendConciergeWelcome\(member\)/);
assert.match(source, /guideChannelId/);
assert.match(source, /channels\.cache\.get/);
assert.match(source, /channels\.fetch/);
assert.match(source, /findChannelByName/);
assert.match(source, /member\.send/);
assert.match(source, /async function setupCommunityGuide/);
assert.match(source, /async function setupRoadmapPanel/);
assert.match(source, /function saveOnboarding/);
assert.match(event, /sendConciergeWelcome/);
assert.equal(fs.existsSync(path.join(root, 'src/infrastructure/community/communityPublicationChannelLookupAdapter.js')), false);
assert.equal(fs.existsSync(path.join(root, 'src/application/community/communityPublicationChannelLookupPort.js')), false);
assert.equal(fs.existsSync(path.join(root, 'src/composition/communityPublicationChannelLookupFeature.js')), false);
console.log('community publication channel lookup characterization boundary passed');
