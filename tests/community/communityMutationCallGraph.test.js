const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', '..', 'src/systems/communityConcierge.js'), 'utf8');
const guide = source.slice(source.indexOf('async function setupCommunityGuide'), source.indexOf('async function setupRoadmapPanel'));
const roadmap = source.slice(source.indexOf('async function setupRoadmapPanel'), source.indexOf('async function maybeAddRole'));
for (const token of ['getOrCreateGuideChannel', 'channel.messages.fetch', 'message.edit', 'channel.send', 'saveOnboarding']) assert.match(guide, new RegExp(token.replace(/[.]/g, '\\.')));
for (const token of ['getOrCreateRoadmapChannel', 'lookupPort.lookupTrackedMessage', 'mutationPort.edit', 'mutationPort.send', 'createRoadmapPublicationPersistenceRequest', 'communityRoadmapPersistenceFeature.persist']) assert.match(roadmap, new RegExp(token.replace(/[.]/g, '\\.')));
console.log('community mutation call graph passed');
