const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const runtimePath = path.join(root, 'src', 'systems', 'communityConcierge.js');
const source = fs.readFileSync(runtimePath, 'utf8');
const exported = source.slice(source.indexOf('module.exports'));
const occurrences = source.match(/\bsaveOnboarding\b/g) || [];

assert.equal((source.match(/function saveOnboarding\(/g) || []).length, 0);
assert.equal(occurrences.length, 0, 'saveOnboarding is removed from production runtime');
assert.equal(exported.includes('saveOnboarding'), false);
assert.equal(source.includes('saveOnboarding(guild.id'), false);
console.log('saveOnboarding is removed after zero-consumer cleanup approval.');
