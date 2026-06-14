const fs = require('node:fs');
const path = require('node:path');
const { getCommandRegistry } = require('../src/modules/commands/commandRegistry');

const registry = getCommandRegistry();
const main = [...registry.values()].filter((command) => command.main);
const aliases = [...registry.values()].filter((command) => command.alias);
const mainEvents = fs.readdirSync(path.join(__dirname, '..', 'src', 'events')).filter((file) => file.endsWith('.js'));
const legacyEvents = fs.readdirSync(path.join(__dirname, '..', 'src', 'legacy', 'events')).filter((file) => file.endsWith('.js'));

console.log(`Main commands: ${main.length}`);
console.log(`Alias commands: ${aliases.length}`);
console.log(`Deployed commands: ${registry.size}`);
console.log(`Main event entrypoints: ${mainEvents.length}`);
console.log(`Legacy event hooks: ${legacyEvents.length}`);
console.log(`Main command names: ${main.map((command) => `/${command.data.name}`).join(', ')}`);
