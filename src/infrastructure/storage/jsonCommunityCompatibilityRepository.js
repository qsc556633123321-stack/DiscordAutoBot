const path = require('node:path');
const { ok, fail } = require('../../core/result');
const { readJson } = require('./jsonStore');
const { findGameIdentity } = require('../../domain/games/gameIdentityService');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DEFAULT_FILES = Object.freeze({ layout: path.join(DATA_DIR, 'community-layout-registry.json'), roles: path.join(DATA_DIR, 'role-settings.json'), games: path.join(DATA_DIR, 'game-categories.json') });

function recordsForGuild(root, guildId) { return root && typeof root === 'object' && !Array.isArray(root) ? root[guildId] || {} : {}; }
function list(value) { return Array.isArray(value) ? value : Object.values(value && typeof value === 'object' ? value : {}); }

function createJsonCommunityCompatibilityReader({ files = DEFAULT_FILES, read = readJson } = {}) {
  return Object.freeze({
    readGuildData({ guildId } = {}) {
      try {
        const layout = recordsForGuild(read(files.layout, {}), guildId);
        const roles = recordsForGuild(read(files.roles, {}), guildId);
        const games = recordsForGuild(read(files.games, {}), guildId);
        const channelBindings = list(layout).map((item) => ({ discordGuildId: guildId, discordChannelId: item.channelId || item.discordChannelId || item.id || null, canonicalKey: item.canonicalKey || item.key || null, canonicalGameId: item.gameName ? findGameIdentity(item.gameName).id : item.canonicalGameId || null, source: 'json' })).filter((item) => item.discordChannelId || item.canonicalKey);
        const roleBindings = list(roles).map((item) => ({ discordGuildId: guildId, discordRoleId: item.roleId || item.discordRoleId || item.id || null, canonicalRoleKey: item.canonicalRoleKey || item.key || null, canonicalGameId: item.gameName ? findGameIdentity(item.gameName).id : item.canonicalGameId || null, source: 'json' })).filter((item) => item.discordRoleId || item.canonicalRoleKey);
        const guildGames = list(games).map((item) => ({ discordGuildId: guildId, canonicalGameId: findGameIdentity(item.gameName || item.name || item.canonicalGameId || '').id, source: 'json' }));
        return ok(Object.freeze({ source: 'json', guildId, channelBindings: Object.freeze(channelBindings), roleBindings: Object.freeze(roleBindings), guildGames: Object.freeze(guildGames) }));
      } catch (error) { return fail('JSON_COMPATIBILITY_READ_FAILED', 'Unable to read legacy community JSON', { cause: error.message }); }
    }
  });
}

module.exports = { DEFAULT_FILES, createJsonCommunityCompatibilityReader };
