const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const runtime = read('src/systems/communityConcierge.js');
const adapter = read('src/infrastructure/community/communityPublicationStateFilesystemAdapter.js');
const composition = read('src/composition/communityPublicationStateFeature.js');
const useCase = read('src/application/community/persistCommunityPublicationRecordUseCase.js');

assert.match(runtime, /createCommunityPublicationStateFeature/);
assert.match(runtime, /persistCommunityPublicationRecord\.execute/);
assert.equal(/function writeJson\(/.test(runtime), false, 'legacy runtime must not own the publication writer');
assert.match(composition, /createCommunityPublicationStateFilesystemAdapter/);
assert.match(composition, /createPersistCommunityPublicationRecordUseCase/);
assert.match(adapter, /readFileSync/);
assert.match(adapter, /writeFileSync/);
assert.equal(/discord\.js|src\/systems|src\/events/.test(adapter), false, 'filesystem adapter must stay outside Discord runtime');
assert.equal(/fs|path|discord\.js/.test(useCase), false, 'application use case must remain pure');

console.log('Community publication persistence runtime integration boundary passed.');
