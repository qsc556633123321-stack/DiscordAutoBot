const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { PermissionFlagsBits } = require('discord.js');
const legacy = require('../../src/legacy/commands/memory-list');
const presentation = require('../../src/presentation/commands/memoryListCommand');

function createInteraction({ guild = { id: 'guild-1' }, canManage = true } = {}) {
  const calls = [];
  return {
    calls,
    guild,
    memberPermissions: { has: (permission) => permission === PermissionFlagsBits.ManageChannels && canManage },
    reply: async (payload) => calls.push(payload)
  };
}

function embedPayload(call) {
  return call.embeds[0].toJSON();
}

async function main() {
  const useCaseSource = fs.readFileSync(path.join(__dirname, '..', '..', 'src', 'application', 'memory', 'listChannelRulesUseCase.js'), 'utf8');
  assert.equal(useCaseSource.includes('serverMemoryReadGateway'), false);
  assert.equal(useCaseSource.includes('systems/serverMemory'), false);
  const rules = [{ keyword: 'game', category: 'games', weight: 5 }];
  const command = presentation.createMemoryListCommand({
    useCase: { execute: () => rules },
    logger: { error: () => {} }
  });

  const success = createInteraction();
  await command.execute(success);
  const successEmbed = embedPayload(success.calls[0]);
  assert.equal(success.calls[0].ephemeral, true);
  assert.equal(successEmbed.title, '伺服器記憶規則');
  assert.match(successEmbed.description, /game/);
  assert.match(successEmbed.description, /games/);

  const denied = createInteraction({ canManage: false });
  await command.execute(denied);
  assert.deepEqual(denied.calls, [{ content: '你需要 ManageChannels 權限才能查看記憶規則。', ephemeral: true }]);

  const noGuild = createInteraction({ guild: null });
  await command.execute(noGuild);
  assert.deepEqual(noGuild.calls, [{ content: '這個指令只能在伺服器中使用。', ephemeral: true }]);

  const failed = presentation.createMemoryListCommand({
    useCase: { execute: () => { throw new Error('read failed'); } },
    logger: { error: () => {} }
  });
  const failedInteraction = createInteraction();
  await failed.execute(failedInteraction);
  assert.deepEqual(failedInteraction.calls, [{ content: '讀取記憶規則失敗：read failed', ephemeral: true }]);

  assert.equal(legacy.execute, presentation.execute);
  assert.deepEqual(legacy.data.toJSON(), presentation.data.toJSON());
  console.log('memory-list migration regression tests passed.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
