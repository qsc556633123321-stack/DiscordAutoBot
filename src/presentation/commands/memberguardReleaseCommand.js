const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { createMemberGuardFeature } = require('../../composition/memberGuardFeature');
const { MEMBER_GUARD_ROLE_NAMES } = require('../../domain/memberGuard/memberGuardPolicy');
const interactionReplies = require('../../utils/interactionReplies');

const data = new SlashCommandBuilder().setName('memberguard-release').setDescription('手動解除成員的訪客限制').setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addUserOption((option) => option.setName('user').setDescription('要解除限制的使用者').setRequired(true));

function createMemberguardReleaseCommand({ feature = createMemberGuardFeature(), responder = interactionReplies, logger = console } = {}) {
  return { data, async execute(interaction) {
    await responder.safeDeferReply(interaction, { ephemeral: true });
    try {
      if (!interaction.guild) return responder.safeEditReply(interaction, '這個指令只能在伺服器內使用。');
      if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) return responder.safeEditReply(interaction, '你需要 ManageGuild 權限才能解除 Member Guard 限制。');
      const user = interaction.options.getUser('user', true);
      const guestRole = interaction.guild.roles.cache.find((role) => role.name === MEMBER_GUARD_ROLE_NAMES.guest) || null;
      const memberRole = interaction.guild.roles.cache.find((role) => role.name === MEMBER_GUARD_ROLE_NAMES.formalMember) || null;
      const plan = feature.releaseMember.execute({ guildId: interaction.guild.id, memberId: user.id, guestRoleId: guestRole?.id || null, memberRoleId: memberRole?.id || null, actorFacts: { memberId: interaction.user?.id } });
      if (!plan.allowed) return responder.safeEditReply(interaction, '找不到可用的訪客或正式成員身分組，無法解除限制。');
      const result = await feature.createMutationGateways({ resolveGuild: async (guildId) => guildId === interaction.guild.id ? interaction.guild : null, logger }).memberRoleGateway.releaseMember({ guildId: interaction.guild.id, memberId: user.id, removeRoleIds: plan.removeRoleIds, addRoleIds: plan.addRoleIds });
      if (result.failed.length) return responder.safeEditReply(interaction, `已部分解除 ${user} 的訪客限制：成功 ${result.removed.length + result.added.length}，失敗 ${result.failed.length}。`);
      return responder.safeEditReply(interaction, `已解除 ${user} 的訪客限制。`);
    } catch (error) { logger.error('memberguard-release failed:', error); return responder.safeEditReply(interaction, '執行失敗，請查看 console logs。'); }
  } };
}

const command = createMemberguardReleaseCommand();
module.exports = { ...command, createMemberguardReleaseCommand };
