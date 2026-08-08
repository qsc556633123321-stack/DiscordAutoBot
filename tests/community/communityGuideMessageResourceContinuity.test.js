const assert = require('node:assert/strict');
const path = require('node:path');
const cases = require(path.resolve(__dirname, '../fixtures/community/community-guide-channel-resource-boundary-cases.json'));
for (const item of cases.filter((entry) => entry.sameMessage)) {
  assert.equal(item.fetch, 1, item.id);
  assert.equal(item.resolve, 0, item.id);
}
console.log('Guide message resource continuity passed');
