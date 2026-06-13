const { PermissionFlagsBits } = require('discord.js');
const { ROLES } = require('../config/communityArchitectureV3');

const READ = [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory];
const USE = [...READ, PermissionFlagsBits.SendMessages, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak];

function findRole(guild, key) {
  const config = ROLES.find((role) => role.key === key);
  if (!config) return null;
  const names = new Set([config.name, ...(config.aliases || [])]);
  return guild.roles.cache.find((role) => names.has(role.name)) || null;
}

function botOverwrite(guild) {
  return {
    id: guild.members.me.id,
    allow: [...USE, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageMessages]
  };
}

function adminOverwrites(guild) {
  return ['owner', 'admin', 'mod'].map((key) => findRole(guild, key)).filter(Boolean).map((role) => ({
    id: role.id,
    allow: [...USE, PermissionFlagsBits.ManageChannels]
  }));
}

function roleAllows(guild, roleKeys, permissions = USE) {
  return roleKeys.map((key) => findRole(guild, key)).filter(Boolean).map((role) => ({
    id: role.id,
    allow: permissions
  }));
}

function hiddenBase(guild) {
  const guest = findRole(guild, 'guest');
  return [
    { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.MentionEveryone] },
    ...(guest ? [{ id: guest.id, deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.MentionEveryone] }] : []),
    botOverwrite(guild),
    ...adminOverwrites(guild)
  ];
}

function buildV3Overwrites(guild, permission = 'formal_member') {
  if (permission === 'public_entry') {
    return [
      {
        id: guild.roles.everyone.id,
        allow: USE,
        deny: [PermissionFlagsBits.MentionEveryone]
      },
      botOverwrite(guild),
      ...adminOverwrites(guild)
    ];
  }
  if (permission === 'public_readonly') {
    return [
      {
        id: guild.roles.everyone.id,
        allow: READ,
        deny: [
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.Connect,
          PermissionFlagsBits.Speak,
          PermissionFlagsBits.MentionEveryone
        ]
      },
      botOverwrite(guild),
      ...adminOverwrites(guild)
    ];
  }
  if (permission === 'formal_member' || permission === 'formal_readonly') {
    return [
      ...hiddenBase(guild),
      ...roleAllows(guild, ['member'], permission === 'formal_readonly' ? READ : USE)
    ];
  }
  if (permission === 'game') return [...hiddenBase(guild), ...roleAllows(guild, ['game'])];
  if (permission === 'dev') return [...hiddenBase(guild), ...roleAllows(guild, ['dev'])];
  if (permission === 'invest') return [...hiddenBase(guild), ...roleAllows(guild, ['invest'])];
  if (permission === 'knowledge') return [...hiddenBase(guild), ...roleAllows(guild, ['dev', 'invest'])];
  if (permission === 'night') return [...hiddenBase(guild), ...roleAllows(guild, ['night'])];
  if (permission === 'admin' || permission === 'archive') return hiddenBase(guild);
  return hiddenBase(guild);
}

module.exports = { buildV3Overwrites, findRole };
