const assert = require('node:assert/strict');
const fixture = require('../fixtures/communityGuideMutationLegacyBaseline');
const { createInteraction, hash, loadCommandWithConcierge } = require('./communityGuideCommandTestHelper');

async function main() {
  const delegation = [];
  const runtime = {
    NATIVE_ONBOARDING_RECOMMENDATIONS: ['one', 'two'],
    async setupCommunityGuide(_guild, options) {
      delegation.push('setupCommunityGuide');
      assert.deepEqual(options, { mode: fixture.command.setup.mode });
      return { channel: { toString: () => '<#guide>' }, message: { id: 'guide-message' } };
    },
    async setupRoadmapPanel() {
      delegation.push('setupRoadmapPanel');
      return { channel: { toString: () => '<#roadmap>' }, message: { id: 'roadmap-message' } };
    }
  };
  const loaded = loadCommandWithConcierge('../../src/legacy/commands/setup-community-guide.js', runtime);
  try {
    const data = loaded.command.data.toJSON();
    assert.equal(data.name, fixture.command.setup.name);
    assert.equal(data.options?.length || 0, fixture.command.setup.optionCount);
    assert.equal(String(data.default_member_permissions), '16');
    assert.equal(hash(data.description), fixture.command.setup.descriptionHash);

    const interaction = createInteraction();
    await loaded.command.execute(interaction);
    assert.deepEqual(interaction.calls.map((call) => call.name), ['deferReply', 'editReply']);
    assert.deepEqual(interaction.calls[0].payload, fixture.command.authorizationFailure.defer);
    assert.deepEqual(delegation, fixture.command.setup.delegationOrder.slice(1, 3));
    assert.equal(typeof interaction.calls[1].payload, 'string');
    assert.match(interaction.calls[1].payload, /<#guide>/);
    assert.match(interaction.calls[1].payload, /<#roadmap>/);

    const denied = createInteraction({ authorized: false });
    await loaded.command.execute(denied);
    assert.deepEqual(denied.calls.map((call) => call.name), ['deferReply', 'editReply']);
    assert.match(denied.calls[1].payload, new RegExp(fixture.command.authorizationFailure.editReplyContains));
    assert.equal(delegation.length, 2, 'authorization failure must not delegate to mutations');

  } finally {
    loaded.restore();
  }

  const failingLoaded = loadCommandWithConcierge('../../src/legacy/commands/setup-community-guide.js', {
    ...runtime,
    async setupRoadmapPanel() { throw new Error('roadmap runtime failure'); }
  });
  try {
    const failing = createInteraction();
    await assert.rejects(() => failingLoaded.command.execute(failing), /roadmap runtime failure/);
    assert.deepEqual(failing.calls.map((call) => call.name), ['deferReply']);
  } finally {
    failingLoaded.restore();
  }
  console.log('Community Guide setup command baseline tests passed.');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
