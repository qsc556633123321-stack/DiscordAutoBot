/**
 * @typedef {Object} ChannelRuleRepository
 * @property {(guildId: string) => Array} listByGuild
 * @property {(guildId: string, normalizedKeyword: string) => Object|undefined} findByKeyword
 * @property {(guildId: string, rule: Object) => Object} upsert
 * @property {(guildId: string, normalizedKeyword: string) => boolean} deleteByKeyword
 */

module.exports = {};
