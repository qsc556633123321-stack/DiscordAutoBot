const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');

for (const file of [
  'src/infrastructure/community/guidePublication/GuidePublicationResourceSession.js',
  'src/infrastructure/community/guidePublication/GuidePublicationMessageLookupDiscordAdapter.js',
  'src/infrastructure/community/guidePublication/GuidePublicationMessageMutationDiscordAdapter.js',
  'src/infrastructure/community/guidePublication/GuidePublicationAdapterPairFactory.js'
]) assert.equal(fs.existsSync(path.join(root, file)), true, file);
const source = fs.readFileSync(path.join(root, 'src/infrastructure/community/guidePublication/GuidePublicationAdapterPairFactory.js'), 'utf8');
assert.equal(/discord\.js|node:fs|client\.channels|guild\.channels|saveOnboarding|Roadmap|createCommunity/.test(source), false);
console.log('Guide production adapter pair factory implementation boundary passed');
