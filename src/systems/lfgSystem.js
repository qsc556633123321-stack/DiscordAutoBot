const fs = require('node:fs');
const path = require('node:path');
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  PermissionFlagsBits
} = require('discord.js');
const { getGameEmoji } = require('../utils/gameEmojis');

const DATA_DIR = path.join(__dirname, '..', 'data');
const TEMP_VOICE_FILE = path.join(DATA_DIR, 'temp-voice.json');
const LFG_FILE = path.join(DATA_DIR, 'lfg-cards.json');
const LFG_CHANNEL_NAME = '📢｜組隊招募';
const updateTimers = new Map();

function ensureFile(filePath, fallback = '{}') {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, fallback, 'utf8');
}

function readJson(filePath) {
  ensureFile(filePath);
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8') || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (error) {
    console.error(`讀取 ${path.basename(filePath)} 失敗:`, error);
    return {};
  }
}

function writeJson(filePath, data) {
  ensureFile(filePath);
  try {
    fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  } catch (error) {
    console.error(`寫入 ${path.basename(filePath)} 失敗:`, error);
  }
}

function readLfgData() {
  return readJson(LFG_FILE);
}

function writeLfgData(data) {
  writeJson(LFG_FILE, data);
}

function readTempVoiceRecord(guildId, voiceChannelId) {
  const data = readJson(TEMP_VOICE_FILE);
  const record = data[guildId]?.[voiceChannelId] || null;
  return record ? { status: 'active', ...record } : null;
}

function getLfgCard(guildId, voiceChannelId) {
  return readLfgData()[guildId]?.[voiceChannelId] || null;
}

function saveLfgCard(guildId, voiceChannelId, card) {
  const data = readLfgData();
  if (!data[guildId]) data[guildId] = {};
  data[guildId][voiceChannelId] = {
    ...(data[guildId][voiceChannelId] || {}),
    ...card,
    guildId,
    voiceChannelId,
    updatedAt: new Date().toISOString()
  };
  writeLfgData(data);
  return data[guildId][voiceChannelId];
}

function removeLfgCard(guildId, voiceChannelId) {
  const data = readLfgData();
  if (!data[guildId]?.[voiceChannelId]) return false;
  delete data[guildId][voiceChannelId];
  if (Object.keys(data[guildId]).length === 0) delete data[guildId];
  writeLfgData(data);
  return true;
}

async function getOrCreateLfgChannel(guild) {
  let channel = guild.channels.cache.find(
    (item) => item.type === ChannelType.GuildText && item.name === LFG_CHANNEL_NAME
  );
  if (channel) return channel;

  channel = await guild.channels.create({
    name: LFG_CHANNEL_NAME,
    type: ChannelType.GuildText,
    reason: 'Create LFG recruit channel'
  });
  return channel;
}

function buildLfgRows(voiceChannelId, disabled = false) {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`lfg_join_${voiceChannelId}`)
        .setLabel('加入語音')
        .setStyle(ButtonStyle.Success)
        .setDisabled(disabled),
      new ButtonBuilder()
        .setCustomId(`lfg_view_${voiceChannelId}`)
        .setLabel('查看房間')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(disabled)
    )
  ];
}

function roomLimit(channel, record) {
  return channel.userLimit || record.userLimit || 0;
}

function buildLfgEmbed(channel, record, ended = false) {
  const limit = roomLimit(channel, record);
  const count = channel?.members?.size ?? 0;
  const titleName = String(channel?.name || record.roomName || record.voiceChannelName || '語音房').replace(/^🔊｜/, '');
  const embed = new EmbedBuilder()
    .setColor(ended ? 0xeb5757 : 0x57f287)
    .setTitle(ended ? '🔴 此房間已結束' : `${getGameEmoji(record.game)} ${titleName}`)
    .setDescription(
      ended
        ? '這個組隊招募已結束。'
        : [
          `👑 房主：${record.ownerId ? `<@${record.ownerId}>` : '未知'}`,
          `👥 ${count}/${limit || '無限制'}`,
          record.locked ? '🔒 私人房' : '🔓 公開房'
        ].join('\n')
    )
    .setTimestamp();

  if (!ended && record.createdAt) {
    embed.addFields({ name: '建立時間', value: `<t:${Math.floor(new Date(record.createdAt).getTime() / 1000)}:R>`, inline: true });
  }

  return embed;
}

async function fetchLfgMessage(guild, card) {
  if (!card?.channelId || !card?.messageId) return null;
  try {
    const channel = guild.channels.cache.get(card.channelId) || await guild.channels.fetch(card.channelId).catch(() => null);
    if (!channel?.messages) return null;
    return channel.messages.fetch(card.messageId).catch(() => null);
  } catch (error) {
    return null;
  }
}

async function createOrUpdateLfgCard(guild, voiceChannelId) {
  const record = readTempVoiceRecord(guild.id, voiceChannelId);
  const voiceChannel = guild.channels.cache.get(voiceChannelId) || await guild.channels.fetch(voiceChannelId).catch(() => null);
  if (!record || record.status !== 'active' || !voiceChannel || voiceChannel.type !== ChannelType.GuildVoice) {
    await endLfgCard(guild, voiceChannelId);
    return null;
  }

  const lfgChannel = await getOrCreateLfgChannel(guild);
  const card = getLfgCard(guild.id, voiceChannelId);
  const payload = {
    embeds: [buildLfgEmbed(voiceChannel, record)],
    components: buildLfgRows(voiceChannelId)
  };

  let message = await fetchLfgMessage(guild, card);
  if (message) {
    await message.edit(payload).catch(() => null);
  } else {
    message = await lfgChannel.send(payload);
  }

  return saveLfgCard(guild.id, voiceChannelId, {
    channelId: lfgChannel.id,
    messageId: message.id,
    ownerId: record.ownerId,
    game: record.game,
    createdAt: record.createdAt
  });
}

async function endLfgCard(guild, voiceChannelId) {
  const card = getLfgCard(guild.id, voiceChannelId);
  if (!card) return false;

  const record = readTempVoiceRecord(guild.id, voiceChannelId) || card;
  const voiceChannel = guild.channels.cache.get(voiceChannelId);
  const message = await fetchLfgMessage(guild, card);
  if (message) {
    await message.edit({
      embeds: [buildLfgEmbed(voiceChannel, record, true)],
      components: buildLfgRows(voiceChannelId, true)
    }).catch(() => null);
    setTimeout(() => message.delete().catch(() => null), 30 * 60 * 1000);
  }

  removeLfgCard(guild.id, voiceChannelId);
  return true;
}

function scheduleLfgUpdate(guild, voiceChannelId, options = {}) {
  if (!guild || !voiceChannelId) return;
  const key = `${guild.id}:${voiceChannelId}`;
  if (updateTimers.has(key)) clearTimeout(updateTimers.get(key));
  updateTimers.set(key, setTimeout(async () => {
    updateTimers.delete(key);
    await createOrUpdateLfgCard(guild, voiceChannelId).catch((error) => console.error('LFG scheduled update failed:', error));
  }, options.delayMs ?? 1500));
}

async function handleLfgButton(interaction) {
  if (!interaction.guild) {
    await interaction.reply({ content: '這個按鈕只能在伺服器內使用。', ephemeral: true });
    return true;
  }

  const voiceChannelId = interaction.customId.replace(/^lfg_(join|view)_/, '');
  const record = readTempVoiceRecord(interaction.guild.id, voiceChannelId);
  const voiceChannel = interaction.guild.channels.cache.get(voiceChannelId) || await interaction.guild.channels.fetch(voiceChannelId).catch(() => null);

  if (!record || record.status !== 'active' || !voiceChannel || voiceChannel.type !== ChannelType.GuildVoice) {
    await endLfgCard(interaction.guild, voiceChannelId);
    await interaction.reply({ content: '⚠️ 此房間已不存在。', ephemeral: true });
    return true;
  }

  if (interaction.customId.startsWith('lfg_view_')) {
    const limit = roomLimit(voiceChannel, record);
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('查看語音房')
      .addFields(
        { name: '房主', value: record.ownerId ? `<@${record.ownerId}>` : '未知', inline: true },
        { name: '建立時間', value: record.createdAt ? `<t:${Math.floor(new Date(record.createdAt).getTime() / 1000)}:F>` : '未知', inline: true },
        { name: '房間 ID', value: voiceChannel.id, inline: false },
        { name: '狀態', value: record.locked ? '私人房' : '公開房', inline: true },
        { name: '人數', value: `${voiceChannel.members.size}/${limit || '無限制'}`, inline: true }
      )
      .setTimestamp();
    await interaction.reply({ embeds: [embed], ephemeral: true });
    return true;
  }

  if (record.locked) {
    await interaction.reply({ content: '⚠️ 此房間為私人房間。', ephemeral: true });
    return true;
  }

  const limit = roomLimit(voiceChannel, record);
  if (limit && voiceChannel.members.size >= limit) {
    await interaction.reply({ content: '⚠️ 房間已滿。', ephemeral: true });
    return true;
  }

  if (
    interaction.memberPermissions?.has(PermissionFlagsBits.Administrator) ||
    interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)
  ) {
    await interaction.reply({ content: '管理員請手動加入語音房，Bot 不會自動移動管理員。', ephemeral: true });
    return true;
  }

  if (!interaction.member.voice.channel) {
    await interaction.reply({ content: '請先加入任一語音頻道，Bot 才能把你移動到此房間。', ephemeral: true });
    return true;
  }

  try {
    await interaction.member.voice.setChannel(voiceChannel, 'Joined temp voice from LFG card');
    await interaction.reply({ content: `已將你移動到 ${voiceChannel}。`, ephemeral: true });
    scheduleLfgUpdate(interaction.guild, voiceChannelId);
  } catch (error) {
    console.error('LFG move member failed:', error);
    await interaction.reply({ content: '移動失敗，請確認 Bot 有 MoveMembers 權限，且你目前在語音頻道中。', ephemeral: true });
  }

  return true;
}

async function restoreLfgCards(client) {
  const data = readLfgData();
  for (const [guildId, cards] of Object.entries(data)) {
    const guild = client.guilds.cache.get(guildId) || await client.guilds.fetch(guildId).catch(() => null);
    if (!guild) continue;
    for (const voiceChannelId of Object.keys(cards || {})) {
      const record = readTempVoiceRecord(guildId, voiceChannelId);
      const channel = guild.channels.cache.get(voiceChannelId) || await guild.channels.fetch(voiceChannelId).catch(() => null);
      if (!record || record.status !== 'active' || !channel) {
        await endLfgCard(guild, voiceChannelId);
      } else {
        await createOrUpdateLfgCard(guild, voiceChannelId);
      }
    }
  }
}

module.exports = {
  createOrUpdateLfgCard,
  endLfgCard,
  handleLfgButton,
  restoreLfgCards,
  scheduleLfgUpdate
};
