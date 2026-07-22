const assert = require('node:assert/strict');
const { createCheckOnboardingVisibilityUseCase } = require('../../src/application/community/checkOnboardingVisibilityUseCase');
const presentation = require('../../src/presentation/commands/checkOnboardingVisibilityCommand');
const legacyCommand = require('../../src/legacy/commands/check-onboarding-visibility');

const NO_PERMISSION_MESSAGE = '你需要 ManageChannels 權限才能檢查 onboarding visibility。';

function createInteraction({ canManageChannels, guild = { id: 'guild-1' } }) {
  const calls = [];
  return {
    calls,
    guild,
    memberPermissions: { has: () => canManageChannels },
    deferReply: async (payload) => calls.push(['deferReply', payload]),
    editReply: async (payload) => calls.push(['editReply', payload])
  };
}

async function legacyBaseline(interaction, permissions) {
  await interaction.deferReply({ ephemeral: true });
  if (!interaction.memberPermissions.has()) {
    await interaction.editReply(NO_PERMISSION_MESSAGE);
    return;
  }
  const result = permissions.inspectOnboarding(interaction.guild);
  await interaction.editReply(result.ok
    ? { embeds: [permissions.buildOnboardingEmbed(result.data)] }
    : result.error.message);
}

function commandWith(permissions) {
  const useCase = createCheckOnboardingVisibilityUseCase({ permissions });
  return presentation.createCheckOnboardingVisibilityCommand({ useCase });
}

async function assertSameBehavior({ canManageChannels, permissions }) {
  const legacyInteraction = createInteraction({ canManageChannels });
  const migratedInteraction = createInteraction({ canManageChannels });
  await legacyBaseline(legacyInteraction, permissions);
  await commandWith(permissions).execute(migratedInteraction);
  assert.deepEqual(migratedInteraction.calls, legacyInteraction.calls);
}

async function main() {
  const report = { visible: ['entry'], warnings: [] };
  const success = {
    inspectOnboarding: () => ({ ok: true, data: report }),
    buildOnboardingEmbed: (data) => ({ title: 'Onboarding', data })
  };
  await assertSameBehavior({ canManageChannels: false, permissions: success });
  await assertSameBehavior({ canManageChannels: true, permissions: success });
  await assertSameBehavior({
    canManageChannels: true,
    permissions: {
      ...success,
      inspectOnboarding: () => ({ ok: false, error: { message: 'inspection failed' } })
    }
  });

  assert.equal(legacyCommand.execute, presentation.execute);
  assert.deepEqual(legacyCommand.data.toJSON(), presentation.data.toJSON());
  console.log('check-onboarding-visibility migration regression tests passed.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
