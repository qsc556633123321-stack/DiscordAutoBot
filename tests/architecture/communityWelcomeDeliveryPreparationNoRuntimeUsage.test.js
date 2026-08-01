const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const names = [
  'createCommunityWelcomeDeliveryRequest',
  'CommunityWelcomeDeliveryFailureReason',
  'createCommunityWelcomeDeliveryResult',
  'buildCommunityWelcomeMessage',
  'mapLegacyWelcomeDeliveryRequest'
];
function listJs(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) return listJs(file);
    return entry.name.endsWith('.js') ? [file] : [];
  });
}
for (const directory of ['src/systems', 'src/events', 'src/commands', 'src/services', 'src/infrastructure', 'src/composition', 'src/legacy']) {
  for (const file of listJs(path.join(root, directory))) {
    if (file === path.join(root, 'src/systems/communityConcierge.js')) continue;
    const source = fs.readFileSync(file, 'utf8');
    for (const name of names) assert.equal(source.includes(name), false, `${path.relative(root, file)} imports ${name}`);
  }
}
console.log('community welcome delivery preparation has no runtime usage');
