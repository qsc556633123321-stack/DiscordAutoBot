const assert = require('node:assert/strict');
const legacy = require('../../src/legacy/commands/memberguard-status');
const presentation = require('../../src/presentation/commands/memberGuardStatusCommand');

function createResponder(calls) {
  return {
    safeDeferReply: async (_interaction, payload) => calls.push(['deferReply', payload]),
    safeEditReply: async (_interaction, payload) => calls.push(['editReply', payload])
  };
}

async function main() {
  const service = {
    getMemberGuardSettings: () => ({ enabled: true, safeMode: false, newAccountDays: 7 }),
    getRecentJoinCount: () => 2,
    getRecentBlockedCount: () => 1
  };
  const calls = [];
  const command = presentation.createMemberGuardStatusCommand({
    useCase: {
      execute: ({ guildId }) => ({
        enabled: service.getMemberGuardSettings(guildId).enabled,
        safeMode: service.getMemberGuardSettings(guildId).safeMode,
        newAccountDays: service.getMemberGuardSettings(guildId).newAccountDays,
        recentJoinCount: service.getRecentJoinCount(guildId),
        recentBlockedCount: service.getRecentBlockedCount(guildId)
      })
    },
    responder: createResponder(calls),
    logger: { error: () => {} }
  });
  await command.execute({ guild: { id: 'guild-1' } });
  assert.deepEqual(calls, [
    ['deferReply', { ephemeral: true }],
    ['editReply', 'Member Guard 狀態\n\n啟用：true\nsafe_mode：false\n新帳號限制天數：7\n最近 10 分鐘加入人數：2\n最近 10 分鐘阻擋次數：1']
  ]);

  const noGuildCalls = [];
  const noGuildCommand = presentation.createMemberGuardStatusCommand({
    useCase: { execute: () => ({}) }, responder: createResponder(noGuildCalls), logger: { error: () => {} }
  });
  await noGuildCommand.execute({ guild: null });
  assert.deepEqual(noGuildCalls, [
    ['deferReply', { ephemeral: true }],
    ['editReply', '這個指令只能在伺服器內使用。']
  ]);

  assert.equal(legacy.execute, presentation.execute);
  assert.deepEqual(legacy.data.toJSON(), presentation.data.toJSON());
  console.log('memberguard-status migration regression tests passed.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
