const assert = require('node:assert/strict');
const path = require('node:path');
const cases = require(path.resolve(__dirname, '../fixtures/community/community-guide-channel-resource-boundary-cases.json'));
for (const item of cases.filter((entry) => !entry.sameMessage && entry.resolve === 0 && entry.sameChannel)) {
  assert.equal(item.ensure, 1, item.id);
  assert.equal(item.sameChannel, true, item.id);
}
console.log('Guide channel send resource reuse passed');
