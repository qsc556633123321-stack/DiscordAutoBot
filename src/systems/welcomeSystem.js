const fs = require('node:fs');
const path = require('node:path');
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  PermissionFlagsBits
} = require('discord.js');
const { writeServerLog } = require('./serverLogs');

const DATA_DIR = path.join(__dirname, '..', 'data');
const SETTINGS_FILE = path.join(DATA_DIR, 'welcome-settings.json');
const remindedMembers = new Map();
const recentWelcomes = new Map();

const DEFAULT_SETTINGS = {
  enabled: true,
  dmEnabled: true,
  autoGuestRole: true,
  reminderEnabled: true,
  removeGuestOnRoleSelect: false,
  reminderMinutes: 10,
  reminded: {}
};

function ensureSettingsFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(SETTINGS_FILE)) fs.writeFileSync(SETTINGS_FILE, '{}', 'utf8');
}

function readAllSettings() {
  ensureSettingsFile();
  try {
    const parsed = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8') || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (error) {
    console.error('讀取 welcome-settings.json 失敗:', error);
    return {};
  }
}

function writeAllSettings(data) {
  ensureSettingsFile();
  try {
    fs.writeFileSync(SETTINGS_FILE, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  } catch (error) {
    console.error('寫入 welcome-settings.json 失敗:', error);
  }
}

function getWelcomeSettings(guildId) {
  const data = readAllSettings();
  return {
    ...DEFAULT_SETTINGS,
    ...(data[guildId] || {}),
    reminded: (data[guildId] || {}).reminded || {}
  };
}

function updateWelcomeSettings(guildId, updates) {
  const data = readAllSettings();
  data[guildId] = {
    ...getWelcomeSettings(guildId),
    ...updates,
    updatedAt: new Date().toISOString()
  };
  writeAllSettings(data);
  return data[guildId];
}

function markReminded(guildId, userId) {
  const settings = getWelcomeSettings(guildId);
  settings.reminded[userId] = new Date().toISOString();
  updateWelcomeSettings(guildId, { reminded: settings.reminded });
}

function hasReminded(guildId, userId) {
  const settings = getWelcomeSettings(guildId);
  return Boolean(settings.reminded[userId] || remindedMembers.get(`${guildId}:${userId}`));
}

function findWelcomeChannel(guild) {
  return guild.channels.cache.find((channel) => (
    channel.type === ChannelType.GuildText &&
    /新人報到|welcome|報到/i.test(channel.name)
  ));
}

function findRulesChannel(guild) {
  return guild.channels.cache.find((channel) => (
    channel.type === ChannelType.GuildText &&
    /規則|rules|社群規則/i.test(channel.name)
  ));
}

async function logWelcomeIssue(guild, text) {
  await writeServerLog(guild, {
    title: '👋 Welcome System 提醒',
    description: text,
    color: 0xf2c94c
  });
}

function buildWelcomeComponents(guild, welcomeChannel, rulesChannel) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('panel_show_rules')
      .setLabel('查看規則')
      .setEmoji('📜')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('panel_open_roles')
      .setLabel('領取身分組')
      .setEmoji('🎭')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('panel_show_guide')
      .setLabel('伺服器導覽')
      .setEmoji('🧭')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('panel_create_ticket')
      .setLabel('需要協助')
      .setEmoji('🎫')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('panel_intro_format')
      .setLabel('自介格式')
      .setEmoji('📝')
      .setStyle(ButtonStyle.Secondary)
  );

  const links = [];
  if (welcomeChannel) {
    links.push(
      new ButtonBuilder()
        .setLabel('前往新人報到')
        .setStyle(ButtonStyle.Link)
        .setURL(`https://discord.com/channels/${guild.id}/${welcomeChannel.id}`)
    );
  }
  if (rulesChannel) {
    links.push(
      new ButtonBuilder()
        .setLabel('查看規則')
        .setStyle(ButtonStyle.Link)
        .setURL(`https://discord.com/channels/${guild.id}/${rulesChannel.id}`)
    );
  }

  return links.length ? [row, new ActionRowBuilder().addComponents(links)] : [row];
}

function buildWelcomeEmbed(member) {
  return new EmbedBuilder()
    .setColor(0x57f287)
    .setTitle(`👋 歡迎 ${member.user.username} 加入！`)
    .setDescription(
      '歡迎來到伺服器。\n' +
      '你可以先完成三件事：\n' +
      '1. 閱讀社群規則\n' +
      '2. 領取身分組\n' +
      '3. 簡單自我介紹\n\n' +
      '自我介紹格式：\n' +
      '```text\n' +
      '暱稱：\n' +
      '常玩遊戲：\n' +
      '興趣：\n' +
      '想交流的內容：\n' +
      '```'
    )
    .setThumbnail(member.user.displayAvatarURL({ size: 128 }))
    .setTimestamp();
}

async function ensureGuestRole(member) {
  let role = member.guild.roles.cache.find((item) => item.name === '訪客');
  if (!role) {
    if (!member.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
      await logWelcomeIssue(member.guild, 'Bot 缺少 ManageRoles，無法建立訪客角色。');
      return null;
    }
    role = await member.guild.roles.create({
      name: '訪客',
      permissions: [],
      mentionable: false,
      reason: 'Welcome system guest role'
    });
  }

  if (!role.editable) {
    await logWelcomeIssue(member.guild, 'Bot 角色順位不足，無法給予訪客角色。');
    return null;
  }

  await member.roles.add(role, 'Welcome system guest role');
  return role;
}

async function sendWelcomeDm(member, welcomeChannel, rulesChannel) {
  try {
    const buttons = [];
    if (welcomeChannel) {
      buttons.push(
        new ButtonBuilder()
          .setLabel('前往新人報到')
          .setStyle(ButtonStyle.Link)
          .setURL(`https://discord.com/channels/${member.guild.id}/${welcomeChannel.id}`)
      );
    }
    if (rulesChannel) {
      buttons.push(
        new ButtonBuilder()
          .setLabel('查看規則')
          .setStyle(ButtonStyle.Link)
          .setURL(`https://discord.com/channels/${member.guild.id}/${rulesChannel.id}`)
      );
    }

    await member.send({
      content: '歡迎加入！可以先去新人報到區看規則、領身分組、介紹自己。',
      components: buttons.length ? [new ActionRowBuilder().addComponents(buttons)] : []
    });
  } catch (error) {
    console.log(`Welcome DM failed for ${member.user.tag}: ${error.message}`);
  }
}

function scheduleRoleReminder(member, welcomeChannel, settings) {
  if (!settings.reminderEnabled || !welcomeChannel || hasReminded(member.guild.id, member.id)) return;

  const key = `${member.guild.id}:${member.id}`;
  remindedMembers.set(key, true);
  setTimeout(async () => {
    try {
      const freshMember = await member.guild.members.fetch(member.id).catch(() => null);
      if (!freshMember) return;
      const hasAssignableRole = freshMember.roles.cache.some((role) => role.name !== '@everyone' && role.name !== '訪客');
      if (hasAssignableRole) return;
      await welcomeChannel.send({
        content: `${freshMember} 可以點擊上方「領取身分組」解鎖對應頻道。`
      });
      markReminded(member.guild.id, member.id);
    } catch (error) {
      console.error('Welcome reminder failed:', error);
    }
  }, settings.reminderMinutes * 60 * 1000);
}

function shouldSkipDuplicateWelcome(member) {
  const key = `${member.guild.id}:${member.id}`;
  if (recentWelcomes.has(key)) return true;
  recentWelcomes.set(key, Date.now());
  setTimeout(() => recentWelcomes.delete(key), 10 * 60 * 1000);
  return false;
}

async function handleGuildMemberAdd(member) {
  const settings = getWelcomeSettings(member.guild.id);
  if (!settings.enabled || member.user.bot) return;
  if (shouldSkipDuplicateWelcome(member)) return;

  const welcomeChannel = findWelcomeChannel(member.guild);
  const rulesChannel = findRulesChannel(member.guild);

  if (settings.autoGuestRole) {
    try {
      await ensureGuestRole(member);
    } catch (error) {
      await logWelcomeIssue(member.guild, `給予訪客角色失敗：${error.message}`);
    }
  }

  if (welcomeChannel) {
    try {
      await welcomeChannel.send({
        content: `${member}`,
        embeds: [buildWelcomeEmbed(member)],
        components: buildWelcomeComponents(member.guild, welcomeChannel, rulesChannel)
      });
    } catch (error) {
      await logWelcomeIssue(member.guild, `發送新人歡迎訊息失敗：${error.message}`);
    }
  } else {
    await logWelcomeIssue(member.guild, '找不到新人報到/welcome/報到頻道。');
  }

  if (settings.dmEnabled) {
    await sendWelcomeDm(member, welcomeChannel, rulesChannel);
  }

  scheduleRoleReminder(member, welcomeChannel, settings);
}

module.exports = {
  buildWelcomeEmbed,
  getWelcomeSettings,
  handleGuildMemberAdd,
  updateWelcomeSettings
};
