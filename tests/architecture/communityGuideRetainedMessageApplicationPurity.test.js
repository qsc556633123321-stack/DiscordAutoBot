const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');

for (const file of [
  'src/application/community/guideLookup/GuidePublicationMessageLookupRequest.js',
  'src/application/community/guideLookup/GuidePublicationMessageLookupResult.js',
  'src/application/community/ports/GuidePublicationMessageLookupPort.js'
]) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  for (const forbidden of ['discord.js', 'DiscordMessage', 'DiscordChannel', 'DiscordGuild', 'DiscordClient', 'Session', 'getRetainedMessage']) assert.doesNotMatch(source, new RegExp(forbidden));
}
console.log('Guide retained-message application purity guard passed');
