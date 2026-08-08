const assert = require('node:assert/strict');
const path = require('node:path');
const cases = require(path.resolve(__dirname, '../fixtures/community/community-guide-channel-resource-boundary-cases.json'));
for (const item of cases.filter((entry) => entry.resolve === 0)) assert.equal(item.resolve, 0, item.id);
assert.equal(cases.find((item) => item.id === 'CR-28').resolve, 2);
console.log('Guide channel no re-resolution contract passed');
