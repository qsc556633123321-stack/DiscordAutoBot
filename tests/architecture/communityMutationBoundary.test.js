const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const source = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
for (const token of ['setupCommunityGuide', 'setupRoadmapPanel', 'saveOnboarding', 'writeJson', 'guild.channels.create', 'channel.send', 'message.edit']) assert.match(source, new RegExp(token.replace(/[.]/g, '\\.')));
for (const file of ['src/application/community/CommunityMutationPort.js', 'src/infrastructure/community/discordCommunityMutationAdapter.js', 'src/composition/communityMutationFeature.js']) assert.equal(fs.existsSync(path.join(root, file)), false);
console.log('community mutation boundary passed');
