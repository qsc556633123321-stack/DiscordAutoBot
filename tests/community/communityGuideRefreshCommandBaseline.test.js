const assert = require('node:assert/strict');
const fixture = require('../fixtures/communityGuideMutationLegacyBaseline');
const { createInteraction, hash, loadCommandWithConcierge } = require('./communityGuideCommandTestHelper');

async function main() {
  const delegation = [];
  const runtime = {
    async setupCommunityGuide(_guild, options) {
      delegation.push('setupCommunityGuide');
      assert.deepEqual(options, { mode: fixture.command.refresh.mode });
      return { channel: { toString: () => '<#guide>' }, message: { id: 'guide-message' } };
    },
    async setupRoadmapPanel() {
      delegation.push('setupRoadmapPanel');
      return { channel: { toString: () => '<#roadmap>' }, message: { id: 'roadmap-message' } };
    }
  };
  const loaded = loadCommandWithConcierge('../../src/legacy/commands/refresh-community-guide.js', runtime);
  try {
    const data = loaded.command.data.toJSON();
    assert.equal(data.name, fixture.command.refresh.name);
    assert.equal(data.options?.length || 0, fixture.command.refresh.optionCount);
    assert.equal(String(data.default_member_permissions), '16');
    assert.equal(hash(data.description), fixture.command.refresh.descriptionHash);
    const interaction = createInteraction();
    await loaded.command.execute(interaction);
    assert.deepEqual(interaction.calls.map((call) => call.name), ['deferReply', 'editReply']);
    assert.deepEqual(interaction.calls[0].payload, fixture.command.authorizationFailure.defer);
    assert.deepEqual(delegation, fixture.command.refresh.delegationOrder.slice(1, 3));
    assert.match(interaction.calls[1].payload, /<#guide>/);
    assert.match(interaction.calls[1].payload, /<#roadmap>/);

    const denied = createInteraction({ authorized: false });
    await loaded.command.execute(denied);
    assert.match(denied.calls[1].payload, new RegExp(fixture.command.authorizationFailure.editReplyContains));
    assert.equal(delegation.length, 2);

  } finally {
    loaded.restore();
  }

  const failingLoaded = loadCommandWithConcierge('../../src/legacy/commands/refresh-community-guide.js', {
    ...runtime,
    async setupCommunityGuide() { throw new Error('guide runtime failure'); }
  });
  try {
    const failing = createInteraction();
    await assert.rejects(() => failingLoaded.command.execute(failing), /guide runtime failure/);
    assert.deepEqual(failing.calls.map((call) => call.name), ['deferReply']);
  } finally {
    failingLoaded.restore();
  }
  console.log('Community Guide refresh command baseline tests passed.');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
