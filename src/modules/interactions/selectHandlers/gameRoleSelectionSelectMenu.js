const { MessageFlags } = require('discord.js');
const { createGameRoleSelectionFeature } = require('../../../composition/gameRoleSelectionFeature');
const { GAME_ROLE_SELECTION_CUSTOM_ID, renderGameRoleSelectionResult } = require('../../../presentation/games/gameRoleSelectionRenderer');
const { deferIfNeeded, safeEditReply } = require('../interactionResponder');

function matches(customId) { return customId === GAME_ROLE_SELECTION_CUSTOM_ID; }

async function handle(interaction) {
  await deferIfNeeded(interaction, { flags: MessageFlags.Ephemeral });
  if (!interaction.guild || !interaction.user) return safeEditReply(interaction, '這個選單只能在伺服器內使用。');
  const feature = createGameRoleSelectionFeature({
    resolveGuild: async (guildId) => guildId === interaction.guild.id ? interaction.guild : null,
    resolveMember: async ({ guild, memberId }) => memberId === interaction.user.id ? interaction.member || guild?.members?.fetch?.(memberId) : null
  });
  const result = await feature.gameRoleSelection.execute({ guildId: interaction.guild.id, memberId: interaction.user.id, selectedGameIds: interaction.values || [] });
  return safeEditReply(interaction, renderGameRoleSelectionResult(result));
}

module.exports = { handle, matches };
