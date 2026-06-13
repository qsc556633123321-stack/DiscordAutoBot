const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const COMMANDS_DIR = path.join(ROOT, 'src', 'commands');
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
  const files = fs.readdirSync(COMMANDS_DIR).filter((file) => file.endsWith('.js'));
  const implemented = new Map();
  const invalid = [];
  for (const file of files) {
    try {
      const command = require(path.join(COMMANDS_DIR, file));
      if (!command.data?.name || typeof command.execute !== 'function') {
        invalid.push({ file, reason: 'Missing SlashCommandBuilder data/name or execute().' });
        continue;
      }
      implemented.set(command.data.name, file);
    } catch (error) {
      invalid.push({ file, reason: error.message });
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
    deployMode: 'automatic-directory-scan'
  };
}

if (require.main === module) {
  const report = auditCommands();
  console.log(`Implemented: ${report.implemented.length}`);
  console.log(`Invalid: ${report.invalid.length}`);
  console.log(`Documented only: ${report.documentedOnly.length}`);
  console.log(`Undocumented: ${report.undocumented.length}`);
  for (const item of report.invalid) console.log(`INVALID ${item.file}: ${item.reason}`);
  for (const name of report.documentedOnly) console.log(`DOCUMENTED_ONLY /${name}`);
  for (const name of report.undocumented) console.log(`UNDOCUMENTED /${name}`);
  process.exitCode = report.invalid.length || report.documentedOnly.length ? 1 : 0;
}

module.exports = { auditCommands };
