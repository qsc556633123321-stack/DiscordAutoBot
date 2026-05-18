const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { setupGameChannels } = require('../systems/gameChannels');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-game')
    .setDescription('建立遊戲專屬分類、文字頻道與建立語音入口')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addStringOption((option) =>
      option
        .setName('game')
        .setDescription('遊戲名稱，例如 APEX、特戰英豪、Minecraft、LOL')
        .setRequired(true)
        .setMaxLength(50)
    )
    .addStringOption((option) =>
      option
        .setName('short_name')
        .setDescription('短名稱，例如 apex、特戰、mc、lol')
        .setRequired(true)
        .setMaxLength(20)
    )
    .addBooleanOption((option) =>
      option
        .setName('create_default_channels')
        .setDescription('是否建立預設文字頻道，預設 true')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!interaction.guild) {
      await interaction.reply({ content: '這個指令只能在伺服器中使用。', ephemeral: true });
      return;
    }

    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.reply({ content: '你需要 ManageChannels 權限才能建立遊戲分區。', ephemeral: true });
      return;
    }

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.reply({ content: 'Bot 缺少 ManageChannels 權限，無法建立遊戲分區。', ephemeral: true });
      return;
    }

    const game = interaction.options.getString('game');
    const shortName = interaction.options.getString('short_name');
    const createDefaultChannels = interaction.options.getBoolean('create_default_channels') ?? true;

    await interaction.deferReply({ ephemeral: true });

    try {
      const result = await setupGameChannels(interaction.guild, {
        game,
        shortName,
        createDefaultChannels
      });

      await interaction.editReply(
        `遊戲分區已準備完成：${result.category}\n` +
        `本次新建立：${result.created.length ? result.created.join('、') : '無，皆已存在'}`
      );
    } catch (error) {
      console.error('建立遊戲分區失敗：', error);
      await interaction.editReply('建立遊戲分區失敗。請確認 Bot 具有 ManageChannels、View Channels、Connect、Move Members 權限。');
    }
  }
};
