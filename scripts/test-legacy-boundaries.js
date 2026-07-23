const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { entries, getLegacyBoundaryAllowance } = require('../src/config/legacyBoundaryAllowlist');

const ROOT = path.join(__dirname, '..');
const RESTRICTED_ROOTS = ['src/application', 'src/domain', 'src/infrastructure', 'src/presentation', 'src/modules', 'src/services', 'src/systems'];
const THIN_MEMBERGUARD_WRAPPERS = Object.freeze({
  'src/legacy/commands/memberguard-settings.js': "module.exports = require('../../presentation/commands/memberguardSettingsCommand');",
  'src/legacy/commands/memberguard-release.js': "module.exports = require('../../presentation/commands/memberguardReleaseCommand');"
});
const THIN_AUDIT_WRAPPERS = Object.freeze({
  'src/legacy/commands/dev-audit-commands.js': "module.exports = require('../../presentation/commands/devAuditCommandsCommand');"
});
const THIN_COMMUNITY_WRAPPERS = Object.freeze({
  'src/legacy/commands/community-about.js': "module.exports = require('../../presentation/commands/communityAboutCommand');",
  'src/legacy/commands/community-roadmap.js': "module.exports = require('../../presentation/commands/communityRoadmapCommand');"
});

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

for (const [relativePath, expectedSource] of Object.entries({ ...THIN_MEMBERGUARD_WRAPPERS, ...THIN_AUDIT_WRAPPERS, ...THIN_COMMUNITY_WRAPPERS })) {
  const source = fs.readFileSync(path.join(ROOT, relativePath), 'utf8').trim();
  const forbidden = [/discord\.js/, /memberGuardService/, /systems\/memberGuard/, /SlashCommandBuilder/, /interaction\.options/, /permissionOverwrites/, /roles\.(add|remove)/, /\.(reply|editReply|deferReply)\(/];
  if (source !== expectedSource) violations.push(`Legacy wrapper is not a direct presentation re-export: ${relativePath}`);
  if (source.split(/\r?\n/).length > 5) violations.push(`Legacy wrapper exceeds five lines: ${relativePath}`);
  for (const pattern of forbidden) {
    if (pattern.test(source)) violations.push(`Legacy wrapper contains forbidden runtime logic (${pattern}): ${relativePath}`);
  }
}

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
      [/require\(['"][^'"]*application\//, 'application'],
      [/require\(['"][^'"]*systems\//, 'systems'],
      [/require\(['"][^'"]*legacy\//, 'legacy']
    ];
    for (const [pattern, label] of forbidden) {
      if (pattern.test(source)) violations.push(`Domain boundary violation (${label}): ${from}`);
    }
  }

  if (isRestricted && from.startsWith('src/application/')) {
    const forbidden = [
      [/require\(['"]discord\.js['"]\)/, 'discord.js'],
      [/require\(['"]node:fs['"]\)|require\(['"]fs['"]\)/, 'filesystem'],
      [/require\(['"]node:path['"]\)|require\(['"]path['"]\)/, 'path'],
      [/process\.env/, 'process.env'],
      [/require\(['"][^'"]*presentation\//, 'presentation'],
      [/require\(['"][^'"]*legacy\//, 'legacy'],
      [/require\(['"][^'"]*systems\/serverMemory/, 'systems/serverMemory'],
      [/\.setName\(|\.setParent\(|\.delete\(|permissionOverwrites\./, 'Discord mutation']
    ];
    for (const [pattern, label] of forbidden) {
      if (pattern.test(source)) violations.push(`Application boundary violation (${label}): ${from}`);
    }
  }

  if (from.startsWith('src/application/memory/')) {
    const forbidden = [
      [/require\(['"][^'"]*infrastructure\//, 'infrastructure'],
      [/require\(['"][^'"]*presentation\//, 'presentation'],
      [/require\(['"][^'"]*legacy\//, 'legacy'],
      [/require\(['"][^'"]*systems\//, 'systems']
    ];
    for (const [pattern, label] of forbidden) {
      if (pattern.test(source)) violations.push(`Memory application boundary violation (${label}): ${from}`);
    }
  }

  if (from.startsWith('src/application/organizer/')) {
    const forbidden = [
      [/require\(['"][^'"]*systems\/serverMemory/, 'systems/serverMemory'],
      [/require\(['"][^'"]*infrastructure\/storage\/jsonChannelRuleRepository/, 'JSON repository'],
      [/require\(['"]discord\.js['"]\)/, 'discord.js'],
      [/require\(['"]node:fs['"]\)|require\(['"]fs['"]\)/, 'filesystem'],
      [/require\(['"]node:path['"]\)|require\(['"]path['"]\)/, 'path'],
      [/process\.env/, 'process.env'],
      [/require\(['"][^'"]*legacy\//, 'legacy']
    ];
    for (const [pattern, label] of forbidden) {
      if (pattern.test(source)) violations.push(`Organizer application boundary violation (${label}): ${from}`);
    }
  }

  if (from.startsWith('src/application/memberGuard/')) {
    const forbidden = [
      [/require\(['"]discord\.js['"]\)/, 'discord.js'],
      [/require\(['"]node:fs['"]\)|require\(['"]fs['"]\)/, 'filesystem'],
      [/require\(['"]node:path['"]\)|require\(['"]path['"]\)/, 'path'],
      [/process\.env/, 'process.env'],
      [/require\(['"][^'"]*infrastructure\//, 'infrastructure'],
      [/require\(['"][^'"]*presentation\//, 'presentation'],
      [/require\(['"][^'"]*legacy\//, 'legacy'],
      [/require\(['"][^'"]*systems\//, 'systems']
    ];
    for (const [pattern, label] of forbidden) {
      if (pattern.test(source)) violations.push(`MemberGuard application boundary violation (${label}): ${from}`);
    }
  }

  if (from.startsWith('src/application/audit/')) {
    const forbidden = [/require\(['"]discord\.js['"]\)/, /require\(['"]node:fs['"]\)|require\(['"]fs['"]\)/, /require\(['"]node:path['"]\)|require\(['"]path['"]\)/, /process\.env/, /require\(['"][^'"]*infrastructure\//, /require\(['"][^'"]*presentation\//, /require\(['"][^'"]*composition\//, /require\(['"][^'"]*legacy\//, /require\(['"][^'"]*systems\//];
    for (const pattern of forbidden) if (pattern.test(source)) violations.push(`Audit application boundary violation (${pattern}): ${from}`);
  }

  if (from.startsWith('src/application/community/')) {
    const forbidden = [/require\(['"]discord\.js['"]\)/, /require\(['"]node:fs['"]\)|require\(['"]fs['"]\)/, /require\(['"]node:path['"]\)|require\(['"]path['"]\)/, /process\.env/, /require\(['"][^'"]*infrastructure\//, /require\(['"][^'"]*presentation\//, /require\(['"][^'"]*composition\//, /require\(['"][^'"]*legacy\//, /require\(['"][^'"]*systems\//];
    for (const pattern of forbidden) if (pattern.test(source)) violations.push(`Community application boundary violation (${pattern}): ${from}`);
  }

  if (from.startsWith('src/domain/community/communityAbout')) {
    const forbidden = [/require\(['"]discord\.js['"]\)/, /require\(['"]node:fs['"]\)|require\(['"]fs['"]\)/, /require\(['"]node:path['"]\)|require\(['"]path['"]\)/, /process\.env/, /require\(['"][^'"]*application\//, /require\(['"][^'"]*infrastructure\//, /require\(['"][^'"]*presentation\//, /require\(['"][^'"]*composition\//, /require\(['"][^'"]*legacy\//, /require\(['"][^'"]*systems\//];
    for (const pattern of forbidden) if (pattern.test(source)) violations.push(`Community About domain boundary violation (${pattern}): ${from}`);
  }

  if (from.startsWith('src/domain/community/communityRoadmap')) {
    const forbidden = [/require\(['"]discord\.js['"]\)/, /require\(['"]node:fs['"]\)|require\(['"]fs['"]\)/, /require\(['"]node:path['"]\)|require\(['"]path['"]\)/, /process\.env/, /require\(['"][^'"]*application\//, /require\(['"][^'"]*infrastructure\//, /require\(['"][^'"]*presentation\//, /require\(['"][^'"]*composition\//, /require\(['"][^'"]*legacy\//, /require\(['"][^'"]*systems\//];
    for (const pattern of forbidden) if (pattern.test(source)) violations.push(`Community Roadmap domain boundary violation (${pattern}): ${from}`);
  }

  if (from.startsWith('src/presentation/commands/communityAbout')) {
    const forbidden = [/require\(['"][^'"]*infrastructure\//, /require\(['"][^'"]*legacy\//, /require\(['"][^'"]*systems\//, /require\(['"]node:fs['"]\)|require\(['"]fs['"]\)/, /require\(['"]node:path['"]\)|require\(['"]path['"]\)/];
    for (const pattern of forbidden) if (pattern.test(source)) violations.push(`Community About presentation boundary violation (${pattern}): ${from}`);
  }

  if (from.startsWith('src/presentation/commands/communityRoadmap')) {
    const forbidden = [/require\(['"][^'"]*infrastructure\//, /require\(['"][^'"]*legacy\//, /require\(['"][^'"]*systems\//, /require\(['"]node:fs['"]\)|require\(['"]fs['"]\)/, /require\(['"]node:path['"]\)|require\(['"]path['"]\)/];
    for (const pattern of forbidden) if (pattern.test(source)) violations.push(`Community Roadmap presentation boundary violation (${pattern}): ${from}`);
  }

  if (from.startsWith('src/domain/audit/')) {
    const forbidden = [/require\(['"]discord\.js['"]\)/, /require\(['"]node:fs['"]\)|require\(['"]fs['"]\)/, /require\(['"]node:path['"]\)|require\(['"]path['"]\)/, /process\.env/, /require\(['"][^'"]*application\//, /require\(['"][^'"]*infrastructure\//, /require\(['"][^'"]*presentation\//, /require\(['"][^'"]*composition\//, /require\(['"][^'"]*legacy\//, /require\(['"][^'"]*systems\//];
    for (const pattern of forbidden) if (pattern.test(source)) violations.push(`Audit domain boundary violation (${pattern}): ${from}`);
  }

  if (from.startsWith('src/presentation/commands/devAudit')) {
    const forbidden = [/require\(['"][^'"]*infrastructure\//, /require\(['"][^'"]*legacy\//, /require\(['"][^'"]*systems\//, /require\(['"]node:fs['"]\)|require\(['"]fs['"]\)/, /require\(['"]node:path['"]\)|require\(['"]path['"]\)/];
    for (const pattern of forbidden) if (pattern.test(source)) violations.push(`Audit presentation boundary violation (${pattern}): ${from}`);
  }

  if (from.startsWith('src/domain/memberGuard/')) {
    const forbidden = [
      [/require\(['"]discord\.js['"]\)/, 'discord.js'],
      [/require\(['"]node:fs['"]\)|require\(['"]fs['"]\)/, 'filesystem'],
      [/require\(['"][^'"]*application\//, 'application'],
      [/require\(['"][^'"]*infrastructure\//, 'infrastructure'],
      [/require\(['"][^'"]*presentation\//, 'presentation'],
      [/require\(['"][^'"]*composition\//, 'composition'],
      [/require\(['"][^'"]*legacy\//, 'legacy'],
      [/require\(['"][^'"]*systems\//, 'systems']
    ];
    for (const [pattern, label] of forbidden) {
      if (pattern.test(source)) violations.push(`MemberGuard domain boundary violation (${label}): ${from}`);
    }
  }

  if (from.startsWith('src/presentation/commands/memberguard')) {
    const forbidden = [
      [/require\(['"][^'"]*infrastructure\/storage\//, 'storage repository'],
      [/require\(['"][^'"]*systems\/memberGuard/, 'systems/memberGuard'],
      [/require\(['"][^'"]*legacy\//, 'legacy'],
      [/require\(['"]node:fs['"]\)|require\(['"]fs['"]\)/, 'filesystem'],
      [/require\(['"]node:path['"]\)|require\(['"]path['"]\)/, 'path']
    ];
    for (const [pattern, label] of forbidden) {
      if (pattern.test(source)) violations.push(`MemberGuard presentation boundary violation (${label}): ${from}`);
    }
  }

  if (isRestricted && from.startsWith('src/presentation/') && /require\(['"][^'"]*legacy\//.test(source)) {
    violations.push(`Presentation must not import legacy directly: ${from}`);
  }
  if (isRestricted && from.startsWith('src/presentation/')) {
    const forbidden = [
      [/require\(['"]node:fs['"]\)|require\(['"]fs['"]\)/, 'filesystem'],
      [/require\(['"]node:path['"]\)|require\(['"]path['"]\)/, 'path'],
      [/require\(['"][^'"]*systems\/serverMemory/, 'systems/serverMemory']
    ];
    for (const [pattern, label] of forbidden) {
      if (pattern.test(source)) violations.push(`Presentation boundary violation (${label}): ${from}`);
    }
  }
}

for (const [from, to, reason] of entries) {
  assert.ok(reason, `Allowlist reason missing for ${from} -> ${to}`);
  assert.ok(seenAllowances.has(`${from}->${to}`), `Stale legacy allowlist entry: ${from} -> ${to}`);
}

assert.deepEqual(violations, [], violations.join('\n'));
console.log(`Legacy boundary tests passed. Approved compatibility edges: ${entries.length}`);
