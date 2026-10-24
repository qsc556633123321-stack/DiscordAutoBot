const { ok, fail } = require('../../core/result');

function queryFailure(error) { return fail(error?.code === '42P01' ? 'DATABASE_NOT_READY' : 'DATABASE_QUERY_FAILED', 'Community database query failed', { code: error?.code || null, message: error?.message || 'Unknown database error' }); }
function mapChannel(row) { return Object.freeze({ discordGuildId: row.discord_guild_id, discordChannelId: row.discord_channel_id, canonicalKey: row.canonical_key, canonicalGameId: row.canonical_game_id || null, permissionFingerprint: row.permission_fingerprint || null, source: 'database' }); }
function mapRole(row) { return Object.freeze({ discordGuildId: row.discord_guild_id, discordRoleId: row.discord_role_id, canonicalRoleKey: row.canonical_role_key, canonicalGameId: row.canonical_game_id || null, source: 'database' }); }

function createSupabaseCommunityReadRepositories({ client } = {}) {
  const unavailable = () => fail('DATABASE_NOT_READY', 'Supabase community schema is not configured');
  const selectOne = async (table, column, value) => { if (!client) return unavailable(); try { const { data, error } = await client.from(table).select('*').eq(column, value).maybeSingle(); return error ? queryFailure(error) : ok(data); } catch (error) { return queryFailure(error); } };
  const selectMany = async (table, column, value, mapper = (row) => row) => { if (!client) return unavailable(); try { const { data, error } = await client.from(table).select('*').eq(column, value); return error ? queryFailure(error) : ok(Object.freeze((data || []).map(mapper))); } catch (error) { return queryFailure(error); } };
  return Object.freeze({
    guildRepository: Object.freeze({ findByDiscordGuildId: ({ guildId } = {}) => selectOne('guilds', 'discord_guild_id', guildId) }),
    gameRepository: Object.freeze({ findByCanonicalGameId: ({ canonicalGameId } = {}) => selectOne('games', 'canonical_game_id', canonicalGameId) }),
    guildGameRepository: Object.freeze({ listByGuildId: ({ guildId } = {}) => selectMany('guild_games', 'discord_guild_id', guildId) }),
    channelBindingRepository: Object.freeze({ listByGuildId: ({ guildId } = {}) => selectMany('channel_bindings', 'discord_guild_id', guildId, mapChannel) }),
    roleBindingRepository: Object.freeze({ listByGuildId: ({ guildId } = {}) => selectMany('role_bindings', 'discord_guild_id', guildId, mapRole) })
  });
}

function createSupabaseCommunityCompatibilityReader({ repositories = createSupabaseCommunityReadRepositories() } = {}) {
  return Object.freeze({ async readGuildData({ guildId } = {}) {
    const [channels, roles, games] = await Promise.all([
      repositories.channelBindingRepository.listByGuildId({ guildId }),
      repositories.roleBindingRepository.listByGuildId({ guildId }),
      repositories.guildGameRepository.listByGuildId({ guildId })
    ]);
    const failure = [channels, roles, games].find((result) => !result.ok);
    return failure || ok(Object.freeze({ source: 'database', guildId, channelBindings: channels.data, roleBindings: roles.data, guildGames: games.data }));
  } });
}

module.exports = { createSupabaseCommunityCompatibilityReader, createSupabaseCommunityReadRepositories };
