const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const source = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
const exported = source.slice(source.indexOf('module.exports'));
assert.equal((source.match(/function saveOnboarding\(/g) || []).length, 0);
assert.equal((source.match(/\bsaveOnboarding\b/g) || []).length, 0);
assert.equal(exported.includes('saveOnboarding'), false);
assert.equal(source.includes("['saveOnboarding']"), false);
assert.equal(source.includes('Reflect.get'), false);
console.log('saveOnboarding is removed from production after zero-consumer cleanup.');
