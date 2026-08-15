const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const legacy = fs.readFileSync(path.join(root, 'src', 'legacy', 'interactions', 'legacyInteractionRuntime.js'), 'utf8');
const router = fs.readFileSync(path.join(root, 'src', 'modules', 'interactions', 'buttonInteractionHandler.js'), 'utf8');
const handler = fs.readFileSync(path.join(root, 'src', 'modules', 'interactions', 'buttonHandlers', 'communityConciergeButtons.js'), 'utf8');
const resolver = fs.readFileSync(path.join(root, 'src', 'application', 'community', 'CommunityConciergeButtonActionResolver.js'), 'utf8');

assert.equal(legacy.includes("startsWith('concierge_')"), false);
assert.equal(legacy.includes('handleConciergeButton'), false);
assert.match(router, /communityConciergeButtons/);
assert.match(handler, /customId\.startsWith\(CONCIERGE_PREFIX\)/);
assert.match(handler, /await handleConciergeButton\(interaction\)/);
assert.equal(handler.includes('if (await handleConciergeButton'), false);
assert.match(handler, /console\.error\('Concierge button failed:', error\)/);
assert.match(handler, /!interaction\.replied && !interaction\.deferred/);
assert.match(resolver, /concierge_games/);
console.log('Community button-dispatch implementation preserves modern Concierge ownership and legacy error compatibility.');
