const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const DOCS = path.join(ROOT, 'docs');
const GRAPH_FILE = path.join(ROOT, 'dependency-graph.json');
const REPORT_FILE = path.join(DOCS, 'DEPENDENCY_GRAPH.md');

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : entry.name.endsWith('.js') ? [full] : [];
  });
}

function rel(file) {
  return path.relative(ROOT, file).replace(/\\/g, '/');
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function resolveLocal(fromFile, specifier) {
  if (!specifier.startsWith('.')) return null;
  const base = path.resolve(path.dirname(fromFile), specifier);
  const candidates = [
    `${base}.js`,
    path.join(base, 'index.js'),
    base
  ];
  return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile()) || null;
}

function classify(file) {
  const name = rel(file);
  if (name.startsWith('src/commands/') || name.startsWith('src/legacy/commands/')) return 'command';
  if (name.startsWith('src/modules/commands/')) return 'router';
  if (name.startsWith('src/events/')) return 'event';
  if (name.startsWith('src/services/')) return 'service';
  if (name.startsWith('src/domain/')) return 'domain';
  if (name.includes('Repository.js') || name.includes('Writer.js') || name.includes('Store.js') || name.endsWith('/jsonStore.js')) return 'repository';
  if (name.startsWith('src/infrastructure/')) return 'infrastructure';
  if (name.startsWith('src/core/')) return 'core';
  if (name.startsWith('src/utils/')) return 'util';
  if (name.startsWith('src/systems/')) return 'system';
  if (name.startsWith('src/config/')) return 'config';
  if (name.startsWith('src/adapters/')) return 'adapter';
  if (name.startsWith('src/legacy/')) return 'legacy';
  return 'other';
}

const layerRank = {
  command: 0,
  router: 0,
  event: 0,
  adapter: 0,
  service: 1,
  system: 1,
  domain: 2,
  config: 2,
  core: -1,
  repository: 3,
  infrastructure: 4,
  util: 4,
  legacy: 5,
  other: 5
};

function parseDeps(source) {
  const deps = [];
  const patterns = [
    /require\(\s*['"]([^'"]+)['"]\s*\)/g,
    /import\s+(?:[^'"]+\s+from\s+)?['"]([^'"]+)['"]/g,
    /export\s+(?:\*|\{[^}]*\})\s+from\s+['"]([^'"]+)['"]/g
  ];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) deps.push(match[1]);
  }
  return [...new Set(deps)];
}

function countExports(source) {
  return {
    moduleExports: (source.match(/module\.exports/g) || []).length,
    exportsDot: (source.match(/\bexports\./g) || []).length,
    esExports: (source.match(/\bexport\s+(?:async\s+)?(?:function|const|class|\{|\*)/g) || []).length
  };
}

function lineCount(source) {
  return source.split(/\r?\n/).length;
}

function hasAny(source, patterns) {
  return patterns.filter((pattern) => pattern.test(source)).map((pattern) => pattern.source);
}

function findCycles(nodes, adjacency) {
  const cycles = [];
  const seen = new Set();
  const stack = [];
  const inStack = new Set();
  const visited = new Set();

  function canonical(cycle) {
    const body = cycle.slice(0, -1);
    const rotations = body.map((_, index) => body.slice(index).concat(body.slice(0, index)));
    rotations.sort((a, b) => a.join('|').localeCompare(b.join('|')));
    return `${rotations[0].join('|')}|${rotations[0][0]}`;
  }

  function dfs(node) {
    visited.add(node);
    stack.push(node);
    inStack.add(node);
    for (const next of adjacency.get(node) || []) {
      if (!adjacency.has(next)) continue;
      if (!visited.has(next)) dfs(next);
      else if (inStack.has(next)) {
        const start = stack.indexOf(next);
        const cycle = stack.slice(start).concat(next);
        const key = canonical(cycle);
        if (!seen.has(key)) {
          seen.add(key);
          cycles.push(cycle);
        }
      }
    }
    stack.pop();
    inStack.delete(node);
  }

  for (const node of nodes) if (!visited.has(node)) dfs(node);
  return cycles;
}

function serviceChains(nodes, adjacency, meta) {
  const serviceNodes = nodes.filter((node) => meta.get(node).type === 'service');
  const chains = [];
  let maxDepth = 0;

  function dfs(node, pathSoFar) {
    maxDepth = Math.max(maxDepth, pathSoFar.length);
    const nextServices = (adjacency.get(node) || []).filter((next) => meta.get(next)?.type === 'service');
    if (!nextServices.length && pathSoFar.length > 1) chains.push(pathSoFar);
    for (const next of nextServices) {
      if (pathSoFar.includes(next)) continue;
      dfs(next, pathSoFar.concat(next));
    }
  }

  for (const node of serviceNodes) dfs(node, [node]);
  return {
    maxDepth,
    chains: chains.filter((chain) => chain.length > 2)
  };
}

function topBy(items, count, selector) {
  return [...items].sort((a, b) => selector(b) - selector(a)).slice(0, count);
}

function section(title, rows) {
  if (!rows.length) return `## ${title}\n\nNone.\n`;
  return `## ${title}\n\n${rows.join('\n')}\n`;
}

function main() {
  ensureDir(DOCS);
  const files = walk(SRC);
  const fileSet = new Set(files.map((file) => path.resolve(file)));
  const meta = new Map();
  const adjacency = new Map();
  const edges = [];
  const externalDependencies = new Map();
  const violations = {
    commandDiscordApi: [],
    serviceJson: [],
    domainInfrastructure: [],
    reverseLayer: []
  };

  const commandApiPatterns = [
    /\bguild\.channels\.create\b/,
    /\binteraction\.guild\.channels\.create\b/,
    /\bguild\.roles\.create\b/,
    /\binteraction\.guild\.roles\.create\b/,
    /\b(?:channel|category|role)\.setName\b/,
    /\b(?:channel|category)\.setParent\b/,
    /\bpermissionOverwrites\.(?:set|edit|create)\b/,
    /\b(?:channel|category|role)\.delete\(/,
    /\bchannel\.bulkDelete\b/
  ];
  const serviceJsonPatterns = [
    /fs\.(?:readFileSync|writeFileSync|promises\.readFile|promises\.writeFile)\b/,
    /require\(['"][^'"]*\/data\/[^'"]+\.json['"]\)/
  ];

  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    const name = rel(file);
    const type = classify(file);
    const deps = parseDeps(source);
    const local = [];
    const external = [];
    for (const dep of deps) {
      const resolved = resolveLocal(file, dep);
      if (resolved && fileSet.has(path.resolve(resolved))) {
        local.push(rel(resolved));
        edges.push({ from: name, to: rel(resolved), specifier: dep });
      } else {
        external.push(dep);
        externalDependencies.set(dep, (externalDependencies.get(dep) || 0) + 1);
      }
    }
    meta.set(name, {
      file: name,
      type,
      lines: lineCount(source),
      dependencyCount: local.length + external.length,
      localDependencyCount: local.length,
      externalDependencyCount: external.length,
      exports: countExports(source)
    });
    adjacency.set(name, local);

    if (type === 'command') {
      const matches = hasAny(source, commandApiPatterns);
      if (matches.length) violations.commandDiscordApi.push({ file: name, matches });
    }
    if (type === 'service') {
      const matches = hasAny(source, serviceJsonPatterns);
      if (matches.length) violations.serviceJson.push({ file: name, matches });
    }
  }

  for (const edge of edges) {
    const from = meta.get(edge.from);
    const to = meta.get(edge.to);
    if (!from || !to) continue;
    if (from.type === 'domain' && ['repository', 'infrastructure'].includes(to.type)) {
      violations.domainInfrastructure.push(edge);
    }
    const fromRank = layerRank[from.type] ?? 9;
    const toRank = layerRank[to.type] ?? 9;
    const isEntrypoint = ['src/index.js', 'src/deploy-commands.js'].includes(edge.from);
    const isTestFixture = edge.from.startsWith('src/tests/');
    const isCoreDependency = to.type === 'core';
    const isLegacyContext = from.type === 'legacy' || to.type === 'legacy';
    if (fromRank > toRank && !isEntrypoint && !isTestFixture && !isCoreDependency && !isLegacyContext) {
      violations.reverseLayer.push({
        ...edge,
        fromType: from.type,
        toType: to.type
      });
    }
  }

  const cycles = findCycles([...meta.keys()], adjacency);
  const serviceChain = serviceChains([...meta.keys()], adjacency, meta);
  const dependencyCount = edges.length;
  const activeCommandDiscordApi = violations.commandDiscordApi.filter((item) => !item.file.startsWith('src/legacy/'));
  const legacyCommandDiscordApi = violations.commandDiscordApi.filter((item) => item.file.startsWith('src/legacy/'));
  const architecturePenalty =
    cycles.length * 8 +
    serviceChain.chains.length * 5 +
    activeCommandDiscordApi.length * 4 +
    violations.serviceJson.length * 4 +
    violations.domainInfrastructure.length * 8 +
    violations.reverseLayer.length * 2;
  const architectureScore = Math.max(0, 100 - architecturePenalty);

  const byType = [...meta.values()].reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {});
  const topDependencies = topBy(meta.values(), 10, (item) => item.localDependencyCount)
    .map((item) => ({ file: item.file, type: item.type, dependencies: item.localDependencyCount, lines: item.lines }));
  const fattestByType = (type) => topBy([...meta.values()].filter((item) => item.type === type), 1, (item) => item.lines)[0] || null;
  const servicesByLines = topBy([...meta.values()].filter((item) => item.type === 'service'), 10, (item) => item.lines)
    .map((item) => ({ file: item.file, lines: item.lines, dependencies: item.localDependencyCount }));
  const refactorCandidates = [
    ...cycles.map((cycle) => ({ reason: 'Circular dependency', target: cycle.join(' -> '), score: 100 })),
    ...violations.domainInfrastructure.map((edge) => ({ reason: 'Domain depends on infrastructure', target: `${edge.from} -> ${edge.to}`, score: 95 })),
    ...violations.commandDiscordApi.map((item) => ({ reason: 'Command directly uses Discord API', target: item.file, score: 85 })),
    ...violations.serviceJson.map((item) => ({ reason: 'Service directly reads/writes JSON', target: item.file, score: 80 })),
    ...serviceChain.chains.map((chain) => ({ reason: 'Service-to-service chain over two layers', target: chain.join(' -> '), score: 75 })),
    ...topDependencies.slice(0, 10).map((item) => ({ reason: 'High dependency count', target: item.file, score: Math.min(70, item.dependencies * 5) }))
  ]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  const graph = {
    generatedAt: new Date().toISOString(),
    summary: {
      fileCount: files.length,
      dependencyCount,
      circularCount: cycles.length,
      serviceChainMaxDepth: serviceChain.maxDepth,
      serviceChainOverTwoCount: serviceChain.chains.length,
      architectureScore,
      activeCommandDiscordApiCount: activeCommandDiscordApi.length,
      legacyCommandDiscordApiCount: legacyCommandDiscordApi.length,
      byType
    },
    nodes: [...meta.values()],
    edges,
    externalDependencies: Object.fromEntries([...externalDependencies.entries()].sort((a, b) => b[1] - a[1])),
    circularDependencies: cycles,
    serviceChains: serviceChain.chains,
    violations,
    rankings: {
      refactorTop10: refactorCandidates,
      dependencyTop10: topDependencies,
      servicesByLines,
      largest: {
        service: fattestByType('service'),
        command: fattestByType('command'),
        event: fattestByType('event'),
        router: fattestByType('router'),
        util: fattestByType('util')
      }
    }
  };

  fs.writeFileSync(GRAPH_FILE, `${JSON.stringify(graph, null, 2)}\n`);

  const cycleRows = cycles.slice(0, 20).map((cycle) => `- ${cycle.join(' -> ')}`);
  const serviceRows = serviceChain.chains.slice(0, 20).map((chain) => `- ${chain.join(' -> ')}`);
  const commandRows = violations.commandDiscordApi.map((item) => `- ${item.file}: ${item.matches.join(', ')}`);
  const jsonRows = violations.serviceJson.map((item) => `- ${item.file}: ${item.matches.join(', ')}`);
  const domainRows = violations.domainInfrastructure.map((edge) => `- ${edge.from} -> ${edge.to}`);
  const reverseRows = violations.reverseLayer.slice(0, 30).map((edge) => `- ${edge.from} (${edge.fromType}) -> ${edge.to} (${edge.toType})`);
  const refactorRows = refactorCandidates.map((item, index) => `${index + 1}. ${item.reason}: \`${item.target}\``);
  const depRows = topDependencies.map((item, index) => `${index + 1}. \`${item.file}\` - ${item.dependencies} local deps, ${item.lines} lines`);
  const serviceFatRows = servicesByLines.map((item, index) => `${index + 1}. \`${item.file}\` - ${item.lines} lines, ${item.dependencies} local deps`);

  const report = `# Dependency Graph

Generated: ${graph.generatedAt}

## Summary

- JS files scanned: ${files.length}
- Local dependency edges: ${dependencyCount}
- Circular dependencies: ${cycles.length}
- Service chain max depth: ${serviceChain.maxDepth}
- Service chains over two layers: ${serviceChain.chains.length}
- Active command direct Discord API usage: ${activeCommandDiscordApi.length}
- Legacy command direct Discord API usage: ${legacyCommandDiscordApi.length}
- Architecture score: ${architectureScore} / 100

## Architecture Rules

Allowed direction:

\`\`\`
Command -> Service -> Domain -> Repository -> Infrastructure
\`\`\`

Reverse dependencies are flagged when a lower layer imports upward. Legacy relationships are included when they still affect the active compatibility path.

${section('Circular Dependencies', cycleRows)}
${section('Service Chains Over Two Layers', serviceRows)}
${section('Command Direct Discord API Usage', commandRows)}
${section('Service Direct JSON Access', jsonRows)}
${section('Domain Depends On Infrastructure', domainRows)}
${section('Reverse Layer Dependencies', reverseRows)}
## Architecture Score

Score: ${architectureScore} / 100

Penalty model:

- Circular dependency: -8 each
- Service chain over two layers: -5 each
- Active command direct Discord API usage: -4 each
- Legacy command direct Discord API usage: tracked in burn-down, not active score
- Service direct JSON access: -4 each
- Domain depends on infrastructure: -8 each
- Reverse layer dependency: -2 each

## Top 10 Refactor Candidates

${refactorRows.length ? refactorRows.join('\n') : 'None.'}

## Top 10 Dependency Count

${depRows.length ? depRows.join('\n') : 'None.'}

## Fattest Services

${serviceFatRows.length ? serviceFatRows.join('\n') : 'None.'}

## Largest Files By Role

- Service: ${graph.rankings.largest.service ? `\`${graph.rankings.largest.service.file}\` (${graph.rankings.largest.service.lines} lines)` : 'None'}
- Command: ${graph.rankings.largest.command ? `\`${graph.rankings.largest.command.file}\` (${graph.rankings.largest.command.lines} lines)` : 'None'}
- Event: ${graph.rankings.largest.event ? `\`${graph.rankings.largest.event.file}\` (${graph.rankings.largest.event.lines} lines)` : 'None'}
- Router: ${graph.rankings.largest.router ? `\`${graph.rankings.largest.router.file}\` (${graph.rankings.largest.router.lines} lines)` : 'None'}
- Util: ${graph.rankings.largest.util ? `\`${graph.rankings.largest.util.file}\` (${graph.rankings.largest.util.lines} lines)` : 'None'}

## Type Counts

${Object.entries(byType).sort((a, b) => a[0].localeCompare(b[0])).map(([type, count]) => `- ${type}: ${count}`).join('\n')}

## Graph Artifact

Full machine-readable graph: \`dependency-graph.json\`
`;

  fs.writeFileSync(REPORT_FILE, report);
  console.log(`Dependency graph written to ${rel(GRAPH_FILE)}`);
  console.log(`Report written to ${rel(REPORT_FILE)}`);
  console.log(`Architecture score: ${architectureScore}/100`);
  console.log(`Circular dependencies: ${cycles.length}`);
  if (cycles.length > 0) {
    process.exitCode = 1;
  }
}

main();
