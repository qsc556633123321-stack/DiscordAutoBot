const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
assert.match(runtime, /async function setupCommunityGuide/);
assert.match(runtime, /await message\.edit\(payload\)/);
assert.match(runtime, /message = await channel\.send\(payload\)/);
assert.match(runtime, /saveOnboarding\(guild\.id/);
assert.match(runtime, /buildGuidePublicationMutationPlan/);
assert.match(runtime, /GuidePublicationOperationType/);
console.log('community Guide publication execution characterization diff guard passed');
