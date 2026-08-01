const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const welcomeDir = path.join(root, 'src/application/community/welcome');
const forbidden = [
  'discord.js', 'node:fs', "require('fs')", 'node:path', 'infrastructure/', 'systems/',
  'events/', 'commands/', 'JSON.', 'member.send', 'channels.fetch', 'channels.cache.get',
  'saveOnboarding', 'Date.now', 'setTimeout', 'console.'
];
for (const file of fs.readdirSync(welcomeDir).filter((name) => name.endsWith('.js'))) {
  const source = fs.readFileSync(path.join(welcomeDir, file), 'utf8');
  for (const token of forbidden) assert.equal(source.includes(token), false, `${file} contains forbidden ${token}`);
}
for (const forbiddenPath of [
  'src/application/community/welcome/CommunityWelcomeDeliveryPort.js',
  'src/infrastructure/community/discordCommunityWelcomeDeliveryAdapter.js',
  'src/composition/communityWelcomeDeliveryFeature.js',
  'src/infrastructure/community/communityWelcomeDeliveryRepository.js'
]) assert.equal(fs.existsSync(path.join(root, forbiddenPath)), false, `unexpected ${forbiddenPath}`);
console.log('community welcome delivery preparation boundary passed');
