const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
const executionRequest = fs.readFileSync(path.join(root, 'src/application/community/guideExecution/GuidePublicationExecutionRequest.js'), 'utf8');

const editIndex = runtime.indexOf('await message.edit(payload)');
const sendIndex = runtime.indexOf('message = await channel.send(payload)');
const persistIndex = runtime.indexOf('saveOnboarding(guild.id');
assert.ok(editIndex >= 0 && sendIndex >= 0 && persistIndex >= 0);
assert.ok(persistIndex > editIndex);
assert.ok(persistIndex > sendIndex);
assert.equal(/saveOnboarding|persistCommunityPublicationRecord|repository|filesystem|JSON/.test(executionRequest), false);
assert.match(runtime, /setupRoadmapPanel/);
console.log('community Guide Discord mutation persistence separation passed');
