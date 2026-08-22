const { MessageFlags, SlashCommandBuilder } = require('discord.js');
const { createGameRoleSelectionFeature } = require('../../composition/gameRoleSelectionFeature');
const { renderGameRoleSelector } = require('../games/gameRoleSelectionRenderer');

const data = new SlashCommandBuilder().setName('game-role-selection').setDescription('Open your game role selector.');

function resolvers(interaction) {
  return {
    resolveGuild: async (guildId) => guildId === interaction.guild?.id ? interaction.guild : null,
    resolveMember: async ({ guild, memberId }) => memberId === interaction.user?.id ? interaction.member || guild?.members?.fetch?.(memberId) : null
  };
}

function createGameRoleSelectionCommand({ createFeature = createGameRoleSelectionFeature, renderSelector = renderGameRoleSelector } = {}) {
  return { data, async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    if (!interaction.guild || !interaction.user) return interaction.editReply('這個指令只能在伺服器內使用。');
    const state = await createFeature(resolvers(interaction)).gameRoleSelection.getSelectionState({ guildId: interaction.guild.id, memberId: interaction.user.id });
    if (!state.hasParentGameRole) return interaction.editReply('請先選擇「🎮 遊戲玩家」。');
    return interaction.editReply(renderSelector(state));
  } };
}

const command = createGameRoleSelectionCommand();
module.exports = { ...command, createGameRoleSelectionCommand, resolvers };
