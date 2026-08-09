const assert = require('node:assert/strict');
const {
  createFakeCommunityRoadmapRuntimePersistenceRedirect
} = require('../../fakes/community/FakeCommunityRoadmapRuntimePersistenceRedirect');

const guild = { id: 'guild-1' };
const channel = { id: 'roadmap-channel-1' };
const editMessage = { id: 'roadmap-message-edit' };
const sendMessage = { id: 'roadmap-message-send' };

function legacyFlow(message, calls) {
  calls.push('mutation');
  calls.push('save');
  calls.push('return');
  return { channel, message };
}

function futureFlow(message, calls, result) {
  const redirect = createFakeCommunityRoadmapRuntimePersistenceRedirect({
    communityPublicationStateFeature: {
      persistCommunityPublicationRecord: {
        execute(input) {
          calls.push('persist');
          assert.deepEqual(input, {
            guildId: 'guild-1',
            patch: {
              roadmapChannelId: 'roadmap-channel-1',
              roadmapMessageId: message.id
            }
          });
          return result;
        }
      }
    }
  });
  calls.push('mutation');
  const returned = redirect.persistAfterRoadmapMutation({ guild, channel, message });
  calls.push('return');
  return returned;
}

for (const message of [editMessage, sendMessage]) {
  const legacyCalls = [];
  const futureCalls = [];
  const legacyResult = legacyFlow(message, legacyCalls);
  const futureResult = futureFlow(message, futureCalls, { persisted: true, record: { ignored: true } });
  assert.deepEqual(legacyCalls, ['mutation', 'save', 'return']);
  assert.deepEqual(futureCalls, ['mutation', 'persist', 'return']);
  assert.strictEqual(futureResult.channel, legacyResult.channel);
  assert.strictEqual(futureResult.message, legacyResult.message);
}

console.log('Roadmap runtime persistence redirect candidate preserves mutation-persist-return ordering.');
