const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');

for (const forbidden of [
  'src/infrastructure/community/GuidePublicationMessageLookupDiscordAdapter.js',
  'src/infrastructure/community/GuidePublicationMessageMutationDiscordAdapter.js',
  'src/composition/communityGuideResourceSessionFeature.js'
]) assert.equal(fs.existsSync(path.join(root, forbidden)), false, forbidden);
const session = fs.readFileSync(path.join(root, 'src/infrastructure/community/guidePublication/GuidePublicationResourceSession.js'), 'utf8');
assert.equal(session.includes('node:fs'), false);
assert.equal(session.includes('discord.js'), false);
const audit = fs.readFileSync(path.join(root, 'scripts/audit-dead-code.js'), 'utf8');
assert.match(audit, /src\/infrastructure\/community\/guidePublication\/GuidePublicationResourceSession\.js/);
console.log('Guide production resource session implementation diff guard passed');
