const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');

for (const file of [
  'src/application/community/ports/GuidePublicationMessageLookupPort.js',
  'src/application/community/guideLookup/GuidePublicationMessageLookupStatus.js',
  'src/application/community/guideLookup/GuidePublicationMessageLookupRequest.js',
  'src/application/community/guideLookup/GuidePublicationMessageLookupResult.js'
]) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  assert.equal(/discord\.js|node:fs|systems\/|infrastructure\/|composition\/|saveOnboarding|Roadmap|\.send\(|\.edit\(/.test(source), false, file);
}
for (const forbidden of [
  'src/infrastructure/community/GuidePublicationMessageLookupDiscordAdapter.js',
  'src/infrastructure/community/discordGuidePublicationMessageLookupAdapter.js',
  'src/composition/communityGuidePublicationMessageLookupFeature.js'
]) assert.equal(fs.existsSync(path.join(root, forbidden)), false, forbidden);
console.log('Guide message lookup Application port boundary passed');
