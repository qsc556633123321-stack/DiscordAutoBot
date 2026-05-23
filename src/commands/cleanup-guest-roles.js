const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  SlashCommandBuilder
} = require('discord.js');
const { buildGuestCleanupPlan } = require('../systems/roleManager');

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
    if (!interaction.guild) {
      await interaction.reply({ content: '這個指令只能在伺服器內使用。', ephemeral: true });
      return;
    }

    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageRoles)) {
      await interaction.reply({ content: '你需要 ManageRoles 權限才能清理訪客身分組。', ephemeral: true });
      return;
    }

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
      await interaction.reply({ content: 'Bot 缺少 ManageRoles 權限，無法清理訪客身分組。', ephemeral: true });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      const mode = interaction.options.getString('mode');
      const plan = await buildGuestCleanupPlan(interaction.guild);
      const preview = plan.candidates.slice(0, 15)
        .map((item) => `- ${item.displayName}：${item.formalRoles.join('、')}`)
        .join('\n') || '無';

      const content =
        `訪客身分組清理預覽\n\n` +
        `會清理人數：${plan.candidates.length}\n` +
        `警告：${plan.warnings.length ? plan.warnings.join('、') : '無'}\n\n` +
        `清單預覽：\n${preview}`;

      if (mode === 'preview') {
        await interaction.editReply(content);
        return;
      }

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`guest_cleanup_confirm_${interaction.user.id}`)
          .setLabel('確認清理訪客')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId(`guest_cleanup_cancel_${interaction.user.id}`)
          .setLabel('取消')
          .setStyle(ButtonStyle.Secondary)
      );

      await interaction.editReply({
        content: `${content}\n\n按下確認後才會移除這些成員的「訪客」身分組。`,
        components: [row]
      });
    } catch (error) {
      console.error('cleanup-guest-roles failed:', error);
      await interaction.editReply(`產生訪客清理計畫失敗：${error.message}`);
    }
  }
};
