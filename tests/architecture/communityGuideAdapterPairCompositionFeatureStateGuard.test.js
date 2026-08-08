const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');
const source = fs.readFileSync(path.join(root, 'src/composition/communityGuideAdapterPairFeature.js'), 'utf8');

assert.equal(/currentChannel|currentSession|currentMessage|currentPair|lastPair|pairCache|guildPairs|sessionRegistry|Map\(|WeakMap\(|AsyncLocalStorage|singleton/.test(source), false);
console.log('Community guide adapter pair composition feature state guard passed');
