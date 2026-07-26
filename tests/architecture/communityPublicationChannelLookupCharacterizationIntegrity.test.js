const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
for (const file of [
  'docs/refactor-audit/COMMUNITY_PUBLICATION_CHANNEL_LOOKUP_INPUT_AUDIT.md',
  'docs/refactor-audit/COMMUNITY_PUBLICATION_CHANNEL_LOOKUP_BASELINE.md',
  'docs/refactor-audit/COMMUNITY_PUBLICATION_CHANNEL_LOOKUP_SEARCH_SCOPE.md',
  'docs/refactor-audit/COMMUNITY_PUBLICATION_CHANNEL_LOOKUP_CONSUMER_INVENTORY.md',
  'docs/refactor-audit/COMMUNITY_PUBLICATION_CHANNEL_LOOKUP_CALL_GRAPH.md',
  'docs/refactor-audit/COMMUNITY_PUBLICATION_CHANNEL_LOOKUP_TARGET_DECISION.md',
  'docs/refactor-audit/COMMUNITY_PUBLICATION_CHANNEL_LOOKUP_BRANCH_MATRIX.md',
  'docs/refactor-audit/COMMUNITY_PUBLICATION_CHANNEL_LOOKUP_API_CONTRACT.md',
  'docs/refactor-audit/COMMUNITY_PUBLICATION_CHANNEL_LOOKUP_OBSERVABLE_CONTRACT.md',
  'docs/refactor-audit/COMMUNITY_PUBLICATION_CHANNEL_LOOKUP_PUBLISH_COUPLING_MATRIX.md',
  'docs/refactor-audit/COMMUNITY_PUBLICATION_CHANNEL_LOOKUP_RUNTIME_INTEGRATION_READINESS.md',
  'docs/refactor-audit/COMMUNITY_PUBLICATION_CHANNEL_LOOKUP_CHARACTERIZATION_COVERAGE.md',
  'tests/fixtures/community/community-publication-channel-lookup-cases.json',
  'tests/community/communityPublicationChannelLookupPreIntegrationBaseline.test.js',
  'tests/community/communityPublicationChannelLookupFailureCharacterization.test.js',
  'tests/community/communityPublicationChannelLookupCallCountBaseline.test.js',
  'tests/architecture/communityPublicationChannelLookupCharacterizationBoundary.test.js',
  'tests/architecture/communityPublicationChannelLookupCharacterizationDiffGuard.test.js'
]) assert.equal(fs.existsSync(path.join(root, file)), true, `missing ${file}`);

const fixture = JSON.parse(fs.readFileSync(path.join(root, 'tests/fixtures/community/community-publication-channel-lookup-cases.json'), 'utf8'));
assert.equal(fixture.length, 30);
assert.match(fs.readFileSync(path.join(root, 'docs/refactor-audit/COMMUNITY_PUBLICATION_CHANNEL_LOOKUP_TARGET_DECISION.md'), 'utf8'), /sendConciergeWelcome/);
assert.match(fs.readFileSync(path.join(root, 'docs/refactor-audit/COMMUNITY_PUBLICATION_CHANNEL_LOOKUP_RUNTIME_INTEGRATION_READINESS.md'), 'utf8'), /No Channel Lookup Runtime Integration Slice Approved/);
assert.equal(fs.existsSync(path.join(root, 'src/infrastructure/community/communityPublicationChannelLookupAdapter.js')), false);
assert.equal(fs.existsSync(path.join(root, 'src/application/community/communityPublicationChannelLookupPort.js')), false);
assert.equal(fs.existsSync(path.join(root, 'src/composition/communityPublicationChannelLookupFeature.js')), false);
console.log('community publication channel lookup characterization integrity passed');
