const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', '..');
const domain = fs.readFileSync(path.join(root, 'src', 'domain', 'community', 'helpMeStartRecommendation.js'), 'utf8');
const application = fs.readFileSync(path.join(root, 'src', 'application', 'community', 'getHelpMeStartRecommendation.js'), 'utf8');
const command = fs.readFileSync(path.join(root, 'src', 'presentation', 'commands', 'helpMeStartCommand.js'), 'utf8');

assert.doesNotMatch(domain, /discord\.js|require\(['"]node:(fs|path)['"]\)|communityConcierge|infrastructure|presentation/i);
assert.doesNotMatch(application, /discord\.js|interaction|channels\.cache|communityConcierge/i);
assert.doesNotMatch(command, /readFileSync|writeFileSync|channels\.create|roles\.(add|remove)|permissionOverwrites/i);
console.log('Help-me-start architecture boundary tests passed.');
