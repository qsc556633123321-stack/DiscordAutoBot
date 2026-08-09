const assert = require('node:assert/strict');
const { createGuild, createMessage, createTextChannel, withOnboardingFile } = require('../../helpers/createCommunityGuideMutationHarness');

async function withMutationPair(run, outcomes = {}) {
  const featurePath = require.resolve('../../../src/composition/communityGuideAdapterPairFeature');
  const runtimePath = require.resolve('../../../src/systems/communityConcierge');
  const originalFeature = require(featurePath);
  const calls = [];

  require.cache[featurePath].exports = {
    createCommunityGuideAdapterPairFeature() {
      return {
        createAdapterPair({ ensuredChannel }) {
          let retainedMessage = null;
          let failure = { hasFailure: false };
          const reject = (operation, result) => {
            const configured = outcomes[operation];
            if (configured?.resultOnly) return configured.result;
            if (Object.hasOwn(outcomes, operation)) {
              failure = { hasFailure: true, failure: configured };
              return { kind: 'Failure', failureKind: `${operation}Rejected` };
            }
            return null;
          };
          return {
            lookupPort: {
              async lookup({ messageId }) {
                try {
                  retainedMessage = await ensuredChannel.messages.fetch(messageId);
                  return { status: retainedMessage ? 'MessageAvailable' : 'MessageUnavailable', messageId };
                } catch (_) {
                  retainedMessage = null;
                  return { status: 'MessageUnavailable', messageId };
                }
              }
            },
            mutationPort: {
              async edit(request) {
                calls.push({ operation: 'edit', request });
                const rejection = reject('edit');
                if (rejection) return rejection;
                await retainedMessage.edit(request.payload);
                return { kind: 'EditSuccess', messageId: request.messageId };
              },
              async send(request) {
                calls.push({ operation: 'send', request });
                const rejection = reject('send');
                if (rejection) return rejection;
                retainedMessage = await ensuredChannel.send(request.payload);
                return { kind: 'SendSuccess', messageId: retainedMessage.id };
              }
            },
            getRetainedMessage() { return retainedMessage; },
            getRetainedMutationFailure() { return failure; }
          };
        }
      };
    }
  };
  delete require.cache[runtimePath];
  try {
    return await run({ concierge: require(runtimePath), calls });
  } finally {
    delete require.cache[runtimePath];
    require.cache[featurePath].exports = originalFeature;
  }
}

async function captureSetup({ trackedMessageId, outcomes = {} }) {
  return withMutationPair(({ concierge, calls }) => withOnboardingFile({
    initial: { 'guild-1': { guideMessageId: trackedMessageId } }
  }, async ({ log }) => {
    const tracked = trackedMessageId ? createMessage(trackedMessageId, log) : null;
    const guide = createTextChannel({
      id: 'guide-channel', name: concierge.GUIDE_CHANNEL_NAME, parentId: 'category-existing', log,
      behavior: { existingMessage: tracked }, label: 'guide'
    });
    const guild = createGuild({
      guideName: concierge.GUIDE_CHANNEL_NAME,
      roadmapName: concierge.ROADMAP_CHANNEL_NAME,
      log,
      behavior: { categoryExists: true },
      existingGuide: guide
    });
    try {
      return { result: await concierge.setupCommunityGuide(guild), calls, log, threw: false };
    } catch (error) {
      return { error, calls, log, threw: true };
    }
  }), outcomes);
}

function assertNoPostMutationWrites(result) {
  assert.equal(result.log.writes, 0);
  assert.equal(result.log.calls.some((call) => call.startsWith('roadmap.')), false);
}

(async () => {
  const edit = await captureSetup({ trackedMessageId: 'tracked' });
  assert.equal(edit.threw, false);
  assert.equal(edit.calls.length, 1);
  assert.deepEqual(Object.keys(edit.calls[0].request).sort(), ['channelId', 'guildId', 'messageId', 'payload']);
  assert.equal(edit.calls[0].operation, 'edit');
  assert.equal(edit.calls[0].request.messageId, 'tracked');
  assert.equal(edit.result.message.id, 'tracked');
  assert.equal(edit.log.calls.filter((call) => call === 'guide.message.fetch').length, 1);
  assert.equal(edit.log.writes, 1);

  const send = await captureSetup({ trackedMessageId: null });
  assert.equal(send.threw, false);
  assert.equal(send.calls.length, 1);
  assert.deepEqual(Object.keys(send.calls[0].request).sort(), ['channelId', 'guildId', 'payload']);
  assert.equal(send.calls[0].operation, 'send');
  assert.equal(send.result.message.id, 'guide-channel-sent');
  assert.equal(send.log.calls.filter((call) => call === 'guide.message.fetch').length, 0);
  assert.equal(send.log.writes, 1);

  const rejectionCases = [
    ['edit', new Error('frozen edit rejection')],
    ['send', new Error('frozen send rejection')],
    ['edit', 'string rejection'],
    ['send', 42],
    ['edit', { reason: 'object rejection' }],
    ['send', null],
    ['edit', undefined],
    ['send', undefined]
  ];
  for (const [operation, expected] of rejectionCases) {
    const result = await captureSetup({
      trackedMessageId: operation === 'edit' ? 'tracked' : null,
      outcomes: { [operation]: expected }
    });
    assert.equal(result.threw, true, `${operation} should reject`);
    assert.equal(result.error, expected, `${operation} preserves raw rejection identity`);
    assert.equal(result.calls.length, 1, `${operation} performs exactly one mutation request`);
    assert.equal(result.calls[0].operation, operation);
    assertNoPostMutationWrites(result);
  }

  for (const [operation, failureKind] of [['edit', 'MissingResource'], ['send', 'Unknown']]) {
    const result = await captureSetup({
      trackedMessageId: operation === 'edit' ? 'tracked' : null,
      outcomes: { [operation]: { resultOnly: true, result: { kind: 'Failure', failureKind } } }
    });
    assert.equal(result.threw, true);
    assert.match(result.error.message, new RegExp(`${operation} mutation failed: Failure/${failureKind}`));
    assertNoPostMutationWrites(result);
  }

  console.log('Community guide runtime mutation redirect implementation passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
