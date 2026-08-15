const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
const adapter = fs.readFileSync(path.join(root, 'src/infrastructure/community/CommunityChannelSetupCompatibilityAdapter.js'), 'utf8');

assert.match(runtime, /createCommunityChannelSetupCompatibilityAdapter\(\{[\s\S]*onboardingVisible: permissionTemplates\.onboardingVisible/);
assert.match(runtime, /ensureGuideChannel\(\{/);
assert.match(runtime, /ensureRoadmapChannel\(\{/);
assert.equal(runtime.includes('getOrCreateGuideChannel'), false);
assert.equal(runtime.includes('getOrCreateRoadmapChannel'), false);
assert.equal(runtime.includes('guild.channels.create'), false);
assert.equal(runtime.includes('channel.setParent'), false);
assert.equal(runtime.includes('permissionOverwrites.set'), false);
assert.match(adapter, /reason: 'Community concierge setup'/);
assert.match(adapter, /reason: 'Community guide setup'/);
assert.match(adapter, /reason: 'Community roadmap setup'/);
assert.match(adapter, /lockPermissions: false/);
assert.match(adapter, /\.catch\(\(\) => null\)/);
console.log('Production Concierge delegates Guide and Roadmap channel setup to the compatibility adapter without changing publication ownership.');
