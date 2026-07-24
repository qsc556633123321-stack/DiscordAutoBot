const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');
const domain = read('src', 'domain', 'community', 'guideReadModel.js');
const application = read('src', 'application', 'community', 'getCommunityGuide.js');
const renderer = read('src', 'presentation', 'community', 'communityGuideRenderer.js');
const contentReader = read('src', 'infrastructure', 'community', 'communityGuideContentReader.js');
const composition = read('src', 'composition', 'community', 'createCommunityGuideReadFeature.js');
const concierge = read('src', 'systems', 'communityConcierge.js');
const sliceFiles = [domain, application, renderer, contentReader];

assert.doesNotMatch(domain, /discord\.js|node:(fs|path)|communityConcierge|infrastructure|presentation/i);
assert.doesNotMatch(application, /discord\.js|communityConcierge|interactiveGuideSystem/i);
assert.doesNotMatch(contentReader, /communityConcierge|readFileSync|writeFileSync/i);
assert.doesNotMatch(composition, /communityGuideLegacyBaseline|legacy\//i);
assert.doesNotMatch(application, /guideGuildFactsReader|readGuideGuildFacts|channels\.cache/i);
assert.doesNotMatch(composition, /getCommunityGuideStatus|guideStatusReader|guideGuildFactsReader|jsonGuideStatusReader|discordGuideGuildFactsReader/i);
assert.doesNotMatch(concierge, /function buildGuideEmbed|function buildGuideRows|presentation\/community\/communityGuideRenderer/);
assert.match(concierge, /createCommunityGuideReadCompatibilityAdapter/);
for (const source of sliceFiles) {
  assert.doesNotMatch(source, /channel\.send|message\.edit|message\.delete|channels\.create|permissionOverwrites\.edit|roles\.(add|remove)/);
}
const productionSources = fs.readdirSync(path.join(root, 'src'), { recursive: true })
  .filter((entry) => typeof entry === 'string' && entry.endsWith('.js'))
  .map((entry) => read('src', entry));
assert.equal(productionSources.some((source) => source.includes('communityGuideLegacyBaseline')), false);
assert.equal(fs.existsSync(path.join(root, 'src', 'application', 'community', 'getCommunityGuideStatus.js')), false);
assert.equal(fs.existsSync(path.join(root, 'src', 'application', 'community', 'ports', 'guideStatusReader.js')), false);
assert.equal(fs.existsSync(path.join(root, 'src', 'application', 'community', 'ports', 'guideGuildFactsReader.js')), false);
assert.equal(fs.existsSync(path.join(root, 'src', 'infrastructure', 'community', 'jsonGuideStatusReader.js')), false);
assert.equal(fs.existsSync(path.join(root, 'src', 'infrastructure', 'community', 'discordGuideGuildFactsReader.js')), false);
console.log('Community Guide read architecture boundary tests passed.');
