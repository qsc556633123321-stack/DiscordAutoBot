const { ChannelType, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { setupVoiceHub } = require('../../services/voice/voiceHubService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-voicehub')
    .setDescription('建立或指定目前語音房狀態頻道')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('指定 Voice Hub 文字頻道，留空則建立 🎮｜目前語音房')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    )
    .addBooleanOption((option) =>
      option
        .setName('auto_update')
        .setDescription('是否自動更新 Voice Hub，預設 true')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!interaction.guild) {
      await interaction.reply({ content: '這個指令只能在伺服器內使用。', ephemeral: true });
      return;
    }

    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.reply({ content: '你需要 ManageChannels 權限才能設定 Voice Hub。', ephemeral: true });
      return;
    }

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.reply({ content: 'Bot 缺少 ManageChannels 權限，無法建立 Voice Hub 頻道。', ephemeral: true });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      const channel = interaction.options.getChannel('channel');
      const autoUpdate = interaction.options.getBoolean('auto_update') ?? true;
      const config = await setupVoiceHub(interaction.guild, { channel, autoUpdate });
      const hubChannel = interaction.guild.channels.cache.get(config.channelId);

      const embed = new EmbedBuilder()
        .setColor(0x57f287)
        .setTitle('Voice Hub 已設定')
        .setDescription(`目前語音房頻道：${hubChannel || config.channelId}\nauto_update：${config.autoUpdate}`)
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('設定 Voice Hub 失敗:', error);
      await interaction.editReply(`設定 Voice Hub 失敗：${error.message}`);
    }
  }
};
