require('dotenv').config();

const path = require('node:path');
const {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  Partials
} = require('discord.js');
const fs = require('node:fs');
const { getCommandRegistry } = require('./modules/commands/commandRegistry');

const { DISCORD_TOKEN } = process.env;

if (!DISCORD_TOKEN) {
  console.error('請在 .env 設定 DISCORD_TOKEN。');
  process.exit(1);
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

client.commands = new Collection(getCommandRegistry());

const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
  const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));

  for (const file of eventFiles) {
    const event = require(path.join(eventsPath, file));
    if (!event.name || !event.execute) {
      console.warn(`[WARN] ${file} 缺少 name 或 execute，已略過。`);
      continue;
    }

    const register = event.name === Events.ClientReady ? client.once.bind(client) : client.on.bind(client);
    register(event.name, (...args) => event.execute(...args));
  }
}

const legacyEventsPath = path.join(__dirname, 'legacy', 'events');
if (fs.existsSync(legacyEventsPath)) {
  for (const file of fs.readdirSync(legacyEventsPath).filter((name) => name.endsWith('.js'))) {
    const event = require(path.join(legacyEventsPath, file));
    if (event.name && event.execute) client.on(event.name, (...args) => event.execute(...args));
  }
}

client.login(DISCORD_TOKEN);
