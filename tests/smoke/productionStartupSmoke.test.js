const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Partials } = require('discord.js');

const root = path.resolve(__dirname, '..', '..');

for (const source of [
  'src/index.js',
  'src/deploy-commands.js',
  'src/systems/communityConcierge.js',
  'src/infrastructure/community/CommunityConciergeTextGenerationAdapter.js'
]) {
  execFileSync(process.execPath, ['--check', path.join(root, source)], { stdio: 'pipe' });
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ],
  partials: [Partials.Channel]
});
assert.equal(typeof client.ws.status, 'number');
assert.equal(client.user, null);
client.destroy();

const concierge = require('../../src/systems/communityConcierge');
const adapter = require('../../src/infrastructure/community/CommunityConciergeTextGenerationAdapter');
assert.equal(typeof concierge.generateConciergeText, 'function');
assert.equal(typeof adapter.createCommunityConciergeTextGenerationAdapter, 'function');
assert.equal(fs.existsSync(path.join(root, 'src', 'index.js')), true);

console.log('Offline production startup smoke passed without login, network, OpenAI, or filesystem mutation.');
