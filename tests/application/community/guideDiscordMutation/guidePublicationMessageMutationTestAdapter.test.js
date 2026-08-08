const assert = require('node:assert/strict');
const { createGuidePublicationMessageEditRequest } = require('../../../../src/application/community/guideDiscordMutation/GuidePublicationMessageEditRequest');
const { createGuidePublicationMessageSendRequest } = require('../../../../src/application/community/guideDiscordMutation/GuidePublicationMessageSendRequest');
const { GuidePublicationMessageMutationFailure } = require('../../../../src/application/community/guideDiscordMutation/GuidePublicationMessageMutationFailure');
const { createFakeGuidePublicationMessageMutationPort } = require('../../../fakes/community/FakeGuidePublicationMessageMutationPort');

const payload = { embeds: [{ title: 'Guide' }] };
const edit = createGuidePublicationMessageEditRequest({ guildId: 'g', channelId: 'c', messageId: 'm', payload });
const send = createGuidePublicationMessageSendRequest({ guildId: 'g', channelId: 'c', payload });
const fake = createFakeGuidePublicationMessageMutationPort();
assert.deepEqual(fake.edit(edit), { kind: 'EditSuccess', messageId: 'm' });
assert.deepEqual(fake.send(send), { kind: 'SendSuccess', messageId: 'generated-message-id' });
assert.deepEqual(fake.calls.map((call) => call.method), ['edit', 'send']);
assert.equal(fake.calls[0].request, edit);
assert.equal(fake.calls[1].request, send);

const failure = { kind: 'Failure', failureKind: GuidePublicationMessageMutationFailure.SendRejected };
const failing = createFakeGuidePublicationMessageMutationPort({ editResult: failure, sendResult: failure });
assert.equal(failing.edit(edit), failure);
assert.equal(failing.send(send), failure);
assert.deepEqual(failing.fail(GuidePublicationMessageMutationFailure.Unknown), { kind: 'Failure', failureKind: 'Unknown' });
console.log('Guide publication message mutation test adapter passed');
