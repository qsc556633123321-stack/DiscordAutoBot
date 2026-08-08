const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src', 'systems', 'communityConcierge.js'), 'utf8');
const request = fs.readFileSync(path.join(root, 'src', 'application', 'community', 'guideExecution', 'GuidePublicationExecutionRequest.js'), 'utf8');

assert.equal(/createGuidePublicationExecutionRequest/.test(runtime), false, 'runtime must not integrate Execution Request');
assert.match(runtime, /await message\.edit\(payload\)/);
assert.match(runtime, /message = await channel\.send\(payload\)/);
assert.match(runtime, /saveOnboarding\(guild\.id/);
assert.equal(/Port|Adapter|Repository|Composition/.test(request), false, 'Request contract must remain a pure data shape');
console.log('Community Guide execution post-persistence diff guard passed.');
