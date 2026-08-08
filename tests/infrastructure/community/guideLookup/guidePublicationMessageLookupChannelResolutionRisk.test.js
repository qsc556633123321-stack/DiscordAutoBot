const assert = require('node:assert');
const { createFakeGuideMessageLookupDiscordResources } = require('../../../fakes/community/FakeGuideMessageLookupDiscordResources');

const missing = createFakeGuideMessageLookupDiscordResources({ channel: null });
assert.equal(missing.resolveChannel({ guildId: 'g', channelId: 'c' }), null);
assert.equal(missing.calls.length, 1);
const rejected = createFakeGuideMessageLookupDiscordResources({ channelError: new Error('channel lookup rejected') });
assert.throws(() => rejected.resolveChannel({ guildId: 'g', channelId: 'c' }), /channel lookup rejected/);
assert.equal(rejected.calls.length, 1);
console.log('Guide message lookup channel resolution risk characterized');
