const path = require('node:path');
const { isSameKeyword } = require('../../domain/memory/channelRule');
const jsonStore = require('./jsonStore');

const DEFAULT_FILE_PATH = path.join(__dirname, '..', '..', 'data', 'server-memory.json');

function cloneRule(rule) {
  return rule ? { ...rule } : rule;
}

function assertStorageShape(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Invalid channel rule storage shape.');
  }
}

function getGuildMemory(data, guildId, { create = false } = {}) {
  const guildMemory = data[guildId];
  if (!guildMemory && create) {
    data[guildId] = { channelRules: [] };
    return data[guildId];
  }
  if (!guildMemory) return null;
  if (typeof guildMemory !== 'object' || Array.isArray(guildMemory) || !Array.isArray(guildMemory.channelRules)) {
    throw new Error(`Invalid channel rule storage shape for guild ${guildId}.`);
  }
  return guildMemory;
}

function createJsonChannelRuleRepository({ filePath = DEFAULT_FILE_PATH, store = jsonStore } = {}) {
  function readAll() {
    const data = store.readJsonStrict(filePath, {});
    assertStorageShape(data);
    return data;
  }

  function listByGuild(guildId) {
    const memory = getGuildMemory(readAll(), guildId);
    return memory ? memory.channelRules.map(cloneRule) : [];
  }

  return {
    listByGuild,
    findByKeyword(guildId, normalizedKeyword) {
      return listByGuild(guildId).find((rule) => isSameKeyword(rule.keyword, normalizedKeyword));
    },
    upsert(guildId, rule) {
      const data = readAll();
      const memory = getGuildMemory(data, guildId, { create: true });
      const index = memory.channelRules.findIndex((existing) => isSameKeyword(existing.keyword, rule.keyword));
      if (index >= 0) memory.channelRules[index] = cloneRule(rule);
      else memory.channelRules.push(cloneRule(rule));
      store.writeJsonAtomic(filePath, data);
      return cloneRule(rule);
    },
    deleteByKeyword(guildId, normalizedKeyword) {
      const data = readAll();
      const memory = getGuildMemory(data, guildId);
      if (!memory) return false;
      const before = memory.channelRules.length;
      memory.channelRules = memory.channelRules.filter((rule) => !isSameKeyword(rule.keyword, normalizedKeyword));
      const deleted = memory.channelRules.length !== before;
      if (deleted) store.writeJsonAtomic(filePath, data);
      return deleted;
    }
  };
}

module.exports = { DEFAULT_FILE_PATH, createJsonChannelRuleRepository };
