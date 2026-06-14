require('dotenv').config();

const { REST, Routes } = require('discord.js');
const { getCommandRegistry } = require('./modules/commands/commandRegistry');

const commands = [...getCommandRegistry().values()].map((command) => command.data.toJSON());

const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;

if (!DISCORD_TOKEN || !CLIENT_ID) {
  console.error('請先在 .env 設定 DISCORD_TOKEN 與 CLIENT_ID。');
  process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

(async () => {
  try {
    console.log(`開始部署 ${commands.length} 個 slash commands...`);

    if (GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
        { body: commands }
      );
      console.log(`已部署到測試伺服器：${GUILD_ID}`);
      return;
    }

    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );
    console.log('已部署為全域指令。全域指令可能需要一段時間才會更新。');
  } catch (error) {
    console.error('部署 slash commands 失敗：', error);
    process.exit(1);
  }
})();
