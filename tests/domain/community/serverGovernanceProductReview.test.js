const assert = require('node:assert/strict');
const { canRoleKeysAccessResource } = require('../../../src/domain/community/serverGovernanceAccessPolicy');
const { buildFullGuildDesiredState } = require('../../../src/domain/community/serverGovernanceDesiredState');

const resources = buildFullGuildDesiredState().resources;
function visible(roleKeys) {
  return {
    categories: resources.filter((resource) => resource.type === 'category' && canRoleKeysAccessResource(roleKeys, resource)).length,
    channels: resources.filter((resource) => resource.type !== 'category' && canRoleKeysAccessResource(roleKeys, resource)).length
  };
}

assert.deepEqual(visible(['guest']), { categories: 2, channels: 6 });
assert.deepEqual(visible(['member']), { categories: 4, channels: 7 });
assert.deepEqual(visible(['member', 'game']), { categories: 5, channels: 10 });
assert.deepEqual(visible(['member', 'game', 'game:league_of_legends']), { categories: 6, channels: 14 });
assert.deepEqual(visible(['member', 'game', 'game:league_of_legends', 'game:apex']), { categories: 7, channels: 18 });
assert.deepEqual(visible(['admin']), { categories: 16, channels: 43 });
console.log('Server governance product-review visibility tests passed.');
