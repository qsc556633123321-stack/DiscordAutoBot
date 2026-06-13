const {
  ChannelType,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder
} = require('discord.js');

function truncate(text, max = 1024) {
  if (!text) return '無';
  return text.length > max ? `${text.slice(0, max - 3)}...` : text;
}

function listOrNone(items, max = 10) {
  if (!items.length) return '無';
  const shown = items.slice(0, max).map((item) => `• ${item}`).join('\n');
  const more = items.length > max ? `\n...另有 ${items.length - max} 項` : '';
  return `${shown}${more}`;
}

function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/[^\p{Script=Han}\p{Letter}\p{Number}]+/gu, '')
    .trim();
}

function getServerSnapshot(guild) {
  const channels = [...guild.channels.cache.values()];
  const categories = channels.filter((channel) => channel.type === ChannelType.GuildCategory);
  const textChannels = channels.filter((channel) => channel.type === ChannelType.GuildText);
  const voiceChannels = channels.filter((channel) => channel.type === ChannelType.GuildVoice);
  const roles = [...guild.roles.cache.values()].filter((role) => !role.managed && role.name !== '@everyone');

  return { channels, categories, textChannels, voiceChannels, roles };
}

function findSimilarChannels(channels) {
  const groups = new Map();

  for (const channel of channels) {
    const normalized = normalizeName(channel.name);
    if (!normalized) continue;
    const current = groups.get(normalized) || [];
    current.push(channel);
    groups.set(normalized, current);
  }

  return [...groups.values()]
    .filter((group) => group.length > 1)
    .map((group) => group.map((channel) => `#${channel.name}`).join('、'));
}

function analyzeNaming(channels) {
  const names = channels.map((channel) => channel.name);
  const hasHyphen = names.filter((name) => name.includes('-')).length;
  const hasDivider = names.filter((name) => name.includes('｜')).length;
  const hasEmojiPrefix = names.filter((name) => /^\p{Extended_Pictographic}/u.test(name)).length;
  const styles = [hasHyphen > 0, hasDivider > 0, hasEmojiPrefix > 0].filter(Boolean).length;

  if (styles <= 1) return '看起來大致統一。';

  return `命名風格混用：含連字號 ${hasHyphen} 個、含「｜」${hasDivider} 個、Emoji 開頭 ${hasEmojiPrefix} 個。`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('analyze-server')
    .setDescription('分析目前伺服器結構並提供整理建議')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    if (!interaction.guild) {
      await interaction.reply({ content: '這個指令只能在伺服器中使用。', ephemeral: true });
      return;
    }

    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.reply({ content: '你需要 ManageChannels 權限才能分析伺服器。', ephemeral: true });
      return;
    }

    const { channels, categories, textChannels, voiceChannels, roles } = getServerSnapshot(interaction.guild);
    const nonCategoryChannels = channels.filter(
      (channel) =>
        channel.type !== ChannelType.GuildCategory &&
        channel.type !== ChannelType.GuildThreadOnly &&
        !channel.parentId
    );
    const emptyCategories = categories.filter(
      (category) => !channels.some((channel) => channel.parentId === category.id)
    );
    const similarChannels = findSimilarChannels([...textChannels, ...voiceChannels]);

    const hasAdminArea = categories.some((channel) => /管理|admin|後台/i.test(channel.name)) ||
      textChannels.some((channel) => /管理|admin|後台/i.test(channel.name));
    const hasAnnouncement = textChannels.some((channel) => /公告|announce/i.test(channel.name));
    const hasRules = textChannels.some((channel) => /規則|rules/i.test(channel.name));
    const hasVerification = textChannels.some((channel) => /驗證|verify|verification/i.test(channel.name));
    const hasTicket = categories.some((channel) => /客服|ticket/i.test(channel.name)) ||
      textChannels.some((channel) => /ticket|客服|開啟客服單/i.test(channel.name));
    const namingReport = analyzeNaming([...textChannels, ...voiceChannels]);

    const problems = [
      nonCategoryChannels.length ? `有 ${nonCategoryChannels.length} 個頻道沒有分類。` : null,
      similarChannels.length ? `有 ${similarChannels.length} 組頻道名稱可能重複或功能相近。` : null,
      emptyCategories.length ? `有 ${emptyCategories.length} 個空分類。` : null,
      hasAdminArea ? null : '未偵測到明確的管理區或後台。',
      hasAnnouncement ? null : '未偵測到公告頻道。',
      hasRules ? null : '未偵測到規則頻道。',
      hasVerification ? null : '未偵測到驗證區。',
      hasTicket ? null : '未偵測到 Ticket 系統。',
      namingReport === '看起來大致統一。' ? null : namingReport
    ].filter(Boolean);

    const suggestions = [
      nonCategoryChannels.length ? '先用 `/plan-cleanup` 產生歸類方案，再用 `/move-channel` 單一頻道移動。' : null,
      similarChannels.length ? '檢查名稱相近的頻道用途，必要時用 `/rename-channel` 統一命名。' : null,
      emptyCategories.length ? '空分類先人工確認是否仍有用途，本 Bot 不會自動刪除。' : null,
      !hasAdminArea ? '可建立或保留一個管理員後台分類，並限制站長/管理員可見。' : null,
      !hasAnnouncement || !hasRules || !hasVerification ? '可用 `/setup-server` 補齊公告、規則、驗證等基礎區域。' : null,
      !hasTicket ? '可用 `/setup-ticket` 建立客服 Ticket 系統。' : null
    ].filter(Boolean);

    const embed = new EmbedBuilder()
      .setColor(0x2f80ed)
      .setTitle('伺服器整理分析')
      .setDescription('以下只做分析，不會刪除、移動或改名任何頻道。')
      .addFields(
        {
          name: '目前伺服器概況',
          value: `分類：${categories.length}\n文字頻道：${textChannels.length}\n語音頻道：${voiceChannels.length}\n角色：${roles.length}`,
          inline: true
        },
        {
          name: '核心區域檢查',
          value:
            `管理區：${hasAdminArea ? '存在' : '未偵測'}\n` +
            `公告：${hasAnnouncement ? '存在' : '未偵測'}\n` +
            `規則：${hasRules ? '存在' : '未偵測'}\n` +
            `驗證：${hasVerification ? '存在' : '未偵測'}\n` +
            `Ticket：${hasTicket ? '存在' : '未偵測'}`,
          inline: true
        },
        {
          name: '發現的問題',
          value: truncate(listOrNone(problems))
        },
        {
          name: '沒有分類的頻道',
          value: truncate(listOrNone(nonCategoryChannels.map((channel) => `#${channel.name}`)))
        },
        {
          name: '可能重複或相近',
          value: truncate(listOrNone(similarChannels))
        },
        {
          name: '空分類',
          value: truncate(listOrNone(emptyCategories.map((category) => category.name)))
        },
        {
          name: '建議整理方案',
          value: truncate(listOrNone(suggestions))
        },
        {
          name: '下一步可執行指令',
          value: '`/plan-cleanup` 產生整理方案\n`/rename-channel` 改單一頻道名稱\n`/move-channel` 移動單一頻道\n`/setup-ticket` 建立客服系統'
        }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
