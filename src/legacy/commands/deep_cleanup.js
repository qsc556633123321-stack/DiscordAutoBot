const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder
} = require('discord.js');
const {
  createDeepCleanupPlan,
  saveDeepCleanupPlan
} = require('../../systems/deepCleanupPlanner');

function truncate(text, max = 1024) {
  if (!text) return '無';
  return text.length > max ? `${text.slice(0, max - 3)}...` : text;
}

function list(items, formatter) {
  if (!items.length) return '無';
  return items.map(formatter).join('\n');
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deep-cleanup')
    .setDescription('建立深度整理預覽方案，執行前需要二次確認')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addStringOption((option) =>
      option
        .setName('mode')
        .setDescription('preview 只預覽；execute 顯示預覽並允許二次確認')
        .setRequired(true)
        .addChoices(
          { name: 'preview', value: 'preview' },
          { name: 'execute', value: 'execute' }
        )
    )
    .addStringOption((option) =>
      option
        .setName('delete_level')
        .setDescription('刪除建議等級')
        .setRequired(true)
        .addChoices(
          { name: 'safe', value: 'safe' },
          { name: 'normal', value: 'normal' },
          { name: 'aggressive', value: 'aggressive' }
        )
    )
    .addBooleanOption((option) =>
      option
        .setName('use_ai')
        .setDescription('是否標記本次計畫使用 AI 輔助判斷')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.guild) {
      await interaction.reply({ content: '這個指令只能在伺服器中使用。', ephemeral: true });
      return;
    }

    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.reply({ content: '你需要 ManageChannels 權限才能使用深度整理。', ephemeral: true });
      return;
    }

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.reply({ content: 'Bot 缺少 ManageChannels 權限，無法建立分類、搬移或封存頻道。', ephemeral: true });
      return;
    }

    const mode = interaction.options.getString('mode');
    const deleteLevel = interaction.options.getString('delete_level');
    const useAi = interaction.options.getBoolean('use_ai');
    const plan = createDeepCleanupPlan(interaction.guild, {
      mode,
      deleteLevel,
      useAi,
      sourceChannelId: interaction.channelId,
      requestedById: interaction.user.id
    });

    saveDeepCleanupPlan(interaction.id, plan);

    const embed = new EmbedBuilder()
      .setColor(deleteLevel === 'aggressive' ? 0xeb5757 : 0x2f80ed)
      .setTitle('深度整理預覽')
      .setDescription(`模式：${mode}\ndelete_level：${deleteLevel}\nuse_ai：${useAi ? 'true' : 'false'}\n\n按下確認前不會執行任何變更。`)
      .addFields(
        {
          name: '1. 將建立的分類',
          value: truncate(list(plan.categoriesToCreate, (name) => `• ${name}`))
        },
        {
          name: '2. 將搬移的頻道',
          value: truncate(list(plan.moves, (item) => `• #${item.channelName}：${item.currentCategoryName} -> ${item.targetCategoryName}（${item.reason}）`))
        },
        {
          name: '3. 將封存的頻道',
          value: truncate(list(plan.archives, (item) => `• #${item.channelName} -> ${item.targetCategoryName}（${item.reason}）`))
        },
        {
          name: '4. 將建議刪除的頻道',
          value: truncate(deleteLevel === 'safe'
            ? 'safe 模式不刪除，只封存。'
            : list(plan.deleteSuggestions, (item) => `• #${item.channelName}（${item.reason}）`))
        },
        {
          name: '5. 不處理的保護頻道',
          value: truncate(list(plan.protectedChannels, (item) => `• ${item.channelName}（${item.reason}）`))
        },
        {
          name: '6. 風險提醒',
          value: truncate(list(plan.riskNotes, (note) => `• ${note}`))
        }
      )
      .setFooter({ text: `方案 ID：${interaction.id}` })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`confirm_deep_cleanup_${interaction.id}`)
        .setLabel('確認執行深度整理')
        .setStyle(ButtonStyle.Danger)
        .setDisabled(mode !== 'execute'),
      new ButtonBuilder()
        .setCustomId(`cancel_deep_cleanup_${interaction.id}`)
        .setLabel('取消')
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  }
};
