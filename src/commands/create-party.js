const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { buildTempVoiceControlPayload, createTemporaryVoice } = require('../systems/tempVoice');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('create-party')
    .setDescription('建立臨時組隊語音房')
    .addStringOption((option) =>
      option
        .setName('game')
        .setDescription('遊戲名稱，例如 APEX、聯盟戰棋、Minecraft、LOL')
        .setRequired(true)
        .setMaxLength(50)
    )
    .addStringOption((option) =>
      option
        .setName('name')
        .setDescription('隊伍名稱，可選')
        .setRequired(false)
        .setMaxLength(50)
    )
    .addIntegerOption((option) =>
      option
        .setName('limit')
        .setDescription('人數上限，預設 5')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(99)
    ),

  async execute(interaction) {
    if (!interaction.guild) {
      await interaction.reply({ content: '這個指令只能在伺服器內使用。', ephemeral: true });
      return;
    }

    const botMember = interaction.guild.members.me;
    if (
      !botMember.permissions.has(PermissionFlagsBits.ManageChannels) ||
      !botMember.permissions.has(PermissionFlagsBits.MoveMembers)
    ) {
      await interaction.reply({
        content: 'Bot 需要 ManageChannels 與 MoveMembers 權限，才能建立並移動臨時語音房。',
        ephemeral: true
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      const game = interaction.options.getString('game');
      const name = interaction.options.getString('name');
      const limit = interaction.options.getInteger('limit') || 5;
      const channel = await createTemporaryVoice({
        guild: interaction.guild,
        member: interaction.member,
        game,
        name,
        limit
      });

      let moved = false;
      if (interaction.member.voice.channel) {
        try {
          await interaction.member.voice.setChannel(channel, 'Move member to temporary party voice');
          moved = true;
        } catch (error) {
          console.error('移動使用者到臨時語音失敗:', error);
        }
      }

      const panel = buildTempVoiceControlPayload(channel);
      await interaction.editReply({
        content: moved
          ? `已建立臨時語音房 ${channel}，並已將你移入。`
          : `已建立臨時語音房 ${channel}。你目前不在語音中，請自行加入。`,
        ...(panel || {})
      });
    } catch (error) {
      console.error('建立臨時語音房失敗:', error);
      await interaction.editReply(`建立臨時語音房失敗：${error.message}`);
    }
  }
};
