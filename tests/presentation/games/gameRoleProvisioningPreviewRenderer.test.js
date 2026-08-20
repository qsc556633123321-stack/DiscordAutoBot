const assert = require('node:assert/strict');
const { renderGameRoleProvisioningPreview } = require('../../../src/presentation/games/gameRoleProvisioningPreviewRenderer');

function field(embed, name) {
  return embed.fields.find((item) => item.name === name);
}

const clear = renderGameRoleProvisioningPreview({
  existing: [{ roleName: '🎯 VALORANT' }],
  wouldCreate: [{ roleName: '🔫 APEX' }],
  conflicts: []
}).embeds[0].toJSON();

assert.equal(clear.title, 'Game Role Provisioning Preview');
assert.match(clear.description, /Existing: 1/);
assert.match(clear.description, /Would Create: 1/);
assert.match(clear.description, /Conflicts: 0/);
assert.match(clear.description, /可進入 Provisioning Execution/);
assert.equal(field(clear, 'Existing').value, '🎯 VALORANT');
assert.equal(field(clear, 'Would Create').value, '🔫 APEX');

const conflicts = renderGameRoleProvisioningPreview({
  existing: [],
  wouldCreate: [],
  conflicts: [
    { gameId: 'valorant', roleName: '🎯 VALORANT', code: 'DUPLICATE_EXACT_ROLE_NAME' },
    { gameId: 'apex', roleName: '🔫 APEX', legacyRoleName: 'APEX', code: 'LEGACY_LIKE_ROLE_NAME' }
  ]
}).embeds[0].toJSON();

assert.match(field(conflicts, '重複正式 Role').value, /DUPLICATE_EXACT_ROLE_NAME/);
assert.match(field(conflicts, '偵測到舊式遊戲 Role').value, /legacy: APEX/);
assert.equal(conflicts.description.includes('可進入 Provisioning Execution'), false);

const long = renderGameRoleProvisioningPreview({
  existing: Array.from({ length: 60 }, (_, index) => ({ roleName: 'R' + index + '-' + 'x'.repeat(50) })),
  wouldCreate: [],
  conflicts: []
}).embeds[0].toJSON();
assert.ok(long.fields.every((item) => item.value.length <= 1024));
assert.ok(long.fields.length <= 25);
console.log('Game role preview renderer tests passed.');
