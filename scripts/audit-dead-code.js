const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const TARGET_ROOTS = ['services', 'domain', 'infrastructure', 'core'];
const SOURCE_OF_TRUTH = new Set([
  'src/services/community/communityService.js',
  'src/services/community/communityPermissionService.js',
  'src/services/community/communityRebuildService.js',
  'src/services/games/gameCategoryService.js',
  'src/services/security/linkGuardService.js',
  'src/services/security/memberGuardService.js',
  'src/services/voice/voiceHubService.js',
  'src/domain/games/gameIdentityService.js',
]);

function jsFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? jsFiles(full) : entry.name.endsWith('.js') ? [full] : [];
  });
}

function relative(file) {
  return path.relative(ROOT, file).replace(/\\/g, '/');
}

function resolveImport(importer, request) {
  if (!request.startsWith('.')) return null;
  const base = path.resolve(path.dirname(importer), request);
  const candidates = [`${base}.js`, path.join(base, 'index.js')];
  return candidates.find((candidate) => fs.existsSync(candidate)) || null;
}

const sourceFiles = [...jsFiles(SRC), ...jsFiles(path.join(ROOT, 'scripts'))];
const targetFiles = TARGET_ROOTS.flatMap((dir) => jsFiles(path.join(SRC, dir)));
const incoming = new Map(targetFiles.map((file) => [path.resolve(file), []]));
const requirePattern = /require\(\s*['"]([^'"]+)['"]\s*\)/g;

for (const importer of sourceFiles) {
  const source = fs.readFileSync(importer, 'utf8');
  for (const match of source.matchAll(requirePattern)) {
    const resolved = resolveImport(importer, match[1]);
    if (resolved && incoming.has(path.resolve(resolved))) {
      incoming.get(path.resolve(resolved)).push(relative(importer));
    }
  }
}

const classification = { A: [], B: [], C: [], D: [] };
for (const file of targetFiles) {
  const name = relative(file);
  const references = incoming.get(path.resolve(file)) || [];
  if (SOURCE_OF_TRUTH.has(name)) classification.D.push({ name, references, reason: 'source of truth' });
  else if (references.length === 0) classification.A.push({ name, references, reason: 'unreferenced' });
  else if (references.every((ref) => ref.startsWith('src/legacy/'))) {
    classification.B.push({ name, references, reason: 'legacy-only' });
  } else if (references.every((ref) => ref.startsWith('src/tests/') || ref.startsWith('scripts/'))) {
    classification.C.push({ name, references, reason: 'test-only' });
  } else classification.D.push({ name, references, reason: 'active flow' });
}

const counts = {
  Service: jsFiles(path.join(SRC, 'services')).length,
  Domain: jsFiles(path.join(SRC, 'domain')).length,
  Infrastructure: jsFiles(path.join(SRC, 'infrastructure')).length,
  Core: jsFiles(path.join(SRC, 'core')).length,
  Legacy: jsFiles(path.join(SRC, 'legacy')).length,
  'Dead Module': classification.A.length,
};

console.log('Architecture Report');
for (const [label, count] of Object.entries(counts)) console.log(`${label}: ${count}`);
console.log('');

for (const key of ['A', 'B', 'C', 'D']) {
  console.log(`${key}: ${classification[key].length}`);
  for (const item of classification[key]) {
    const refs = item.references.length ? ` <- ${item.references.join(', ')}` : '';
    console.log(`  ${item.name} (${item.reason})${refs}`);
  }
}

if (classification.A.length > 0) {
  console.error('\nDead-code audit failed: completely unreferenced modules remain.');
  process.exitCode = 1;
}
