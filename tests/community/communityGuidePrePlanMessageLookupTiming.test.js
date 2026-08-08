const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.resolve(__dirname, '../../src/systems/communityConcierge.js'), 'utf8');

const ensure = source.indexOf('const channel = await getOrCreateGuideChannel(guild)');
const fetch = source.indexOf('channel.messages.fetch(guideMessageId)');
const plan = source.indexOf('const mutationPlan = buildGuidePublicationMutationPlan(mutationInput)');
assert.ok(ensure >= 0 && fetch > ensure && plan > fetch);
assert.match(source, /if \(guideMessageId && options\.mode !== 'force'\)/);
assert.match(source, /fetch\(guideMessageId\)\.catch\(\(\) => null\)/);
console.log('Guide pre-Plan message lookup timing passed');
