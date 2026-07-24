const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', '..');
const domain = fs.readFileSync(path.join(root, 'src', 'domain', 'community', 'helpMeStartRecommendation.js'), 'utf8');
const application = fs.readFileSync(path.join(root, 'src', 'application', 'community', 'getHelpMeStartRecommendation.js'), 'utf8');
const command = fs.readFileSync(path.join(root, 'src', 'presentation', 'commands', 'helpMeStartCommand.js'), 'utf8');
const compatibilityHelper = fs.readFileSync(path.join(root, 'src', 'systems', 'interactiveGuideSystem.js'), 'utf8');
const legacyAdapter = fs.readFileSync(path.join(root, 'src', 'adapters', 'legacy', 'legacyConciergeTextGenerator.js'), 'utf8');
const composition = fs.readFileSync(path.join(root, 'src', 'composition', 'community', 'helpMeStartFeature.js'), 'utf8');
const staleInfrastructureAdapter = path.join(root, 'src', 'infrastructure', 'community', 'legacyConciergeTextGenerator.js');
const legacyAdapterPath = path.join(root, 'src', 'adapters', 'legacy', 'legacyConciergeTextGenerator.js');

assert.doesNotMatch(domain, /discord\.js|require\(['"]node:(fs|path)['"]\)|communityConcierge|infrastructure|presentation/i);
assert.doesNotMatch(application, /discord\.js|interaction|channels\.cache|communityConcierge/i);
assert.doesNotMatch(command, /readFileSync|writeFileSync|channels\.create|roles\.(add|remove)|permissionOverwrites/i);
assert.doesNotMatch(compatibilityHelper, /presentation\/community|createHelpMeStartEmbed|EmbedBuilder|createHelpMeStartRecommendation/i);
assert.match(legacyAdapter, /communityConcierge/);
assert.equal(fs.existsSync(staleInfrastructureAdapter), false, 'stale infrastructure Concierge adapter must not exist');
assert.equal(fs.existsSync(legacyAdapterPath), true, 'legacy Concierge adapter must remain available');
assert.match(composition, /adapters\/legacy\/legacyConciergeTextGenerator/);
assert.doesNotMatch(composition, /infrastructure\/community\/legacyConciergeTextGenerator/);
console.log('Help-me-start architecture boundary tests passed.');
