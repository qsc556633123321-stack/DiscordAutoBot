const assert = require('assert');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', '..');
for (const file of [
  'docs/refactor-audit/COMMUNITY_PUBLICATION_CHANNEL_IDENTITY_INPUT_AUDIT.md',
  'docs/refactor-audit/COMMUNITY_PUBLICATION_CHANNEL_IDENTITY_CONSUMER_INVENTORY.md',
  'docs/refactor-audit/COMMUNITY_PUBLICATION_CHANNEL_IDENTITY_MAPPING_MATRIX.md',
  'docs/refactor-audit/COMMUNITY_PUBLICATION_CHANNEL_IDENTITY_RUNTIME_BOUNDARY.md',
  'docs/refactor-audit/COMMUNITY_PUBLICATION_CHANNEL_IDENTITY_BASELINE.md',
  'docs/refactor-audit/COMMUNITY_PUBLICATION_CHANNEL_IDENTITY_CHARACTERIZATION.md',
  'docs/refactor-audit/COMMUNITY_PUBLICATION_CHANNEL_IDENTITY_READINESS.md',
]) assert.equal(fs.existsSync(path.join(root, file)), true, `missing ${file}`);
const state = fs.readFileSync(path.join(root, 'src/domain/community/communityPublicationState.js'), 'utf8');
assert.match(state, /createGuidePublicationState/);
assert.match(state, /createRoadmapPublicationState/);
assert.equal(fs.existsSync(path.join(root, 'src/infrastructure/community/communityPublicationChannelIdentityAdapter.js')), false);
assert.equal(fs.existsSync(path.join(root, 'src/composition/communityPublicationChannelIdentityFeature.js')), false);
console.log('community publication channel identity preparation integrity passed');
