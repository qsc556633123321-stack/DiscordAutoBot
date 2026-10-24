function assertRepository(repository, method, name) {
  if (typeof repository?.[method] !== 'function') throw new TypeError(`${name} requires ${method}`);
  return repository;
}

function assertGuildRepository(repository) { return assertRepository(repository, 'findByDiscordGuildId', 'GuildRepository'); }
function assertGameRepository(repository) { return assertRepository(repository, 'findByCanonicalGameId', 'GameRepository'); }
function assertGuildGameRepository(repository) { return assertRepository(repository, 'listByGuildId', 'GuildGameRepository'); }
function assertChannelBindingRepository(repository) { return assertRepository(repository, 'listByGuildId', 'ChannelBindingRepository'); }
function assertRoleBindingRepository(repository) { return assertRepository(repository, 'listByGuildId', 'RoleBindingRepository'); }

module.exports = { assertChannelBindingRepository, assertGameRepository, assertGuildGameRepository, assertGuildRepository, assertRoleBindingRepository };
