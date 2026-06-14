const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const { getCommandRegistry } = require('../src/modules/commands/commandRegistry');
const DOC_FILES = [
  path.join(ROOT, 'README.md'),
  path.join(ROOT, 'docs', 'COMMANDS.md')
];

function commandNamesFromDocs() {
  const names = new Set();
  for (const file of DOC_FILES) {
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, 'utf8');
    for (const match of content.matchAll(/(?<![a-z0-9_.-])\/([a-z][a-z0-9-]{1,31})\b/g)) names.add(match[1]);
  }
  return names;
}

function auditCommands() {
  const registry = getCommandRegistry();
  const implemented = new Map();
  const invalid = [];
  for (const [name, command] of registry) {
    try {
      if (!command.data?.name || typeof command.execute !== 'function') {
        invalid.push({ file: name, reason: 'Missing SlashCommandBuilder data/name or execute().' });
        continue;
      }
      implemented.set(command.data.name, command.main ? 'main' : 'alias');
    } catch (error) {
      invalid.push({ file: name, reason: error.message });
    }
  }

  const documented = commandNamesFromDocs();
  const documentedOnly = [...documented].filter((name) => !implemented.has(name)).sort();
  const undocumented = [...implemented.keys()].filter((name) => !documented.has(name)).sort();
  return {
    implemented: [...implemented.keys()].sort(),
    invalid,
    documentedOnly,
    undocumented,
    main: [...registry.values()].filter((command) => command.main).map((command) => command.data.name).sort(),
    aliases: [...registry.values()].filter((command) => command.alias).map((command) => command.data.name).sort(),
    deployMode: 'command-registry'
  };
}

if (require.main === module) {
  const report = auditCommands();
  console.log(`Implemented: ${report.implemented.length}`);
  console.log(`Main: ${report.main.length}`);
  console.log(`Aliases: ${report.aliases.length}`);
  console.log(`Invalid: ${report.invalid.length}`);
  console.log(`Documented only: ${report.documentedOnly.length}`);
  console.log(`Undocumented: ${report.undocumented.length}`);
  for (const item of report.invalid) console.log(`INVALID ${item.file}: ${item.reason}`);
  for (const name of report.documentedOnly) console.log(`DOCUMENTED_ONLY /${name}`);
  for (const name of report.undocumented) console.log(`UNDOCUMENTED /${name}`);
  process.exitCode = report.invalid.length || report.documentedOnly.length ? 1 : 0;
}

module.exports = { auditCommands };
