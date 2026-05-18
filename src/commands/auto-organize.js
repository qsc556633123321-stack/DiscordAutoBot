const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder
} = require('discord.js');
const {
  MAX_MOVES_PER_PLAN,
  createOrganizePlan,
  formatManualReview,
  formatMovePreview,
  getAIReviewInput,
  saveOrganizePlan
} = require('../systems/organizer');
const { analyzeUncertainChannels } = require('../systems/aiOrganizer');

function truncate(text, max = 1024) {
  if (!text) return '無';
  return text.length > max ? `${text.slice(0, max - 3)}...` : text;
}

function listOrNone(items) {
  if (!items.length) return '無';
  return items.map((item) => `• ${item}`).join('\n');
}

function formatAISuggestions(suggestions) {
  if (!suggestions.length) return 'AI 沒有提供額外建議。';

  return suggestions
    .map((suggestion, index) => (
      `${index + 1}. #${suggestion.channelName}\n` +
      `建議：${suggestion.suggestedCategory}\n` +
      `信心：${suggestion.confidence}\n` +
      `原因：${suggestion.reason}`
    ))
    .join('\n\n');
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('auto-organize')
    .setDescription('產生伺服器頻道自動搬家預覽方案')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    if (!interaction.guild) {
      await interaction.reply({ content: '這個指令只能在伺服器中使用。', ephemeral: true });
      return;
    }

    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.reply({ content: '你需要 ManageChannels 權限才能使用自動搬家系統。', ephemeral: true });
      return;
    }

    const botMember = interaction.guild.members.me;
    if (!botMember.permissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.reply({
        content: 'Bot 缺少 ManageChannels 權限，無法建立分類或移動頻道。',
        ephemeral: true
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    const plan = createOrganizePlan(interaction.guild, interaction.channelId, interaction.user.id);
    saveOrganizePlan(interaction.id, plan);

    let aiFieldValue = '未設定 OPENAI_API_KEY，因此略過 AI 建議。';

    if (process.env.OPENAI_API_KEY) {
      try {
        const aiSuggestions = await analyzeUncertainChannels(getAIReviewInput(interaction.guild, plan));
        aiFieldValue = truncate(formatAISuggestions(aiSuggestions));
      } catch (error) {
        console.error('AI 頻道整理建議失敗：', error);
        aiFieldValue = 'AI 建議暫時失敗，但規則整理方案仍可使用。';
      }
    }

    const embed = new EmbedBuilder()
      .setColor(0x2f80ed)
      .setTitle('自動搬家預覽方案')
      .setDescription('這只是預覽，按下確認前不會建立分類、移動頻道、刪除頻道或改名。')
      .addFields(
        {
          name: '將建立的分類',
          value: listOrNone(plan.categoriesToCreate)
        },
        {
          name: `建議搬移頻道（最多 ${MAX_MOVES_PER_PLAN} 個）`,
          value: truncate(formatMovePreview(plan))
        },
        {
          name: '需要人工判斷',
          value: truncate(formatManualReview(plan))
        },
        {
          name: 'AI 建議',
          value: aiFieldValue
        },
        {
          name: '安全限制',
          value: 'AI 只提供建議，不會納入確認搬移。確認按鈕只搬移規則中/高信心項目；低信心與不確定不會執行。不刪除、不改名、不搬移分類本身、不搬移目前執行指令的頻道、不搬移 ticket- 開頭的私人客服單。'
        }
      )
      .setFooter({ text: `方案 ID：${interaction.id}` })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`confirm_auto_organize_${interaction.id}`)
        .setLabel('確認執行搬家')
        .setStyle(ButtonStyle.Success)
        .setDisabled(plan.moves.length === 0),
      new ButtonBuilder()
        .setCustomId(`cancel_auto_organize_${interaction.id}`)
        .setLabel('取消')
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.editReply({
      embeds: [embed],
      components: [row]
    });
  }
};
