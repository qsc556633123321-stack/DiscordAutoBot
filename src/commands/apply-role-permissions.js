const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  SlashCommandBuilder
} = require('discord.js');
const {
  buildPermissionPlan,
  buildRolePermissionEmbed,
  saveRolePermissionPlan
} = require('../systems/rolePermissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('apply-role-permissions')
    .setDescription('預覽或套用身分組與頻道分類可見性')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addStringOption((option) =>
      option
        .setName('mode')
        .setDescription('preview 只預覽；execute 需要按鈕確認')
        .setRequired(true)
        .addChoices(
          { name: 'preview', value: 'preview' },
          { name: 'execute', value: 'execute' }
        )
    ),

  async execute(interaction) {
    if (!interaction.guild) {
      await interaction.reply({ content: '這個指令只能在伺服器中使用。', ephemeral: true });
      return;
    }

    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.reply({ content: '你需要 ManageChannels 權限才能套用頻道權限。', ephemeral: true });
      return;
    }

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.reply({ content: 'Bot 缺少 ManageChannels 權限，無法修改分類權限。', ephemeral: true });
      return;
    }

    const mode = interaction.options.getString('mode');
    const plan = buildPermissionPlan(interaction.guild, interaction.user.id);
    plan.mode = mode;
    saveRolePermissionPlan(interaction.id, plan);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`roleperm_confirm_${interaction.id}`)
        .setLabel('確認套用權限')
        .setStyle(ButtonStyle.Danger)
        .setDisabled(mode !== 'execute'),
      new ButtonBuilder()
        .setCustomId(`roleperm_cancel_${interaction.id}`)
        .setLabel('取消')
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({
      embeds: [buildRolePermissionEmbed(plan)],
      components: [row],
      ephemeral: true
    });
  }
};
