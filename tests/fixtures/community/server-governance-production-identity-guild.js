const GAME_REGISTRY = require('../../../src/domain/games/gameRegistry');

function withoutPrefix(name) {
  return name.replace(/^[^\p{Letter}\p{Number}]+[｜|]\s*/u, '');
}

function createProductionIdentityChannels(desiredState) {
  const categories = desiredState.resources.filter((resource) => resource.type === 'category').map((resource, index) => ({ id: `category-${index}`, name: resource.key.startsWith('category:game:') ? resource.legacyNames[0] : resource.displayName, type: 'category', parentId: null, position: index, permissionOverwrites: { cache: new Map() }, managed: false }));
  const categoryIdByKey = new Map(categories.map((category, index) => [desiredState.resources.filter((resource) => resource.type === 'category')[index].key, category.id]));
  const children = desiredState.resources.filter((resource) => resource.type !== 'category').map((resource, index) => ({ id: `channel-${index}`, name: withoutPrefix(resource.displayName), type: resource.type, parentId: categoryIdByKey.get(resource.parentKey), position: index, permissionOverwrites: { cache: new Map() }, managed: false }));
  return [...categories, ...children,
    { id: 'runtime-voice', name: 'Temp Voice #1', type: 'voice', parentId: 'channel-3', position: 999, permissionOverwrites: { cache: new Map() }, managed: false },
    { id: 'unknown-user', name: '我的私人角落', type: 'text', parentId: null, position: 1000, permissionOverwrites: { cache: new Map() }, managed: false }
  ];
}

function createProductionIdentityRoles(roleNames) {
  const roles = new Map();
  let index = 0;
  for (const [key, name] of Object.entries(roleNames)) {
    if (['owner', 'admin', 'everyone'].includes(key)) continue;
    roles.set(`role-${index}`, { id: `role-${index}`, name, position: index, permissions: { has: () => false } });
    index += 1;
  }
  roles.set('ops-admin', { id: 'ops-admin', name: 'Production Operators', position: 999, permissions: { has: () => true } });
  return roles;
}

module.exports = { createProductionIdentityChannels, createProductionIdentityRoles, GAME_REGISTRY };
