const { EmbedBuilder } = require('discord.js');

const FIELD_LIMIT = 1024;

function chunk(lines, empty = 'None') {
  if (!lines.length) return [empty];
  const chunks = [];
  let current = '';
  for (const line of lines) {
    const next = current ? current + '\n' + line : line;
    if (next.length > FIELD_LIMIT && current) {
      chunks.push(current);
      current = line.slice(0, FIELD_LIMIT);
    } else {
      current = next.slice(0, FIELD_LIMIT);
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

function addFields(embed, name, lines, empty) {
  for (const [index, value] of chunk(lines, empty).entries()) {
    if (embed.data.fields?.length >= 25) return;
    embed.addFields({ name: index ? name + ' (' + (index + 1) + ')' : name, value });
  }
}

function conflictLine(conflict) {
  const legacy = conflict.legacyRoleName ? ' | legacy: ' + conflict.legacyRoleName : '';
  return conflict.gameId + ' | ' + conflict.roleName + ' | ' + conflict.code + legacy;
}

function renderGameRoleProvisioningExecution({ status, preview = {}, result = {} } = {}) {
  const created = Array.isArray(result.created) ? result.created : [];
  const existing = Array.isArray(result.existing) ? result.existing : Array.isArray(preview.existing) ? preview.existing : [];
  const conflicts = Array.isArray(result.conflicts) ? result.conflicts : Array.isArray(preview.conflicts) ? preview.conflicts : [];
  const rolledBack = Array.isArray(result.rolledBack) ? result.rolledBack : [];
  const rollbackFailed = Array.isArray(result.rollbackFailed) ? result.rollbackFailed : [];
  const complete = status === 'complete';
  const counts = 'Created: ' + created.length + '\nExisting: ' + existing.length + '\nRolled Back: ' + rolledBack.length + '\nRollback Failed: ' + rollbackFailed.length;
  const embed = new EmbedBuilder()
    .setColor(complete ? 0x57f287 : status === 'blocked' ? 0xf2c94c : 0xed4245)
    .setTitle(complete ? '✅ Game Role Provisioning Complete' : status === 'nothing' ? 'Game Role Provisioning' : status === 'blocked' ? 'Game Role Provisioning Blocked' : 'Game Role Provisioning Failed');

  if (status === 'nothing') {
    embed.setDescription('✅ 所有遊戲身分組已存在，無需建立。');
  } else if (status === 'blocked') {
    embed.setDescription('Provisioning blocked by current role conflicts.');
  } else if (result.code === 'PERMISSION_DENIED') {
    embed.setDescription('Bot lacks ManageRoles.');
  } else if (result.code === 'CREATE_FAILED') {
    const failure = result.failure || {};
    embed.setDescription('Creation failed: ' + (failure.gameId || 'unknown') + ' | ' + (failure.code || 'CREATE_FAILED') + '\n' + counts);
  } else {
    embed.setDescription(counts);
  }

  if (created.length) addFields(embed, 'Created', created.map((role) => role.roleName + ' | ' + role.gameId), 'None');
  if (conflicts.length) addFields(embed, 'Conflicts', conflicts.map(conflictLine), 'None');
  if (rolledBack.length) addFields(embed, 'Rolled Back', rolledBack.map((role) => role.roleName + ' | ' + role.gameId), 'None');
  if (rollbackFailed.length) addFields(embed, 'Rollback Failed', rollbackFailed.map((role) => role.roleName + ' | ' + role.code), 'None');
  return Object.freeze({ embeds: [embed] });
}

module.exports = { renderGameRoleProvisioningExecution };
