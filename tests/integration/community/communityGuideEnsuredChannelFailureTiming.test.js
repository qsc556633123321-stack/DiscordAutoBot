const assert = require('node:assert/strict');
const cases = require('../../fixtures/community/community-guide-ensured-channel-surface-cases.json');

const constructorRejected = cases.filter((item) => !item.pairValid);
assert.equal(constructorRejected.every((item) => !item.productionValid), true);
assert.equal(cases.find((item) => item.id === 'EC-40').productionValid, false);
console.log('Guide ensured channel failure timing characterized');
