const fs = require('node:fs');
const path = require('node:path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const MEMORY_FILE = path.join(DATA_DIR, 'server-memory.json');

function ensureMemoryFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(MEMORY_FILE)) {
      fs.writeFileSync(MEMORY_FILE, '{}', 'utf8');
    }
  } catch (error) {
    throw new Error(`無法建立伺服器記憶檔案：${error.message}`);
  }
}

function readMemory() {
  ensureMemoryFile();

  try {
    const raw = fs.readFileSync(MEMORY_FILE, 'utf8');
    const parsed = JSON.parse(raw || '{}');
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('server-memory.json 格式必須是 JSON object');
    }
    return parsed;
  } catch (error) {
    throw new Error(`讀取伺服器記憶失敗，請檢查 src/data/server-memory.json 是否為有效 JSON：${error.message}`);
  }
}

function writeMemory(memory) {
  ensureMemoryFile();

  try {
    fs.writeFileSync(MEMORY_FILE, `${JSON.stringify(memory, null, 2)}\n`, 'utf8');
  } catch (error) {
    throw new Error(`寫入伺服器記憶失敗：${error.message}`);
  }
}

function getGuildMemory(memory, guildId) {
  if (!memory[guildId]) {
    memory[guildId] = { channelRules: [] };
  }

  if (!Array.isArray(memory[guildId].channelRules)) {
    memory[guildId].channelRules = [];
  }

  return memory[guildId];
}

function upsertChannelRule(guildId, { keyword, category, weight }) {
  const normalizedKeyword = keyword.trim();
  if (!normalizedKeyword) {
    throw new Error('keyword 不能是空白。');
  }

  const memory = readMemory();
  const guildMemory = getGuildMemory(memory, guildId);
  const existing = guildMemory.channelRules.find(
    (rule) => rule.keyword.toLowerCase() === normalizedKeyword.toLowerCase()
  );

  const nextRule = {
    keyword: normalizedKeyword,
    category,
    weight,
    createdAt: existing ? existing.createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (existing) {
    Object.assign(existing, nextRule);
  } else {
    guildMemory.channelRules.push(nextRule);
  }

  writeMemory(memory);
  return nextRule;
}

function listChannelRules(guildId) {
  const memory = readMemory();
  const guildMemory = getGuildMemory(memory, guildId);

  return guildMemory.channelRules;
}

function deleteChannelRule(guildId, keyword) {
  const normalizedKeyword = keyword.trim();
  const memory = readMemory();
  const guildMemory = getGuildMemory(memory, guildId);
  const before = guildMemory.channelRules.length;

  guildMemory.channelRules = guildMemory.channelRules.filter(
    (rule) => rule.keyword.toLowerCase() !== normalizedKeyword.toLowerCase()
  );

  const deleted = guildMemory.channelRules.length !== before;
  if (deleted) {
    writeMemory(memory);
  }

  return deleted;
}

module.exports = {
  deleteChannelRule,
  listChannelRules,
  readMemory,
  upsertChannelRule
};
