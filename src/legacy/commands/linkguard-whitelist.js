const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const {
  addWhitelistDomain,
  addWhitelistInvite,
  getLinkGuardSettings,
  removeWhitelistDomain,
  removeWhitelistInvite
} = require('../../systems/linkGuard');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('linkguard-whitelist')
    .setDescription('管理 Link Guard 網域或邀請白名單')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption((option) =>
      option
        .setName('action')
        .setDescription('白名單操作')
        .setRequired(true)
        .addChoices(
          { name: 'add', value: 'add' },
          { name: 'remove', value: 'remove' },
          { name: 'list', value: 'list' }
        )
    )
    .addStringOption((option) =>
      option
        .setName('type')
        .setDescription('白名單類型')
        .setRequired(true)
        .addChoices(
          { name: 'domain', value: 'domain' },
          { name: 'invite', value: 'invite' }
        )
    )
    .addStringOption((option) =>
      option
        .setName('value')
        .setDescription('網域如 example.com，或 Discord invite code')
        .setRequired(false)
        .setMaxLength(120)
    ),

  async execute(interaction) {
    if (!interaction.guild) {
      await interaction.reply({ content: '這個指令只能在伺服器內使用。', ephemeral: true });
      return;
    }

    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild)) {
      await interaction.reply({ content: '你需要 ManageGuild 權限才能管理 Link Guard 白名單。', ephemeral: true });
      return;
    }

    const action = interaction.options.getString('action');
    const type = interaction.options.getString('type');
    const value = interaction.options.getString('value');

    if (action !== 'list' && !value) {
      await interaction.reply({ content: 'add/remove 需要提供 value。', ephemeral: true });
      return;
    }

    let settings = getLinkGuardSettings(interaction.guild.id);
    if (action === 'add' && type === 'domain') settings = addWhitelistDomain(interaction.guild.id, value);
    if (action === 'remove' && type === 'domain') settings = removeWhitelistDomain(interaction.guild.id, value);
    if (action === 'add' && type === 'invite') settings = addWhitelistInvite(interaction.guild.id, value);
    if (action === 'remove' && type === 'invite') settings = removeWhitelistInvite(interaction.guild.id, value);

    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle('Link Guard 白名單')
      .setDescription(action === 'list' ? '目前白名單如下。' : `已執行 ${action} ${type}: ${value}`)
      .addFields(
        { name: '允許網域', value: settings.allowedDomains.join('\n').slice(0, 1024) || '無' },
        { name: '允許 Invite Code', value: settings.allowedInvites.join('\n').slice(0, 1024) || '無' }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
