const assert = require('node:assert/strict');
const { createFakeGuideDiscordResources } = require('../../../fakes/community/FakeGuideDiscordResources');
const { createGuidePublicationMessageEditRequest } = require('../../../../src/application/community/guideDiscordMutation/GuidePublicationMessageEditRequest');
const { createGuidePublicationMessageSendRequest } = require('../../../../src/application/community/guideDiscordMutation/GuidePublicationMessageSendRequest');

const resources = createFakeGuideDiscordResources({ guild: { id: 'g' }, channel: { id: 'c' }, message: { id: 'm' } });
const edit = createGuidePublicationMessageEditRequest({ guildId: 'g', channelId: 'c', messageId: 'm', payload: { embeds: [] } });
const send = createGuidePublicationMessageSendRequest({ guildId: 'g', channelId: 'c', payload: { embeds: [] } });

resources.resolveGuild(edit.guildId);
resources.resolveChannel(edit);
resources.fetchMessage(edit);
resources.editMessage(edit);
resources.resolveGuild(send.guildId);
resources.resolveChannel(send);
resources.sendMessage(send);

assert.deepEqual(resources.calls.map((call) => call.method), [
  'resolveGuild', 'resolveChannel', 'fetchMessage', 'editMessage',
  'resolveGuild', 'resolveChannel', 'sendMessage'
]);
assert.equal(resources.calls[3].payload, edit.payload);
assert.equal(resources.calls[6].payload, send.payload);
console.log('Guide publication message mutation Discord adapter contract characterization passed');
