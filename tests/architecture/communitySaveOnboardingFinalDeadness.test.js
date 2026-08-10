const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const source = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
const exported = source.slice(source.indexOf('module.exports'));
assert.equal((source.match(/function saveOnboarding\(/g) || []).length, 1);
assert.equal((source.match(/\bsaveOnboarding\b/g) || []).length, 1);
assert.equal(exported.includes('saveOnboarding'), false);
assert.equal(source.includes("['saveOnboarding']"), false);
assert.equal(source.includes('Reflect.get'), false);
console.log('saveOnboarding is private, defined once, and has zero production consumers.');
