const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const organizer = require('../../src/systems/organizer');
const legacyRuntime = require('../../src/legacy/systemRuntimes/organizerRuntime');

const source = fs.readFileSync(path.join(__dirname, '..', '..', 'src', 'systems', 'organizer.js'), 'utf8');
assert.equal(source.includes('serverMemory'), false);
assert.equal(source.includes('jsonChannelRuleRepository'), false);
assert.equal(typeof organizer.createOrganizePlan, 'function');
assert.equal(typeof organizer.scoreChannelName, 'function');
assert.equal(organizer.scoreChannelName('規則').top.categoryName, '📌｜社群入口');

const fixtureRules = [{ keyword: 'Kuro', category: '🧠｜記憶專區', weight: 7 }];
assert.deepEqual(
  organizer.scoreChannelName('Kuro 專區', fixtureRules),
  legacyRuntime.scoreChannelName('Kuro 專區', fixtureRules),
  'The new consumer preserves legacy scoring for the same in-memory fixture.'
);

console.log('Organizer memory consumer migration regression tests passed.');
