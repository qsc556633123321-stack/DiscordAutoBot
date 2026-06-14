const { PermissionFlagsBits } = require('discord.js');
const architecture = require('../domain/community/communityArchitectureV3');
const { directRoleKeysForProfile } = require('../domain/community/permissionMatrix');

const VISIBILITY_TYPES = {
  publicEntry: 'public_entry',
  publicSocial: 'public_social',
  formalMemberVisible: 'formal_member_visible',
  roleRestricted: 'role_restricted',
  semiPublicReadonly: 'semi_public_readonly',
  privateAdmin: 'private_admin',
  hiddenSpecial: 'hidden_special',
  archive: 'archive'
};

function namesForRoleKeys(roleKeys) {
  return architecture.roles
    .filter((role) => roleKeys.includes(role.key))
    .flatMap((role) => [role.name, ...(role.aliases || [])]);
}

const ADMIN_ROLE_NAMES = namesForRoleKeys(['owner', 'admin', 'mod']);
const FORMAL_ROLE_NAMES = namesForRoleKeys(directRoleKeysForProfile('formal_member'));
const GUEST_ROLE_NAMES = namesForRoleKeys(['guest']);

function roleByName(guild, roleName) {
  return guild.roles.cache.find((role) => role.name === roleName) || null;
}

function rolesByNames(guild, names) {
  return names.map((name) => roleByName(guild, name)).filter(Boolean);
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
  return rolesByNames(guild, ADMIN_ROLE_NAMES).map((role) => ({
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

function guestDeny(guild) {
  const guestRole = rolesByNames(guild, GUEST_ROLE_NAMES)[0];
  return guestRole ? [{
    id: guestRole.id,
    deny: [
      PermissionFlagsBits.ViewChannel,
      PermissionFlagsBits.SendMessages,
      PermissionFlagsBits.Connect,
      PermissionFlagsBits.Speak,
      PermissionFlagsBits.MentionEveryone
    ]
  }] : [];
}

function buildVisibilityOverwrites(guild, rule = {}) {
  const visibilityType = rule.visibilityType || VISIBILITY_TYPES.publicEntry;
  const targetRole = rule.roleName ? roleByName(guild, rule.roleName) : null;
  const targetRoles = rolesByNames(guild, rule.roleNames || []);
  const specialRole = rule.specialRoleName ? roleByName(guild, rule.specialRoleName) : targetRole;
  const formalRoles = rolesByNames(guild, FORMAL_ROLE_NAMES);
  const everyoneId = guild.roles.everyone.id;
  const commonRead = [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory];
  const commonSend = [...commonRead, PermissionFlagsBits.SendMessages, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak];
  const overwrites = [botAllow(guild), ...adminAllows(guild)];

  if (visibilityType === VISIBILITY_TYPES.publicEntry) {
    overwrites.unshift({ id: everyoneId, allow: commonSend, deny: [PermissionFlagsBits.MentionEveryone] });
    return overwrites;
  }

  if (visibilityType === VISIBILITY_TYPES.semiPublicReadonly) {
    overwrites.unshift({
      id: everyoneId,
      allow: commonRead,
      deny: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak, PermissionFlagsBits.MentionEveryone]
    });
    return overwrites;
  }

  if ([VISIBILITY_TYPES.publicSocial, VISIBILITY_TYPES.formalMemberVisible].includes(visibilityType)) {
    overwrites.unshift({ id: everyoneId, deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.MentionEveryone] });
    overwrites.push(...guestDeny(guild));
    overwrites.push(...formalRoles.map((role) => ({ id: role.id, allow: commonSend })));
    return overwrites;
  }

  if (visibilityType === VISIBILITY_TYPES.roleRestricted) {
    overwrites.unshift({ id: everyoneId, deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.MentionEveryone] });
    overwrites.push(...guestDeny(guild));
    if (targetRole) overwrites.push({ id: targetRole.id, allow: commonSend });
    overwrites.push(...targetRoles.map((role) => ({ id: role.id, allow: commonSend })));
    return overwrites;
  }

  if (visibilityType === VISIBILITY_TYPES.hiddenSpecial) {
    overwrites.unshift({ id: everyoneId, deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.MentionEveryone] });
    overwrites.push(...guestDeny(guild));
    if (specialRole) overwrites.push({ id: specialRole.id, allow: commonSend });
    return overwrites;
  }

  if (visibilityType === VISIBILITY_TYPES.privateAdmin || visibilityType === VISIBILITY_TYPES.archive) {
    overwrites.unshift({
      id: everyoneId,
      deny: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.Connect,
        PermissionFlagsBits.Speak,
        PermissionFlagsBits.MentionEveryone
      ]
    });
    overwrites.push(...guestDeny(guild));
    return overwrites;
  }

  return buildVisibilityOverwrites(guild, { visibilityType: VISIBILITY_TYPES.publicEntry });
}

module.exports = {
  ADMIN_ROLE_NAMES,
  FORMAL_ROLE_NAMES,
  GUEST_ROLE_NAMES,
  VISIBILITY_TYPES,
  buildVisibilityOverwrites
};
