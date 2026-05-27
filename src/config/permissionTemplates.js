const { PermissionFlagsBits } = require('discord.js');

const ROLE_NAMES = {
  game: '🎮 遊戲玩家',
  nightCrew: '🌙 Night Crew',
  dev: '🛠 開發/AI',
  invest: '📈 股票投資',
  admin: ['站長', '管理員', '👑 站長', '🛡 管理員', '🔧 MOD']
};

function roleByName(guild, roleName) {
  return guild.roles.cache.find((role) => role.name === roleName) || null;
}

function adminRoles(guild) {
  return guild.roles.cache.filter((role) => ROLE_NAMES.admin.includes(role.name));
}

function botAllow(guild) {
  return {
    id: guild.members.me.id,
    allow: [
      PermissionFlagsBits.ViewChannel,
      PermissionFlagsBits.SendMessages,
      PermissionFlagsBits.ReadMessageHistory,
      PermissionFlagsBits.Connect,
      PermissionFlagsBits.Speak,
      PermissionFlagsBits.ManageChannels,
      PermissionFlagsBits.ManageMessages
    ]
  };
}

function adminAllows(guild) {
  return adminRoles(guild).map((role) => ({
    id: role.id,
    allow: [
      PermissionFlagsBits.ViewChannel,
      PermissionFlagsBits.SendMessages,
      PermissionFlagsBits.ReadMessageHistory,
      PermissionFlagsBits.Connect,
      PermissionFlagsBits.Speak,
      PermissionFlagsBits.ManageChannels
    ]
  }));
}

function publicEntry(guild) {
  return [
    {
      id: guild.roles.everyone.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.Connect
      ],
      deny: [PermissionFlagsBits.MentionEveryone]
    },
    botAllow(guild),
    ...adminAllows(guild)
  ];
}

function onboardingVisible(guild) {
  return publicEntry(guild);
}

function semiPublic(guild) {
  const gameRole = roleByName(guild, ROLE_NAMES.game);
  return [
    {
      id: guild.roles.everyone.id,
      deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.MentionEveryone]
    },
    botAllow(guild),
    ...adminAllows(guild),
    ...(gameRole ? [{
      id: gameRole.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.Connect,
        PermissionFlagsBits.Speak
      ]
    }] : [])
  ];
}

function roleRestricted(guild, roleName) {
  const role = roleByName(guild, roleName);
  return [
    {
      id: guild.roles.everyone.id,
      deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.MentionEveryone]
    },
    botAllow(guild),
    ...adminAllows(guild),
    ...(role ? [{
      id: role.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.Connect,
        PermissionFlagsBits.Speak
      ]
    }] : [])
  ];
}

function nightCrew(guild) {
  return roleRestricted(guild, ROLE_NAMES.nightCrew);
}

function adminOnly(guild) {
  return [
    {
      id: guild.roles.everyone.id,
      deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.MentionEveryone]
    },
    botAllow(guild),
    ...adminAllows(guild)
  ];
}

module.exports = {
  ROLE_NAMES,
  adminOnly,
  nightCrew,
  onboardingVisible,
  publicEntry,
  roleRestricted,
  semiPublic
};
