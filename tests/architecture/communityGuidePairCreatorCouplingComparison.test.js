const assert = require('node:assert/strict');

const directInfrastructure = ['runtime', 'GuidePublicationAdapterPairFactory'];
const compositionCapability = ['runtime', 'createAdapterPair'];
assert.equal(directInfrastructure.length, 2);
assert.equal(compositionCapability.length, 2);
assert.equal(compositionCapability.includes('GuidePublicationAdapterPairFactory'), false);
console.log('Guide pair creator coupling comparison characterized');
