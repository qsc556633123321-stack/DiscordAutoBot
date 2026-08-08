const assert = require('node:assert/strict');
const { assertGuidePublicationMessageMutationPort } = require('../../../../src/application/community/ports/GuidePublicationMessageMutationPort');
const { createFakeGuidePublicationMessageMutationSessionAdapter } = require('../../../fakes/community/FakeGuidePublicationMessageMutationSessionAdapter');

assert.doesNotThrow(() => assertGuidePublicationMessageMutationPort(createFakeGuidePublicationMessageMutationSessionAdapter({ session: { async editTrackedMessage() {}, async sendMessage() { return { id: 'sent' }; } } })));
console.log('Guide mutation adapter session port compliance preparation passed');
