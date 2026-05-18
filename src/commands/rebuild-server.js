const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder
} = require('discord.js');
const {
  createRebuildPlan,
  getTemplate,
  saveRebuildPlan
} = require('../systems/serverRebuilder');

function truncate(text, max = 1024) {
  if (!text) return '無';
  return text.length > max ? `${text.slice(0, max - 3)}...` : text;
}

function list(items, mapper) {
  if (!items.length) return '無';
  return items.map(mapper).join('\n');
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rebuild-server')
    .setDescription('高風險一鍵大洗牌重整伺服器，必須先預覽與二次確認')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addStringOption((option) =>
      option.setName('template')
        .setDescription('新版模板')
        .setRequired(true)
        .addChoices(
          { name: 'gaming_community', value: 'gaming_community' },
          { name: 'creator_community', value: 'creator_community' },
          { name: 'mixed_community', value: 'mixed_community' }
        )
    )
    .addStringOption((option) =>
      option.setName('mode')
        .setDescription('preview 只預覽；execute 需要按鈕確認才執行')
        .setRequired(true)
        .addChoices(
          { name: 'preview', value: 'preview' },
          { name: 'execute', value: 'execute' }
        )
    )
    .addStringOption((option) =>
      option.setName('old_channels')
        .setDescription('舊頻道處理方式')
        .setRequired(true)
        .addChoices(
          { name: 'archive', value: 'archive' },
          { name: 'hide', value: 'hide' },
          { name: 'delete', value: 'delete' }
        )
    )
    .addBooleanOption((option) =>
      option.setName('keep_admin')
        .setDescription('是否保留管理員相關頻道，預設 true')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!interaction.guild) {
      await interaction.reply({ content: '這個指令只能在伺服器中使用。', ephemeral: true });
      return;
    }

    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.reply({ content: '你需要 ManageChannels 權限才能使用一鍵大洗牌。', ephemeral: true });
      return;
    }

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.reply({ content: 'Bot 缺少 ManageChannels 權限，無法重整伺服器。', ephemeral: true });
      return;
    }

    const templateName = interaction.options.getString('template');
    const mode = interaction.options.getString('mode');
    const oldChannels = interaction.options.getString('old_channels');
    const keepAdmin = interaction.options.getBoolean('keep_admin') ?? true;
    const template = getTemplate(templateName);
    const plan = createRebuildPlan(interaction.guild, {
      template: templateName,
      mode,
      oldChannels,
      keepAdmin,
      requestedById: interaction.user.id,
      sourceChannelId: interaction.channelId
    });

    saveRebuildPlan(interaction.id, plan);

    const embed = new EmbedBuilder()
      .setColor(oldChannels === 'delete' ? 0xeb5757 : 0x2f80ed)
      .setTitle('一鍵大洗牌重整預覽')
      .setDescription(`template：${template.label}\nmode：${mode}\nold_channels：${oldChannels}\nkeep_admin：${keepAdmin}`)
      .addFields(
        { name: '將建立的分類', value: truncate(list(plan.categoriesToCreate, (name) => `• ${name}`)) },
        { name: '將建立的頻道', value: truncate(list(plan.channelsToCreate, (item) => `• ${item.categoryName} / ${item.channelName}（${item.type}）`)) },
        { name: '舊頻道處理方式', value: truncate(oldChannels === 'delete'
          ? list(plan.deleteCandidates, (item) => `• 將刪除：#${item.channelName}`)
          : list(plan.oldChannels, (item) => `• #${item.channelName} -> ${oldChannels === 'hide' ? '隱藏封存' : '舊頻道封存'}`)) },
        { name: '保護/略過', value: truncate(list(plan.protectedChannels, (item) => `• ${item.channelName}（${item.reason}）`)) },
        { name: '風險提醒', value: truncate(list(plan.riskNotes, (note) => `• ${note}`)) }
      )
      .setFooter({ text: `方案 ID：${interaction.id}` })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`rebuild_confirm_${interaction.id}`)
        .setLabel('✅ 確認大洗牌')
        .setStyle(ButtonStyle.Danger)
        .setDisabled(mode !== 'execute'),
      new ButtonBuilder()
        .setCustomId(`rebuild_cancel_${interaction.id}`)
        .setLabel('❌ 取消')
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  }
};
