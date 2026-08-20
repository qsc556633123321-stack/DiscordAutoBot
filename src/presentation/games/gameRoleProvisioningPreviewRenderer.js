const { EmbedBuilder } = require('discord.js');

const FIELD_LIMIT = 1024;
const MAX_FIELDS = 25;

function splitLines(lines, empty = 'None') {
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

function conflictLine(conflict) {
  const legacy = conflict.legacyRoleName ? ' | legacy: ' + conflict.legacyRoleName : '';
  return conflict.gameId + ' | ' + conflict.roleName + ' | ' + conflict.code + legacy;
}

function addChunkedFields(embed, name, lines, empty) {
  for (const [index, value] of splitLines(lines, empty).entries()) {
    if (embed.data.fields?.length >= MAX_FIELDS) return;
    embed.addFields({ name: index === 0 ? name : name + ' (' + (index + 1) + ')', value });
  }
}

function renderGameRoleProvisioningPreview(preview) {
  const existing = Array.isArray(preview?.existing) ? preview.existing : [];
  const wouldCreate = Array.isArray(preview?.wouldCreate) ? preview.wouldCreate : [];
  const conflicts = Array.isArray(preview?.conflicts) ? preview.conflicts : [];
  const embed = new EmbedBuilder()
    .setColor(conflicts.length ? 0xf2c94c : 0x57f287)
    .setTitle('Game Role Provisioning Preview')
    .setDescription([
      'Existing: ' + existing.length,
      'Would Create: ' + wouldCreate.length,
      'Conflicts: ' + conflicts.length,
      conflicts.length ? '請先人工處理衝突。' : '✅ 可進入 Provisioning Execution'
    ].join('\n'));

  addChunkedFields(embed, 'Existing', existing.map((role) => role.roleName), 'None');
  addChunkedFields(embed, 'Would Create', wouldCreate.map((role) => role.roleName), 'None');

  const duplicate = conflicts.filter((conflict) => conflict.code === 'DUPLICATE_EXACT_ROLE_NAME');
  const legacy = conflicts.filter((conflict) => conflict.code === 'LEGACY_LIKE_ROLE_NAME');
  const other = conflicts.filter((conflict) => !duplicate.includes(conflict) && !legacy.includes(conflict));
  if (duplicate.length) addChunkedFields(embed, '重複正式 Role', duplicate.map(conflictLine), 'None');
  if (legacy.length) addChunkedFields(embed, '偵測到舊式遊戲 Role', legacy.map(conflictLine), 'None');
  if (other.length) addChunkedFields(embed, 'Other Conflicts', other.map(conflictLine), 'None');

  return Object.freeze({ embeds: [embed] });
}

module.exports = { renderGameRoleProvisioningPreview };
