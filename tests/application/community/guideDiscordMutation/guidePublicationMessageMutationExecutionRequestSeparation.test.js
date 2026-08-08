const assert = require('node:assert/strict');
const { createGuidePublicationExecutionRequest } = require('../../../../src/application/community/guideExecution/GuidePublicationExecutionRequest');
const { createGuidePublicationMessageEditRequest } = require('../../../../src/application/community/guideDiscordMutation/GuidePublicationMessageEditRequest');
const { createGuidePublicationMessageSendRequest } = require('../../../../src/application/community/guideDiscordMutation/GuidePublicationMessageSendRequest');

const payload = { embeds: [] };
const execution = createGuidePublicationExecutionRequest({ operation: 'EditExistingMessage', trackedMessageId: 'm', payload });
assert.equal('guildId' in execution, false);
assert.equal('channelId' in execution, false);
assert.equal('messageId' in execution, false);
assert.deepEqual(createGuidePublicationMessageEditRequest({ guildId: 'g', channelId: 'c', messageId: 'm', payload }), { guildId: 'g', channelId: 'c', messageId: 'm', payload });
assert.deepEqual(createGuidePublicationMessageSendRequest({ guildId: 'g', channelId: 'c', payload }), { guildId: 'g', channelId: 'c', payload });
console.log('Guide publication message mutation execution request separation passed');
