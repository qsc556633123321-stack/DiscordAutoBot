const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const source = fs.readFileSync(path.join(root, 'src/application/community/guidePublication/GuidePersistenceRequest.js'), 'utf8');
assert.match(source, /guideChannelId: request\.channelId/);
assert.match(source, /guideMessageId: request\.messageId/);
assert.match(source, /nativeTaskRecommendations: request\.nativeTaskRecommendations/);
assert.match(source, /nativeTaskExcludedChannels: request\.nativeTaskExcludedChannels/);
assert.equal(fs.existsSync(path.join(root, 'src/application/community/guidePublication/GuidePublicationPersistenceRequest.js')), false);
assert.equal(fs.existsSync(path.join(root, 'src/application/community/guidePublication/GuideNativeTaskPersistenceRequest.js')), false);
console.log('Guide persistence mapper retains all four legacy fields in one atomic patch.');
