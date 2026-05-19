const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder
} = require('discord.js');
const {
  createAiReorganizePlan,
  saveAiReorganizePlan
} = require('../systems/aiServerReorganizer');

function truncate(text, max = 1024) {
  if (!text) return '無';
  return text.length > max ? `${text.slice(0, max - 3)}...` : text;
}

function list(items, mapper) {
  if (!items || !items.length) return '無';
  return items.map(mapper).join('\n');
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ai-reorganize-server')
    .setDescription('用新的社群邏輯預覽或執行 AI 伺服器重整')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addStringOption((option) =>
      option
        .setName('mode')
        .setDescription('preview 只預覽；execute 需二次確認後執行')
        .setRequired(true)
        .addChoices(
          { name: 'preview', value: 'preview' },
          { name: 'execute', value: 'execute' }
        )
    )
    .addBooleanOption((option) =>
      option
        .setName('use_ai')
        .setDescription('是否呼叫 OpenAI 產生額外整理建議')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('old_channels')
        .setDescription('舊頻道處理方式')
        .setRequired(true)
        .addChoices(
          { name: 'archive', value: 'archive' },
          { name: 'delete', value: 'delete' }
        )
    )
    .addBooleanOption((option) =>
      option
        .setName('public_chat')
        .setDescription('是否讓一般聊天與公開大廳所有人可見，預設 true')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!interaction.guild) {
      await interaction.reply({ content: '這個指令只能在伺服器內使用。', ephemeral: true });
      return;
    }

    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.reply({ content: '你需要 ManageChannels 權限才能重整伺服器。', ephemeral: true });
      return;
    }

    const botMember = interaction.guild.members.me;
    if (!botMember.permissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.reply({ content: 'Bot 缺少 ManageChannels 權限，無法建立、移動或設定頻道。', ephemeral: true });
      return;
    }

    const mode = interaction.options.getString('mode');
    const useAi = interaction.options.getBoolean('use_ai');
    const oldChannels = interaction.options.getString('old_channels');
    const publicChat = interaction.options.getBoolean('public_chat') ?? true;

    await interaction.deferReply({ ephemeral: true });

    const plan = await createAiReorganizePlan(interaction.guild, {
      mode,
      useAi,
      oldChannels,
      publicChat,
      requestedById: interaction.user.id,
      sourceChannelId: interaction.channelId
    });
    saveAiReorganizePlan(interaction.id, plan);

    const aiLines = plan.ai.suggestions.length
      ? list(plan.ai.suggestions, (item) => `• ${item.channelName} -> ${item.suggestedCategory}｜${item.confidence}｜${item.reason}`)
      : plan.ai.skippedReason || '無';

    const embed = new EmbedBuilder()
      .setColor(oldChannels === 'delete' ? 0xeb5757 : 0x5865f2)
      .setTitle('AI 伺服器重整預覽')
      .setDescription(
        `mode：${mode}\nuse_ai：${useAi}\nold_channels：${oldChannels}\npublic_chat：${publicChat}\n\n` +
        'preview 不會修改伺服器；execute 仍需按下確認按鈕。'
      )
      .addFields(
        { name: '將建立的分類', value: truncate(list(plan.categoriesToCreate, (name) => `• ${name}`)) },
        { name: '將建立的頻道', value: truncate(list(plan.channelsToCreate, (item) => `• ${item.categoryName} / ${item.channelName} (${item.type})`)) },
        { name: '將移動的頻道', value: truncate(list(plan.channelsToMove, (item) => `• ${item.channelName}: ${item.fromCategoryName} -> ${item.toCategoryName}`)) },
        { name: '將公開的頻道/分類', value: truncate(list(plan.publicChannels, (name) => `• ${name}`)) },
        { name: '將套用身分組權限的分類', value: truncate(list(plan.rolePermissionCategories, (item) => `• ${item.categoryName}：${item.roleName}`)) },
        {
          name: oldChannels === 'delete' ? '將封存或刪除的舊頻道' : '將封存的舊頻道',
          value: truncate(oldChannels === 'delete'
            ? list(plan.deleteCandidates, (item) => `• 刪除候選：${item.channelName}`)
            : list(plan.oldChannels, (item) => `• ${item.channelName} -> 舊頻道封存`))
        },
        { name: 'AI 建議', value: truncate(aiLines) },
        { name: '風險提醒', value: truncate(list(plan.riskNotes, (note) => `• ${note}`)) }
      )
      .setFooter({ text: `Plan ID: ${interaction.id}` })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`ai_reorganize_confirm_${interaction.id}`)
        .setLabel('✅ 確認 AI 重整')
        .setStyle(ButtonStyle.Danger)
        .setDisabled(mode !== 'execute'),
      new ButtonBuilder()
        .setCustomId(`ai_reorganize_cancel_${interaction.id}`)
        .setLabel('❌ 取消')
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.editReply({ embeds: [embed], components: [row] });
  }
};
