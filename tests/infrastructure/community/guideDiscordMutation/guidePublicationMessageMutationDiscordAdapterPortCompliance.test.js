const assert = require('node:assert/strict');
const { assertGuidePublicationMessageMutationPort } = require('../../../../src/application/community/ports/GuidePublicationMessageMutationPort');
const { createGuidePublicationMessageMutationDiscordAdapter } = require('../../../../src/infrastructure/community/guidePublication/GuidePublicationMessageMutationDiscordAdapter');

assert.doesNotThrow(() => assertGuidePublicationMessageMutationPort(createGuidePublicationMessageMutationDiscordAdapter({ session: { async editTrackedMessage() {}, async sendMessage() { return { id: 'sent' }; } } })));
console.log('Guide production mutation adapter port compliance passed');
