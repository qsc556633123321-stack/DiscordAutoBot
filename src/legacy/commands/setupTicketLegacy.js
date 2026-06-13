const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder
} = require('discord.js');

const TICKET_CATEGORY_NAME = '🎫｜客服支援';
const TICKET_PANEL_CHANNEL_NAME = '🎟｜開啟客服單';
const TICKET_LOG_CHANNEL_NAME = '📑｜ticket-logs';
const CREATE_TICKET_BUTTON_ID = 'ticket:create';

function findRole(guild, name) {
  return guild.roles.cache.find((role) => role.name === name);
}

function buildSupportOverwrites(guild) {
  const ownerRole = findRole(guild, '站長');
  const adminRole = findRole(guild, '管理員');
  const overwrites = [
    {
      id: guild.roles.everyone.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.ReadMessageHistory
      ],
      deny: [PermissionFlagsBits.SendMessages]
    }
  ];

  for (const role of [ownerRole, adminRole].filter(Boolean)) {
    overwrites.push({
      id: role.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.ManageMessages
      ]
    });
  }

  return overwrites;
}

function buildLogOverwrites(guild) {
  const ownerRole = findRole(guild, '站長');
  const adminRole = findRole(guild, '管理員');
  const overwrites = [
    {
      id: guild.roles.everyone.id,
      deny: [PermissionFlagsBits.ViewChannel]
    }
  ];

  for (const role of [ownerRole, adminRole].filter(Boolean)) {
    overwrites.push({
      id: role.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.SendMessages
      ]
    });
  }

  return overwrites;
}

async function findOrCreateCategory(guild) {
  const existing = guild.channels.cache.find(
    (channel) => channel.type === ChannelType.GuildCategory && channel.name === TICKET_CATEGORY_NAME
  );
  if (existing) return existing;

  return guild.channels.create({
    name: TICKET_CATEGORY_NAME,
    type: ChannelType.GuildCategory,
    reason: 'Ticket system setup'
  });
}

async function findOrCreateTextChannel(guild, name, parent, permissionOverwrites, topic) {
  const existing = guild.channels.cache.find(
    (channel) => channel.type === ChannelType.GuildText && channel.name === name
  );
  if (existing) return existing;

  return guild.channels.create({
    name,
    type: ChannelType.GuildText,
    parent: parent.id,
    topic,
    permissionOverwrites,
    reason: 'Ticket system setup'
  });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-ticket')
    .setDescription('建立客服 Ticket 系統')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    if (!interaction.guild) {
      await interaction.reply({ content: '這個指令只能在伺服器中使用。', ephemeral: true });
      return;
    }

    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild)) {
      await interaction.reply({ content: '你需要 ManageGuild 權限才能設定 Ticket 系統。', ephemeral: true });
      return;
    }

    const botMember = interaction.guild.members.me;
    if (!botMember.permissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.reply({
        content: 'Bot 缺少 ManageChannels 權限，無法建立 Ticket 分類與頻道。',
        ephemeral: true
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      const category = await findOrCreateCategory(interaction.guild);
      const panelChannel = await findOrCreateTextChannel(
        interaction.guild,
        TICKET_PANEL_CHANNEL_NAME,
        category,
        buildSupportOverwrites(interaction.guild),
        '點擊按鈕建立客服單'
      );
      const logChannel = await findOrCreateTextChannel(
        interaction.guild,
        TICKET_LOG_CHANNEL_NAME,
        category,
        buildLogOverwrites(interaction.guild),
        'Ticket 開啟與關閉紀錄'
      );

      const embed = new EmbedBuilder()
        .setColor(0x2f80ed)
        .setTitle('客服支援')
        .setDescription('有問題請點擊下方按鈕建立客服單，管理團隊會盡快協助你。')
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(CREATE_TICKET_BUTTON_ID)
          .setLabel('建立 Ticket')
          .setStyle(ButtonStyle.Primary)
      );

      await panelChannel.send({ embeds: [embed], components: [row] });

      await interaction.editReply(
        `Ticket 系統已建立完成。\n客服入口：${panelChannel}\n紀錄頻道：${logChannel}`
      );
    } catch (error) {
      console.error('設定 Ticket 系統失敗：', error);
      await interaction.editReply(
        '設定 Ticket 系統失敗。請確認 Bot 具有 ManageChannels、View Channels、Send Messages、Embed Links 權限，且 Bot 角色位置足夠。'
      );
    }
  }
};
