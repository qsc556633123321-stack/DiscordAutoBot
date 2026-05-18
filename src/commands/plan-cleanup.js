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

function listOrNone(items, max = 12) {
  if (!items.length) return '無';
  const shown = items.slice(0, max).map((item) => `• ${item}`).join('\n');
  const more = items.length > max ? `\n...另有 ${items.length - max} 項` : '';
  return `${shown}${more}`;
}

function inferCategory(channel) {
  const name = channel.name.toLowerCase();

  if (/規則|公告|驗證|rules|announce|verify|welcome/.test(name)) return '資訊中心';
  if (/ticket|客服|support/.test(name)) return '🎫｜客服支援';
  if (/管理|admin|mod|log|logs|審核/.test(name)) return '管理員後台';
  if (/語音|voice|聊天|chat|general|大廳/.test(name)) return '社群大廳';
  if (/遊戲|game|隊友|lfg/.test(name)) return '遊戲交流';
  if (/股票|投資|盤勢|market|stock/.test(name)) return '投資討論';

  return '待整理';
}

function suggestUnifiedName(channel) {
  const name = channel.name;
  const normalized = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/_+/g, '-');

  if (normalized !== name) return `${name} -> ${normalized}`;
  if (/^\p{Extended_Pictographic}/u.test(name) && !name.includes('｜')) {
    return `${name} -> 建議改成「圖示｜${name.replace(/^\p{Extended_Pictographic}+/u, '').trim() || '頻道名稱'}」`;
  }

  return null;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('plan-cleanup')
    .setDescription('根據目前頻道結構產生整理方案，不會實際變更')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    if (!interaction.guild) {
      await interaction.reply({ content: '這個指令只能在伺服器中使用。', ephemeral: true });
      return;
    }

    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.reply({ content: '你需要 ManageChannels 權限才能產生整理方案。', ephemeral: true });
      return;
    }

    const channels = [...interaction.guild.channels.cache.values()];
    const categories = channels.filter((channel) => channel.type === ChannelType.GuildCategory);
    const movableChannels = channels.filter(
      (channel) => channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildVoice
    );

    const existingCategoryNames = new Set(categories.map((category) => category.name));
    const categorySuggestions = new Set();
    const moveSuggestions = [];
    const archiveSuggestions = [];
    const renameSuggestions = [];

    for (const channel of movableChannels) {
      const suggestedCategory = inferCategory(channel);
      if (!existingCategoryNames.has(suggestedCategory)) {
        categorySuggestions.add(suggestedCategory);
      }

      if (!channel.parentId || channel.parent?.name !== suggestedCategory) {
        moveSuggestions.push(`#${channel.name} -> ${suggestedCategory}`);
      }

      if (/old|archive|封存|測試|test|unused|廢棄/i.test(channel.name)) {
        archiveSuggestions.push(`#${channel.name}`);
      }

      const renameSuggestion = suggestUnifiedName(channel);
      if (renameSuggestion) {
        renameSuggestions.push(renameSuggestion);
      }
    }

    const emptyCategories = categories.filter(
      (category) => !channels.some((channel) => channel.parentId === category.id)
    );
    for (const category of emptyCategories) {
      archiveSuggestions.push(`空分類：${category.name}`);
    }

    const embed = new EmbedBuilder()
      .setColor(0x27ae60)
      .setTitle('伺服器整理方案')
      .setDescription('這是一份整理計畫，不會直接新增、刪除、移動或改名任何頻道。')
      .addFields(
        {
          name: '建議新增分類',
          value: truncate(listOrNone([...categorySuggestions]))
        },
        {
          name: '建議頻道歸類',
          value: truncate(listOrNone(moveSuggestions))
        },
        {
          name: '可能可封存',
          value: truncate(listOrNone(archiveSuggestions))
        },
        {
          name: '建議統一命名',
          value: truncate(listOrNone(renameSuggestions))
        },
        {
          name: '下一步可執行指令',
          value: '`/rename-channel channel:<頻道> name:<新名稱>`\n`/move-channel channel:<頻道> category:<目標分類>`\n如需建立基礎架構可使用 `/setup-server`。'
        }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
