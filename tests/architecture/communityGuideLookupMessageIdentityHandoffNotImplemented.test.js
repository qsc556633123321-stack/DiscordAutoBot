const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');

for (const file of [
  'src/systems/communityConcierge.js',
  'src/infrastructure/community/guidePublication/GuidePublicationResourceSession.js',
  'src/infrastructure/community/guidePublication/GuidePublicationAdapterPairFactory.js'
]) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  for (const forbidden of ['getRetainedMessage', 'takeRetainedMessage', 'messageResourceHandle', 'handoffRetainedMessage']) assert.doesNotMatch(source, new RegExp(forbidden));
}
console.log('Community guide lookup message identity handoff remains unimplemented');
