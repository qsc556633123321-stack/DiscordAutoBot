const path = require('node:path');
const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const {
  diagnoseCreateEntries,
  readCreateEntryRegistry,
  repairCreateEntryRegistry
} = require('../../systems/gameChannels');
const { readTempVoice } = require('../../systems/tempVoice');
const { readJson } = require('../../infrastructure/storage/jsonStore');

const VOICE_HUB_FILE = path.join(__dirname, '..', 'data', 'voice-hub.json');

function readVoiceHubData() {
  return readJson(VOICE_HUB_FILE, {});
}

function truncateList(lines, max = 10) {
  if (!lines.length) return '無';
  const visible = lines.slice(0, max);
  const rest = lines.length - visible.length;
  return `${visible.join('\n')}${rest > 0 ? `\n...還有 ${rest} 筆` : ''}`.slice(0, 1024);
}

async function diagnoseRoomRegistry(guild) {
  const records = readTempVoice()[guild.id] || {};
  const lines = [];

  for (const [channelId, record] of Object.entries(records)) {
    const channel = guild.channels.cache.get(channelId) || await guild.channels.fetch(channelId).catch(() => null);
    if (!channel) {
      lines.push(`❌ ${record.roomName || record.voiceChannelName || channelId}：registry 指向不存在的語音房`);
      continue;
    }
    if ((record.status || 'active') !== 'active') {
      lines.push(`⚠️ ${channel.name}：狀態為 ${record.status}`);
      continue;
    }
    lines.push(`✅ ${channel.name}：active registry 正常`);
  }

  return lines;
}

async function diagnoseVoiceHub(guild) {
  const config = readVoiceHubData()[guild.id];
  if (!config) return '⚠️ 尚未設定 Voice Hub，可執行 `/setup-voicehub`';
  const channel = guild.channels.cache.get(config.channelId) || await guild.channels.fetch(config.channelId).catch(() => null);
  if (!channel) return '❌ Voice Hub 頻道不存在，將在下次 setup/update 時重建';
  if (!config.messageId) return `⚠️ ${channel.name}：缺少 messageId，下一次更新會重發固定訊息`;
  const message = await channel.messages.fetch(config.messageId).catch(() => null);
  if (!message) return `⚠️ ${channel.name}：固定訊息不存在，下一次更新會重建`;
  return `✅ ${channel.name}：Voice Hub 正常`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tempvoice-doctor')
    .setDescription('掃描並修復 Temp Voice 建立入口 metadata、房間 registry 與 Voice Hub 狀態')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    if (!interaction.guild) {
      await interaction.editReply('這個指令只能在伺服器內使用。');
      return;
    }

    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.editReply('你需要 ManageChannels 權限才能使用 Temp Voice Doctor。');
      return;
    }

    const before = await diagnoseCreateEntries(interaction.guild);
    const repairSummary = await repairCreateEntryRegistry(interaction.guild);
    const after = await diagnoseCreateEntries(interaction.guild);
    const roomRegistry = await diagnoseRoomRegistry(interaction.guild);
    const voiceHub = await diagnoseVoiceHub(interaction.guild);
    const registry = readCreateEntryRegistry()[interaction.guild.id] || {};

    const beforeLines = before.map((item) => `${item.status} ${item.channelName}：${item.detail}`);
    const afterLines = after.map((item) => `${item.status} ${item.channelName}：${item.detail}`);
    const repairLines = [
      repairSummary.repaired.length ? `✅ 已補 metadata：${repairSummary.repaired.join('、')}` : null,
      repairSummary.removed.length ? `🧹 已移除失效 metadata：${repairSummary.removed.join('、')}` : null,
      !repairSummary.repaired.length && !repairSummary.removed.length ? '✅ metadata 無需修復' : null
    ].filter(Boolean);

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('🩺 Temp Voice Doctor')
      .setDescription(`Create entry metadata：${Object.keys(registry).length} 筆`)
      .addFields(
        { name: '修復前掃描', value: truncateList(beforeLines), inline: false },
        { name: 'Auto Repair', value: truncateList(repairLines), inline: false },
        { name: '修復後狀態', value: truncateList(afterLines), inline: false },
        { name: 'Room Registry', value: truncateList(roomRegistry), inline: false },
        { name: 'Voice Hub Sync', value: voiceHub.slice(0, 1024), inline: false }
      )
      .setFooter({ text: '✅ 正常 / ⚠️ 可修復或需注意 / ❌ 失效' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
};
