const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { getLinkGuardSettings, updateLinkGuardSettings } = require('../systems/linkGuard');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('linkguard-settings')
    .setDescription('設定 Link Guard 惡意連結防護')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addBooleanOption((option) =>
      option.setName('enabled').setDescription('啟用或停用 Link Guard').setRequired(false)
    )
    .addBooleanOption((option) =>
      option.setName('block_invites').setDescription('封鎖非白名單 Discord 邀請').setRequired(false)
    )
    .addBooleanOption((option) =>
      option.setName('block_shorteners').setDescription('封鎖短網址').setRequired(false)
    )
    .addIntegerOption((option) =>
      option.setName('new_account_days').setDescription('幾天內的新帳號發連結會加強處理').setMinValue(0).setMaxValue(30).setRequired(false)
    )
    .addIntegerOption((option) =>
      option.setName('new_account_timeout_minutes').setDescription('新帳號違規 timeout 分鐘數').setMinValue(1).setMaxValue(1440).setRequired(false)
    )
    .addIntegerOption((option) =>
      option.setName('link_spam_limit').setDescription('60 秒內允許的連結數量').setMinValue(1).setMaxValue(20).setRequired(false)
    )
    .addRoleOption((option) =>
      option.setName('whitelist_role').setDescription('加入不受 Link Guard 掃描的白名單角色').setRequired(false)
    ),

  async execute(interaction) {
    if (!interaction.guild) {
      await interaction.reply({ content: '這個指令只能在伺服器內使用。', ephemeral: true });
      return;
    }

    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild)) {
      await interaction.reply({ content: '你需要 ManageGuild 權限才能設定 Link Guard。', ephemeral: true });
      return;
    }

    const patch = {};
    const enabled = interaction.options.getBoolean('enabled');
    const blockInvites = interaction.options.getBoolean('block_invites');
    const blockShorteners = interaction.options.getBoolean('block_shorteners');
    const newAccountDays = interaction.options.getInteger('new_account_days');
    const newAccountTimeoutMinutes = interaction.options.getInteger('new_account_timeout_minutes');
    const linkSpamLimit = interaction.options.getInteger('link_spam_limit');
    const whitelistRole = interaction.options.getRole('whitelist_role');

    if (enabled !== null) patch.enabled = enabled;
    if (blockInvites !== null) patch.blockInvites = blockInvites;
    if (blockShorteners !== null) patch.blockShorteners = blockShorteners;
    if (newAccountDays !== null) patch.newAccountDays = newAccountDays;
    if (newAccountTimeoutMinutes !== null) patch.newAccountTimeoutMinutes = newAccountTimeoutMinutes;
    if (linkSpamLimit !== null) patch.linkSpamLimit = linkSpamLimit;
    if (whitelistRole) {
      const current = getLinkGuardSettings(interaction.guild.id);
      patch.whitelistedRoleIds = [...new Set([...current.whitelistedRoleIds, whitelistRole.id])];
    }

    const settings = Object.keys(patch).length
      ? updateLinkGuardSettings(interaction.guild.id, patch)
      : getLinkGuardSettings(interaction.guild.id);

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('Link Guard 設定')
      .addFields(
        { name: 'enabled', value: String(settings.enabled), inline: true },
        { name: 'block_invites', value: String(settings.blockInvites), inline: true },
        { name: 'block_shorteners', value: String(settings.blockShorteners), inline: true },
        { name: 'new_account_days', value: String(settings.newAccountDays), inline: true },
        { name: 'new_account_timeout_minutes', value: String(settings.newAccountTimeoutMinutes), inline: true },
        { name: 'link_spam_limit', value: String(settings.linkSpamLimit), inline: true },
        { name: 'whitelist_roles', value: String(settings.whitelistedRoleIds.length), inline: true }
      )
      .setFooter({ text: '白名單請使用 /linkguard-whitelist 管理。' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
