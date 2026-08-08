const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');

for (const file of [
  'docs/refactor-audit/COMMUNITY_GUIDE_RETAINED_MESSAGE_ACCESSOR_CURRENT_STATE.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_RETAINED_MESSAGE_ACCESSOR_IMPLEMENTATION_BLOCKERS.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_RETAINED_MESSAGE_ACCESSOR_VISIBILITY.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_RETAINED_MESSAGE_ACCESSOR_POST_IMPLEMENTATION_READINESS.md',
  'tests/infrastructure/community/guidePublication/guidePublicationResourceSessionRetainedMessage.test.js',
  'tests/integration/community/communityGuideRetainedMessageLookupAdapterCompatibility.test.js',
  'tests/integration/community/communityGuideRetainedMessageMutationAdapterCompatibility.test.js',
  'tests/architecture/communityGuideRetainedMessageApplicationPurity.test.js',
  'tests/architecture/communityGuideRetainedMessageAccessorNotRuntimeWired.test.js',
  'tests/architecture/communityGuideRetainedMessageAccessorImplementationBoundary.test.js',
  'tests/architecture/communityGuideRetainedMessageAccessorImplementationDiffGuard.test.js'
]) assert.equal(fs.existsSync(path.join(root, file)), true, file);

const session = fs.readFileSync(path.join(root, 'src/infrastructure/community/guidePublication/GuidePublicationResourceSession.js'), 'utf8');
assert.match(session, /getRetainedMessage\(\)/);
assert.match(session, /retainedMessage = null;\s*throw error;/s);
console.log('Guide retained-message accessor implementation integrity passed');
