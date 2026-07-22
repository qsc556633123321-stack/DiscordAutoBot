const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { entries, getLegacyBoundaryAllowance } = require('../src/config/legacyBoundaryAllowlist');

const ROOT = path.join(__dirname, '..');
const RESTRICTED_ROOTS = ['src/application', 'src/domain', 'src/infrastructure', 'src/presentation', 'src/modules', 'src/services', 'src/systems'];

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : entry.name.endsWith('.js') ? [fullPath] : [];
  });
}

function relative(file) {
  return path.relative(ROOT, file).replace(/\\/g, '/');
}

function resolveLocal(fromFile, specifier) {
  if (!specifier.startsWith('.')) return null;
  const base = path.resolve(path.dirname(fromFile), specifier);
  return [`${base}.js`, path.join(base, 'index.js'), base]
    .find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile()) || null;
}

function localDependencies(file, source) {
  return [...source.matchAll(/require\(\s*['"]([^'"]+)['"]\s*\)/g)]
    .map((match) => resolveLocal(file, match[1]))
    .filter(Boolean)
    .map(relative);
}

const files = walk(path.join(ROOT, 'src'));
const seenAllowances = new Set();
const violations = [];

for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  const from = relative(file);
  if (from.startsWith('src/legacy/')) continue;
  for (const to of localDependencies(file, source)) {
    if (!to.startsWith('src/legacy/')) continue;
    const reason = getLegacyBoundaryAllowance(from, to);
    if (!reason) violations.push(`Unapproved legacy import: ${from} -> ${to}`);
    else seenAllowances.add(`${from}->${to}`);
  }

  const isRestricted = RESTRICTED_ROOTS.some((directory) => from.startsWith(`${directory}/`));
  if (isRestricted && from.startsWith('src/domain/')) {
    const forbidden = [
      [/require\(['"]discord\.js['"]\)/, 'discord.js'],
      [/require\(['"]node:fs['"]\)|require\(['"]fs['"]\)/, 'filesystem'],
      [/require\(['"]@supabase\/supabase-js['"]\)/, 'Supabase client'],
      [/process\.env/, 'process.env'],
      [/require\(['"][^'"]*infrastructure\//, 'infrastructure'],
      [/require\(['"][^'"]*presentation\//, 'presentation'],
      [/require\(['"][^'"]*legacy\//, 'legacy']
    ];
    for (const [pattern, label] of forbidden) {
      if (pattern.test(source)) violations.push(`Domain boundary violation (${label}): ${from}`);
    }
  }

  if (isRestricted && from.startsWith('src/application/')) {
    const forbidden = [
      [/require\(['"]discord\.js['"]\)/, 'discord.js'],
      [/process\.env/, 'process.env'],
      [/require\(['"][^'"]*presentation\//, 'presentation'],
      [/require\(['"][^'"]*legacy\//, 'legacy'],
      [/\.setName\(|\.setParent\(|\.delete\(|permissionOverwrites\./, 'Discord mutation']
    ];
    for (const [pattern, label] of forbidden) {
      if (pattern.test(source)) violations.push(`Application boundary violation (${label}): ${from}`);
    }
  }

  if (isRestricted && from.startsWith('src/presentation/') && /require\(['"][^'"]*legacy\//.test(source)) {
    violations.push(`Presentation must not import legacy directly: ${from}`);
  }
}

for (const [from, to, reason] of entries) {
  assert.ok(reason, `Allowlist reason missing for ${from} -> ${to}`);
  assert.ok(seenAllowances.has(`${from}->${to}`), `Stale legacy allowlist entry: ${from} -> ${to}`);
}

assert.deepEqual(violations, [], violations.join('\n'));
console.log(`Legacy boundary tests passed. Approved compatibility edges: ${entries.length}`);
