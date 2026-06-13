const {
  ChannelType,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder
} = require('discord.js');
const templates = require('../../config/templates');

const ROLE_NAMES = {
  owner: '站長',
  admin: '管理員',
  member: '成員',
  guest: '訪客'
};

function slugifyChannelName(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^\p{Script=Han}\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);
}

async function findOrCreateRole(guild, name, options = {}) {
  const existing = guild.roles.cache.find((role) => role.name === name);
  if (existing) return existing;

  return guild.roles.create({
    name,
    color: options.color,
    reason: 'Discord Server Architect Bot setup'
  });
}

async function findOrCreateCategory(guild, name, permissionOverwrites) {
  const existing = guild.channels.cache.find(
    (channel) => channel.type === ChannelType.GuildCategory && channel.name === name
  );
  if (existing) return existing;

  return guild.channels.create({
    name,
    type: ChannelType.GuildCategory,
    permissionOverwrites,
    reason: 'Discord Server Architect Bot setup'
  });
}

async function findOrCreateTextChannel(guild, category, channelConfig, permissionOverwrites) {
  const channelName = slugifyChannelName(channelConfig.name);
  const existing = guild.channels.cache.find(
    (channel) => channel.type === ChannelType.GuildText && channel.name === channelName
  );

  if (existing) {
    if (existing.parentId !== category.id) {
      await existing.setParent(category.id, {
        lockPermissions: false,
        reason: 'Discord Server Architect Bot setup'
      });
    }
    return existing;
  }

  return guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    parent: category.id,
    topic: channelConfig.topic,
    permissionOverwrites,
    reason: 'Discord Server Architect Bot setup'
  });
}

function buildOverwrites(guild, roles, access) {
  const everyone = guild.roles.everyone;
  const baseDenyEveryone = {
    id: everyone.id,
    deny: [PermissionFlagsBits.ViewChannel]
  };
  const managerAllow = [
    PermissionFlagsBits.ViewChannel,
    PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.ReadMessageHistory,
    PermissionFlagsBits.ManageMessages
  ];

  if (access === 'guestRead') {
    return [
      {
        id: everyone.id,
        deny: [PermissionFlagsBits.ViewChannel]
      },
      {
        id: roles.owner.id,
        allow: managerAllow
      },
      {
        id: roles.admin.id,
        allow: managerAllow
      },
      {
        id: roles.member.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.ReadMessageHistory
        ],
        deny: [PermissionFlagsBits.SendMessages]
      },
      {
        id: roles.guest.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.ReadMessageHistory
        ],
        deny: [PermissionFlagsBits.SendMessages]
      }
    ];
  }

  if (access === 'guestChat') {
    return [
      {
        id: everyone.id,
        deny: [PermissionFlagsBits.ViewChannel]
      },
      {
        id: roles.owner.id,
        allow: managerAllow
      },
      {
        id: roles.admin.id,
        allow: managerAllow
      },
      {
        id: roles.member.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory
        ]
      },
      {
        id: roles.guest.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory
        ]
      }
    ];
  }

  if (access === 'admin') {
    return [
      baseDenyEveryone,
      {
        id: roles.owner.id,
        allow: managerAllow
      },
      {
        id: roles.admin.id,
        allow: managerAllow
      },
      {
        id: roles.member.id,
        deny: [PermissionFlagsBits.ViewChannel]
      },
      {
        id: roles.guest.id,
        deny: [PermissionFlagsBits.ViewChannel]
      }
    ];
  }

  return [
    baseDenyEveryone,
    {
      id: roles.owner.id,
      allow: managerAllow
    },
    {
      id: roles.admin.id,
      allow: managerAllow
    },
    {
      id: roles.member.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory
      ]
    },
    {
      id: roles.guest.id,
      deny: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages
      ]
    }
  ];
}

function buildRulesEmbed(template) {
  return new EmbedBuilder()
    .setColor(0x2f80ed)
    .setTitle(`${template.label}｜伺服器規則`)
    .setDescription(template.rules.map((rule, index) => `**${index + 1}.** ${rule}`).join('\n'))
    .setFooter({ text: '請閱讀並遵守規則，讓社群保持友善與有序。' })
    .setTimestamp();
}

function getChannelAccess(categoryConfig, channelConfig) {
  if (categoryConfig.adminOnly || channelConfig.key === 'admin') return 'admin';
  if (channelConfig.key === 'rules') return 'guestRead';
  if (channelConfig.key === 'verification') return 'guestChat';
  return 'member';
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-server')
    .setDescription('依照模板建立 Discord 伺服器基本架構')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption((option) =>
      option
        .setName('template')
        .setDescription('選擇伺服器模板')
        .setRequired(true)
        .addChoices(
          ...Object.entries(templates).map(([value, template]) => ({
            name: template.label,
            value
          }))
        )
    ),

  async execute(interaction) {
    if (!interaction.guild) {
      await interaction.reply({ content: '這個指令只能在伺服器中使用。', ephemeral: true });
      return;
    }

    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild)) {
      await interaction.reply({ content: '你需要 ManageGuild 權限才能使用這個指令。', ephemeral: true });
      return;
    }

    const selectedTemplate = interaction.options.getString('template');
    const template = templates[selectedTemplate];

    if (!template) {
      await interaction.reply({ content: '找不到指定的模板。', ephemeral: true });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    const roles = {
      owner: await findOrCreateRole(interaction.guild, ROLE_NAMES.owner, { color: 0xf2c94c }),
      admin: await findOrCreateRole(interaction.guild, ROLE_NAMES.admin, { color: 0xeb5757 }),
      member: await findOrCreateRole(interaction.guild, ROLE_NAMES.member, { color: 0x27ae60 }),
      guest: await findOrCreateRole(interaction.guild, ROLE_NAMES.guest, { color: 0x828282 })
    };

    const createdChannels = {};

    for (const categoryConfig of template.categories) {
      const categoryAccess = categoryConfig.adminOnly ? 'admin' : 'member';
      const category = await findOrCreateCategory(
        interaction.guild,
        categoryConfig.name,
        buildOverwrites(interaction.guild, roles, categoryAccess)
      );

      for (const channelConfig of categoryConfig.channels) {
        const access = getChannelAccess(categoryConfig, channelConfig);
        const channel = await findOrCreateTextChannel(
          interaction.guild,
          category,
          channelConfig,
          buildOverwrites(interaction.guild, roles, access)
        );
        createdChannels[channelConfig.key] = channel;
      }
    }

    if (createdChannels.rules) {
      await createdChannels.rules.send({ embeds: [buildRulesEmbed(template)] });
    }

    await interaction.editReply(
      `已完成「${template.label}」伺服器架構建立。\n` +
      '已建立或沿用分類、文字頻道、管理員後台、規則/公告/驗證頻道與基本角色。\n' +
      '安全提醒：此指令不會刪除既有頻道，也不會清空伺服器。'
    );
  }
};
