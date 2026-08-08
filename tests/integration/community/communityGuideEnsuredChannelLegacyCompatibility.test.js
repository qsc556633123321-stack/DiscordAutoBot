const assert = require('node:assert/strict');
const cases = require('../../fixtures/community/community-guide-ensured-channel-surface-cases.json');

assert.equal(cases.length, 40);
for (const item of cases.filter((caseItem) => caseItem.productionValid)) {
  assert.equal(item.pairValid, true, item.id);
}
const mismatch = cases.filter((item) => item.productionValid !== item.pairValid);
assert.equal(mismatch.every((item) => item.productionValid === false && item.pairValid === true), true);
console.log('Guide ensured channel legacy compatibility characterized');
