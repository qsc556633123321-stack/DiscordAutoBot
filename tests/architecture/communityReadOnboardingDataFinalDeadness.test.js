const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const source = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
const exported = source.slice(source.indexOf('module.exports'));
assert.equal((source.match(/function readOnboardingData\(/g) || []).length, 1);
assert.equal((source.match(/\breadOnboardingData\b/g) || []).length, 1);
assert.equal(exported.includes('readOnboardingData'), false);
assert.equal(source.includes("['readOnboardingData']"), false);
assert.equal(source.includes('Reflect.get'), false);
console.log('readOnboardingData is private, defined once, and has zero production consumers.');
