const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const gameCategoryService = require('../../services/games/gameCategoryService');

function formatList(items, emptyText = '無') {
  return items.length ? items.map((item) => `- ${item}`).join('\n') : emptyText;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-game')
    .setDescription('建立指定遊戲的分類、文字頻道與組隊語音觸發頻道')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addStringOption((option) =>
      option
        .setName('game')
        .setDescription('遊戲名稱，例如 APEX、聯盟戰棋、Minecraft、LOL')
        .setRequired(true)
        .setMaxLength(50)
    )
    .addStringOption((option) =>
      option
        .setName('short_name')
        .setDescription('頻道短名稱，例如 apex、tft、mc、lol')
        .setRequired(true)
        .setMaxLength(20)
    )
    .addBooleanOption((option) =>
      option
        .setName('create_default_channels')
        .setDescription('是否建立預設頻道，預設 true')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!interaction.guild) {
      await interaction.reply({ content: '這個指令只能在伺服器內使用。', ephemeral: true });
      return;
    }

    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.reply({ content: '你需要 ManageChannels 權限才能建立遊戲分區。', ephemeral: true });
      return;
    }

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.reply({ content: 'Bot 缺少 ManageChannels 權限，無法建立或移動頻道。', ephemeral: true });
      return;
    }

    const game = interaction.options.getString('game');
    const shortName = interaction.options.getString('short_name');
    const createDefaultChannels = interaction.options.getBoolean('create_default_channels') ?? true;

    await interaction.deferReply({ ephemeral: true });

    try {
      const serviceResult = await gameCategoryService.setup(interaction.guild, {
        game,
        shortName,
        createDefaultChannels
      });
      if (!serviceResult.ok) throw new Error(serviceResult.error.message);
      const result = serviceResult.data;

      const warningText = result.orderingWarnings.length
        ? `\n\n排序提醒：\n${formatList(result.orderingWarnings)}`
        : '';

      await interaction.editReply(
        `已完成遊戲分區：${result.category.name}\n\n` +
        `新建立：\n${formatList(result.created)}\n\n` +
        `已存在：\n${formatList(result.existing)}\n\n` +
        `已移動：\n${formatList(result.moved)}` +
        warningText
      );
    } catch (error) {
      console.error('setup-game failed:', error);
      await interaction.editReply(
        `建立遊戲分區失敗：${error.message || '請確認 Bot 是否具備 ManageChannels、View Channels、Connect 權限。'}`
      );
    }
  }
};
