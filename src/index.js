require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  Partials
} = require('discord.js');
const { cleanupMissingTempVoices } = require('./systems/tempVoice');
const { restoreVoiceHubs } = require('./systems/voiceHub');

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

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.warn(`[WARN] ${file} 缺少 data 或 execute，已略過。`);
  }
}

const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
  const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));

  for (const file of eventFiles) {
    const event = require(path.join(eventsPath, file));
    if (!event.name || !event.execute) {
      console.warn(`[WARN] ${file} 缺少 name 或 execute，已略過。`);
      continue;
    }

    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.once(Events.ClientReady, async () => {
  console.log(`Discord Server Architect Bot 已上線：${client.user.tag}`);
  try {
    await cleanupMissingTempVoices(client);
    await restoreVoiceHubs(client);
  } catch (error) {
    console.error('Temp Voice startup cleanup failed:', error);
  }
});

client.login(DISCORD_TOKEN);
