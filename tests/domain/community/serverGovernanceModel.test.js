const assert = require('node:assert/strict');
const { ChannelLifecycle, ChannelOwnership, ChannelPurpose, GovernanceAction, PERMISSION_PROFILE_CAPABILITIES, PermissionProfile, createGovernedResource } = require('../../../src/domain/community/channelGovernance');
const { canRoleKeysAccessResource } = require('../../../src/domain/community/serverGovernanceAccessPolicy');
const { getGameLayoutProfile } = require('../../../src/domain/games/gameLayoutProfiles');
const GAME_REGISTRY = require('../../../src/domain/games/gameRegistry');

assert.equal(ChannelPurpose.TICKET, 'ticket');
assert.equal(ChannelOwnership.MANAGED_RUNTIME, 'MANAGED_RUNTIME');
assert.equal(ChannelLifecycle.TEMPORARY, 'temporary');
assert.equal(Object.values(GovernanceAction).some((action) => action.includes('ARCHIVE')), false);
assert.deepEqual(Object.keys(PERMISSION_PROFILE_CAPABILITIES.public_entry), ['ViewChannel', 'SendMessages', 'Connect', 'Speak']);
assert.equal(getGameLayoutProfile('full').length, 4);
assert.equal(getGameLayoutProfile('compact').length, 2);
assert.equal(getGameLayoutProfile('voice_only').length, 1);
assert.deepEqual(GAME_REGISTRY.reduce((total, game) => ({ ...total, [game.layoutProfile]: (total[game.layoutProfile] || 0) + 1 }), {}), { full: 4, compact: 3, voice_only: 3 });
const specific = createGovernedResource({ key: 'category:game:valorant', displayName: '🎮｜VALORANT', type: 'category', purpose: ChannelPurpose.GAME_CENTER, owner: ChannelOwnership.MANAGED_CANONICAL, accessProfile: PermissionProfile.SPECIFIC_GAME, accessRoleKey: 'game:valorant', lifecycle: ChannelLifecycle.PERSISTENT, deletePolicy: 'managed_only' });
assert.equal(canRoleKeysAccessResource(['game'], specific), false);
assert.equal(canRoleKeysAccessResource(['game:valorant'], specific), true);
console.log('Server governance domain model tests passed.');
