const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const s=fs.readFileSync(path.resolve(__dirname,'../../src/infrastructure/community/guidePublication/GuidePublicationResourceSession.js'),'utf8');
assert.equal(s.includes('retainedMessage = await ensuredChannel.send'),false);console.log('Send identity handoff remains unimplemented');
