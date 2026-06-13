const path = require('node:path');
const { readJson, updateJson, writeJsonAtomic } = require('./jsonStore');

function createRegistryStore(filename) {
  const filePath = path.join(__dirname, '..', '..', 'data', filename);
  return {
    filePath,
    read: (fallback = {}) => readJson(filePath, fallback),
    update: (updater, fallback = {}) => updateJson(filePath, updater, fallback),
    write: (data) => writeJsonAtomic(filePath, data)
  };
}

module.exports = { createRegistryStore };
