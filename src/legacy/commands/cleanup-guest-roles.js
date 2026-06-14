const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  SlashCommandBuilder
} = require('discord.js');
const { buildGuestCleanupPlan, saveGuestCleanupPlan } = require('../../systems/roleManager');
const { safeDeferReply, safeEditReply } = require('../../utils/interactionReplies');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cleanup-guest-roles')
    .setDescription('清理已領正式身分組但仍保留訪客的成員')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addStringOption((option) =>
      option
        .setName('mode')
        .setDescription('preview 只預覽，execute 需確認後執行')
        .setRequired(true)
        .addChoices(
          { name: 'preview', value: 'preview' },
          { name: 'execute', value: 'execute' }
        )
    ),

  async execute(interaction) {
    await safeDeferReply(interaction, { ephemeral: true });

    try {
      if (!interaction.guild) {
        await safeEditReply(interaction, '這個指令只能在伺服器內使用。');
        return;
      }

      if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageRoles)) {
        await safeEditReply(interaction, '你需要 ManageRoles 權限才能清理訪客身分組。');
        return;
      }

      if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
        await safeEditReply(interaction, 'Bot 缺少 ManageRoles 權限，無法清理訪客身分組。');
        return;
      }

      const mode = interaction.options.getString('mode');
      const plan = await buildGuestCleanupPlan(interaction.guild);
      const preview = plan.candidates.slice(0, 15)
        .map((item) => `- ${item.displayName}：${item.formalRoles.join('、')}`)
        .join('\n') || '無';
      const skippedPreview = (plan.skipped || []).slice(0, 8)
        .map((item) => `- ${item.displayName}：${item.reason}`)
        .join('\n') || '無';

      const content =
        `訪客身分組清理預覽\n\n` +
        `會清理人數：${plan.candidates.length}\n` +
        `略過人數：${(plan.skipped || []).length}\n` +
        `警告：${plan.warnings.length ? plan.warnings.join('、') : '無'}\n\n` +
        `清單預覽：\n${preview}\n\n` +
        `略過預覽：\n${skippedPreview}`;

      if (mode === 'preview') {
        await safeEditReply(interaction, content);
        return;
      }

      const planId = saveGuestCleanupPlan({
        ...plan,
        requestedById: interaction.user.id,
        guildId: interaction.guild.id
      });
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`guest_cleanup_confirm_${planId}`)
          .setLabel('確認開始清理')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId(`guest_cleanup_cancel_${planId}`)
          .setLabel('取消')
          .setStyle(ButtonStyle.Secondary)
      );

      await safeEditReply(interaction, {
        content: `${content}\n\n按下「確認開始清理」後才會移除這些成員的「訪客」身分組。清理會自動排隊並避開 Discord API rate limit。`,
        components: [row]
      });
    } catch (error) {
      console.error('cleanup-guest-roles failed:', error);
      await safeEditReply(interaction, '⚠️ 執行失敗，請查看 console logs。');
    }
  }
};
