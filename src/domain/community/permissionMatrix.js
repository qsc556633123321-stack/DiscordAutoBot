const ROLE_INHERITANCE = Object.freeze({
  game: ['member'],
  dev: ['member'],
  invest: ['member'],
  creator: ['member'],
  night: ['member']
});

const CATEGORY_ACCESS = Object.freeze({
  entry: ['everyone', 'guest'],
  support: ['everyone', 'guest'],
  lobby: ['member'],
  game_center: ['member'],
  popular_games: ['game'],
  player_games: ['game'],
  interests: ['member'],
  knowledge: ['dev', 'invest'],
  night_crew: ['night'],
  events: ['member'],
  admin: ['owner', 'admin', 'mod'],
  game_archive: ['owner', 'admin', 'mod'],
  old_archive: ['owner', 'admin', 'mod'],
  dynamic_game: ['game']
});

const PERMISSION_PROFILE_ACCESS = Object.freeze({
  public_entry: ['everyone', 'guest'],
  public_readonly: ['everyone', 'guest'],
  formal_member: ['member'],
  formal_readonly: ['member'],
  game: ['game'],
  dev: ['dev'],
  invest: ['invest'],
  knowledge: ['dev', 'invest'],
  night: ['night'],
  admin: ['owner', 'admin', 'mod'],
  archive: ['owner', 'admin', 'mod']
});

function expandRoleKeys(roleKeys = []) {
  const expanded = new Set(roleKeys);
  const queue = [...expanded];
  while (queue.length) {
    const roleKey = queue.shift();
    for (const inherited of ROLE_INHERITANCE[roleKey] || []) {
      if (expanded.has(inherited)) continue;
      expanded.add(inherited);
      queue.push(inherited);
    }
  }
  return [...expanded];
}

function roleCanAccessCategory(roleKeys, categoryKey) {
  const expanded = new Set(expandRoleKeys(roleKeys));
  return (CATEGORY_ACCESS[categoryKey] || []).some((key) => expanded.has(key));
}

function directRoleKeysForProfile(profile) {
  const allowed = new Set(PERMISSION_PROFILE_ACCESS[profile] || []);
  for (const [roleKey, inherited] of Object.entries(ROLE_INHERITANCE)) {
    if (inherited.some((key) => allowed.has(key))) allowed.add(roleKey);
  }
  return [...allowed];
}

function directRoleKeysForCategory(categoryKey) {
  const allowed = new Set(CATEGORY_ACCESS[categoryKey] || []);
  for (const roleKey of Object.keys(ROLE_INHERITANCE)) {
    if (expandRoleKeys([roleKey]).some((key) => allowed.has(key))) allowed.add(roleKey);
  }
  return [...allowed];
}

function permissionProfileForCategory(categoryKey) {
  if (['entry', 'support'].includes(categoryKey)) return 'public_entry';
  if (['lobby', 'game_center', 'interests', 'events'].includes(categoryKey)) return 'formal_member';
  if (['popular_games', 'player_games', 'dynamic_game'].includes(categoryKey)) return 'game';
  if (categoryKey === 'knowledge') return 'knowledge';
  if (categoryKey === 'night_crew') return 'night';
  if (categoryKey === 'admin') return 'admin';
  if (['game_archive', 'old_archive'].includes(categoryKey)) return 'archive';
  return null;
}

module.exports = {
  CATEGORY_ACCESS,
  PERMISSION_PROFILE_ACCESS,
  ROLE_INHERITANCE,
  directRoleKeysForCategory,
  directRoleKeysForProfile,
  expandRoleKeys,
  permissionProfileForCategory,
  roleCanAccessCategory
};
