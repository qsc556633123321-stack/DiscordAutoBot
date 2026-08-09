const assert = require('node:assert/strict');
const { createGuild, createMessage, createTextChannel, withOnboardingFile } = require('../../helpers/createCommunityGuideMutationHarness');

async function withMutationPair(run, failures = {}) {
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
                if (Object.hasOwn(failures, 'edit')) {
                  failure = { hasFailure: true, failure: failures.edit };
                  return { kind: 'Failure', failureKind: 'EditRejected' };
                }
                try {
                  await retainedMessage.edit(request.payload);
                  return { kind: 'EditSuccess', messageId: request.messageId };
                } catch (error) {
                  failure = { hasFailure: true, failure: error };
                  return { kind: 'Failure', failureKind: 'EditRejected' };
                }
              },
              async send(request) {
                calls.push({ operation: 'send', request });
                if (Object.hasOwn(failures, 'send')) {
                  failure = { hasFailure: true, failure: failures.send };
                  return { kind: 'Failure', failureKind: 'SendRejected' };
                }
                try {
                  retainedMessage = await ensuredChannel.send(request.payload);
                  return { kind: 'SendSuccess', messageId: retainedMessage.id };
                } catch (error) {
                  failure = { hasFailure: true, failure: error };
                  return { kind: 'Failure', failureKind: 'SendRejected' };
                }
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

async function runSetup({ trackedMessageId, existingMessage, failures }) {
  return withMutationPair(({ concierge, calls }) => withOnboardingFile({ initial: { 'guild-1': { guideMessageId: trackedMessageId } } }, async ({ log }) => {
    const guide = createTextChannel({
      id: 'guide-channel', name: concierge.GUIDE_CHANNEL_NAME, parentId: 'category-existing', log,
      behavior: { existingMessage }
    });
    const guild = createGuild({ guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME, log, behavior: { categoryExists: true }, existingGuide: guide });
    return { result: await concierge.setupCommunityGuide(guild), calls, log };
  }), failures);
}

(async () => {
  const tracked = createMessage('tracked', { calls: [] });
  const edit = await runSetup({ trackedMessageId: 'tracked', existingMessage: tracked });
  assert.equal(edit.calls.length, 1);
  assert.equal(edit.calls[0].operation, 'edit');
  assert.equal(edit.calls[0].request.messageId, 'tracked');
  assert.equal(edit.result.message, tracked);

  const send = await runSetup({ trackedMessageId: null, existingMessage: null });
  assert.equal(send.calls.length, 1);
  assert.equal(send.calls[0].operation, 'send');
  assert.equal(send.result.message.id, 'guide-channel-sent');

  const editFailure = new Error('frozen edit rejection');
  let editReason;
  try {
    await runSetup({ trackedMessageId: 'tracked', existingMessage: createMessage('tracked', { calls: [] }), failures: { edit: editFailure } });
  } catch (error) {
    editReason = error;
  }
  assert.equal(editReason, editFailure);

  let sendRejected = false;
  let sendReason = 'not-run';
  try {
    await runSetup({ trackedMessageId: null, existingMessage: null, failures: { send: undefined } });
  } catch (error) {
    sendRejected = true;
    sendReason = error;
  }
  assert.equal(sendRejected, true);
  assert.equal(sendReason, undefined);
  console.log('Community guide runtime mutation redirect implementation passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
