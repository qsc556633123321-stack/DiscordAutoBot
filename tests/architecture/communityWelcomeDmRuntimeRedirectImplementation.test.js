const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const runtimePath = path.join(root, 'src', 'systems', 'communityConcierge.js');
const adapterPath = path.join(root, 'src', 'infrastructure', 'community', 'CommunityWelcomeDmDeliveryAdapter.js');
const runtime = fs.readFileSync(runtimePath, 'utf8');
const start = runtime.indexOf('async function sendConciergeWelcome');
const end = runtime.indexOf('\n}\n\nmodule.exports', start);
const welcome = runtime.slice(start, end);

assert.ok(start >= 0 && end > start);
assert.equal((welcome.match(/member\.send\(/g) || []).length, 0);
assert.equal(welcome.includes('createCommunityWelcomeDmDeliveryAdapter'), true);
assert.equal(welcome.includes('await dmDelivery.send(payload)'), true);
assert.equal(welcome.indexOf('if (!guideChannel) return') < welcome.indexOf('mapLegacyWelcomeDeliveryRequest'), true);
assert.equal(welcome.indexOf('mapLegacyWelcomeDeliveryRequest') < welcome.indexOf('buildCommunityWelcomeMessage'), true);
assert.equal(welcome.indexOf('buildCommunityWelcomeMessage') < welcome.indexOf('createCommunityWelcomeDmDeliveryAdapter'), true);
assert.equal(welcome.indexOf('createCommunityWelcomeDmDeliveryAdapter') < welcome.indexOf('await dmDelivery.send(payload)'), true);
assert.equal(execFileSync('git', ['diff', '--name-only', 'HEAD', '--', adapterPath], { cwd: root, encoding: 'utf8' }).trim(), '');
const changedSource = execFileSync('git', ['diff', '--name-only', 'HEAD', '--', 'src'], { cwd: root, encoding: 'utf8' })
  .trim().split(/\r?\n/).filter(Boolean);
assert.equal(
  changedSource.length === 0
    || (changedSource.length === 1 && changedSource[0] === 'src/systems/communityConcierge.js'),
  true,
  'DM redirect implementation may be clean or modify only communityConcierge.js'
);
console.log('Welcome runtime delegates DM delivery through the adapter with the approved ordering and no direct send.');
