const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..', '..');
const required = [
  'docs/refactor-audit/COMMUNITY_PUBLICATION_IDENTITY_CONSUMER_INVENTORY.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MESSAGE_IDENTITY_CONTRACT.md',
  'docs/refactor-audit/COMMUNITY_ROADMAP_MESSAGE_IDENTITY_CONTRACT.md',
  'docs/refactor-audit/COMMUNITY_PUBLICATION_CHANNEL_IDENTITY_CONTRACT.md',
  'docs/refactor-audit/COMMUNITY_PUBLICATION_IDENTITY_STATE_MATRIX.md',
  'docs/refactor-audit/COMMUNITY_PUBLICATION_MANUAL_REPAIR_CONTRACT.md',
  'docs/refactor-audit/COMMUNITY_PUBLICATION_DUPLICATE_DETECTION_AUDIT.md',
  'docs/refactor-audit/COMMUNITY_PUBLICATION_IDENTITY_BOUNDARY_CANDIDATES.md',
  'docs/refactor-audit/COMMUNITY_PUBLICATION_IDENTITY_READINESS_DECISION.md',
  'docs/refactor-audit/COMMUNITY_PUBLICATION_IDENTITY_COVERAGE.md',
  'tests/fixtures/communityPublicationIdentityLegacyBaseline.js',
  'tests/helpers/createCommunityPublicationIdentityHarness.js',
  'tests/community/communityGuidePublicationIdentityBaseline.test.js',
  'tests/community/communityRoadmapPublicationIdentityBaseline.test.js',
  'tests/community/communityPublicationChannelIdentityBaseline.test.js',
  'tests/community/communityPublicationLostRecordRecoveryBaseline.test.js',
  'tests/community/communityPublicationWrongRecordRecoveryBaseline.test.js'
];
for (const file of required) assert.equal(fs.existsSync(path.join(root, file)), true, `${file} must exist`);
const matrix = fs.readFileSync(path.join(root, required[4]), 'utf8');
for (let index = 1; index <= 30; index += 1) assert.match(matrix, new RegExp(`I-B${String(index).padStart(2, '0')}`));
assert.match(matrix, /Not\nApplicable/);
const readiness = fs.readFileSync(path.join(root, required[8]), 'utf8');
assert.match(readiness, /No Publication Identity Preparation Slice Approved/);
const mutationReadiness = fs.readFileSync(path.join(root, 'docs/refactor-audit/COMMUNITY_GUIDE_MUTATION_READINESS_DECISION.md'), 'utf8');
assert.match(mutationReadiness, /No Mutation Slice Approved/);
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
for (const token of ['guideMessageId', 'roadmapMessageId', 'channel.messages.fetch', 'channel.send', 'message.edit']) assert.match(runtime, new RegExp(token.replace('.', '\\.')));
assert.equal(fs.existsSync(path.join(root, 'src', 'services', 'community', 'publicationIdentityResolver.js')), false);
assert.equal(fs.existsSync(path.join(root, 'src', 'data', 'onboarding-flows.json')), true);
assert.match(fs.readFileSync(path.join(root, 'src', 'legacy', 'events', 'channelDelete.js'), 'utf8'), /handleTempVoiceChannelDelete/);
console.log('Community publication identity contract integrity tests passed.');
