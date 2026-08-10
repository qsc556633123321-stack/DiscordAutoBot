const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const runtimePath = path.join(root, 'src', 'systems', 'communityConcierge.js');
const messageAdapterPath = path.join(root, 'src', 'infrastructure', 'community', 'CommunityPublicationTrackingReadCompatibilityAdapter.js');
const channelAdapterPath = path.join(root, 'src', 'infrastructure', 'community', 'CommunityPublicationChannelTrackingReadCompatibilityAdapter.js');
const runtime = fs.readFileSync(runtimePath, 'utf8');
const messageAdapter = fs.readFileSync(messageAdapterPath, 'utf8');
const channelAdapter = fs.readFileSync(channelAdapterPath, 'utf8');

assert.equal((runtime.match(/function readOnboardingData\(/g) || []).length, 1);
assert.equal((runtime.match(/\breadOnboardingData\b/g) || []).length, 4, 'definition plus three adapter injections');
assert.equal((runtime.match(/readOnboardingData\(\)/g) || []).length, 1, 'only the helper definition matches direct-call syntax');
assert.equal(runtime.slice(runtime.indexOf('module.exports')).includes('readOnboardingData'), false);
for (const adapter of [messageAdapter, channelAdapter]) {
  assert.equal(adapter.includes('readOnboardingData'), true);
  assert.equal((adapter.match(/readOnboardingData\(\)/g) || []).length, 1, 'each adapter owns exactly one injected read');
}
console.log('readOnboardingData has zero direct runtime calls but remains an injected compatibility dependency for three adapter constructions.');
