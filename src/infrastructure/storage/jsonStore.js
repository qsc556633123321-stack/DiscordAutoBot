const fs = require('node:fs');
const path = require('node:path');

function ensureDirectory(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function readJson(filePath, defaultValue = {}) {
  try {
    if (!fs.existsSync(filePath)) return structuredClone(defaultValue);
    return JSON.parse(fs.readFileSync(filePath, 'utf8') || JSON.stringify(defaultValue));
  } catch {
    return structuredClone(defaultValue);
  }
}

function readJsonStrict(filePath, defaultValue = {}) {
  if (!fs.existsSync(filePath)) return structuredClone(defaultValue);
  return JSON.parse(fs.readFileSync(filePath, 'utf8') || JSON.stringify(defaultValue));
}

function writeJsonAtomic(filePath, data) {
  ensureDirectory(filePath);
  const temporaryPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(temporaryPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  fs.renameSync(temporaryPath, filePath);
  return data;
}

function updateJson(filePath, updater, defaultValue = {}) {
  const current = readJson(filePath, defaultValue);
  const next = updater(current) ?? current;
  return writeJsonAtomic(filePath, next);
}

module.exports = { readJson, readJsonStrict, updateJson, writeJsonAtomic };
