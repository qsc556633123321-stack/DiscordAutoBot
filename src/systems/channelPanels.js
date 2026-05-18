const fs = require('node:fs');
const path = require('node:path');
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  StringSelectMenuBuilder
} = require('discord.js');
const { getRoleOptions } = require('./roleManager');

const DATA_DIR = path.join(__dirname, '..', 'data');
const PANELS_FILE = path.join(DATA_DIR, 'channel-panels.json');

function ensurePanelsFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(PANELS_FILE)) fs.writeFileSync(PANELS_FILE, '{}', 'utf8');
}

function readPanels() {
  ensurePanelsFile();
  try {
    const parsed = JSON.parse(fs.readFileSync(PANELS_FILE, 'utf8') || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (error) {
    throw new Error(`讀取 channel-panels.json 失敗，請確認 JSON 格式正確：${error.message}`);
  }
}

function writePanels(data) {
  ensurePanelsFile();
  try {
    fs.writeFileSync(PANELS_FILE, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  } catch (error) {
    throw new Error(`寫入 channel-panels.json 失敗：${error.message}`);
  }
}

function savePanelRecord(guildId, channelId, record) {
  const data = readPanels();
  if (!data[guildId]) data[guildId] = {};
  data[guildId][channelId] = {
    messageId: record.messageId,
    panelType: record.panelType,
    updatedAt: new Date().toISOString()
  };
  writePanels(data);
}

function deletePanelRecord(guildId, channelId) {
  const data = readPanels();
  if (!data[guildId] || !data[guildId][channelId]) return;
  delete data[guildId][channelId];
  writePanels(data);
}

function getPanelRecord(guildId, channelId) {
  const data = readPanels();
  return data[guildId] ? data[guildId][channelId] : null;
}

function normalizeName(name) {
  return name.toLowerCase().replace(/[\s_\-｜|#🎮🎫🎟📑📌💬🔒🎉📦🔊➕]+/g, '');
}

function inferGameName(channel) {
  const parentName = channel.parent ? channel.parent.name : '';
  const parentMatch = parentName.match(/^🎮｜(.+)$/);
  if (parentMatch) return parentMatch[1];

  const normalized = normalizeName(channel.name);
  if (normalized.startsWith('apex')) return 'APEX';
  if (normalized.startsWith('特戰')) return '特戰英豪';
  if (normalized.startsWith('mc') || normalized.startsWith('minecraft')) return 'Minecraft';
  if (normalized.startsWith('lol')) return 'LOL';
  return null;
}

function inferPanelType(channel) {
  if (!channel || channel.type !== ChannelType.GuildText) return null;

  const normalized = normalizeName(channel.name);
  const parentName = channel.parent ? channel.parent.name : '';
  const isGameCategory = /^🎮｜/.test(parentName);

  if (/規則|社群規則/.test(normalized)) return 'rules';
  if (/公告/.test(normalized) && !/活動公告/.test(normalized)) return 'announcement';
  if (/身分組領取|身分組|roles?/.test(normalized)) return 'role_select';
  if (/新人報到|報到|welcome/.test(normalized)) return 'welcome';
  if (/導覽|指南|guide/.test(normalized)) return 'guide';
  if (/一般聊天|聊天|閒聊/.test(normalized) && !isGameCategory) return 'general_chat';
  if (/美食分享|美食|料理/.test(normalized)) return 'food';
  if (/好圖分享|好圖|圖片|梗圖/.test(normalized)) return 'images';
  if (/開啟客服單|客服/.test(normalized)) return 'support';
  if (/管理員頻道|管理|後台/.test(normalized)) return 'admin';
  if (isGameCategory && /找隊友/.test(normalized)) return 'game_party';
  if (isGameCategory && /戰績|精華/.test(normalized)) return 'clips';
  if (isGameCategory && /聊天|討論/.test(normalized)) return 'game_chat';
  if (/找隊友/.test(normalized)) return 'party';
  if (/戰績|精華/.test(normalized)) return 'clips';
  return null;
}

function button(customId, label, style = ButtonStyle.Secondary) {
  return new ButtonBuilder().setCustomId(customId).setLabel(label).setStyle(style);
}

function buildRows(buttons) {
  const rows = [];
  for (let i = 0; i < buttons.length; i += 5) {
    rows.push(new ActionRowBuilder().addComponents(buttons.slice(i, i + 5)));
  }
  return rows;
}

function buildPanel(panelType, channel) {
  const game = inferGameName(channel);
  const builders = {
    rules: () => ({
      embed: new EmbedBuilder()
        .setColor(0x2f80ed)
        .setTitle('📜 社群規則與基本守則')
        .setDescription(
          '• 尊重所有成員，禁止人身攻擊、騷擾、歧視、洗版\n' +
          '• 禁止詐騙連結、惡意檔案、盜號網站、外掛交易\n' +
          '• 不同主題請到對應頻道，避免所有內容都塞在一般聊天\n' +
          '• 管理員有權依情況警告、禁言、踢出或封鎖'
        ),
      buttons: [
        button('panel_read_rules', '✅ 我已閱讀規則', ButtonStyle.Success),
        button('panel_open_roles', '🎭 領取身分組', ButtonStyle.Primary),
        button('panel_show_guide', '🧭 查看伺服器導覽')
      ]
    }),
    announcement: () => ({
      embed: new EmbedBuilder()
        .setColor(0xf2c94c)
        .setTitle('📢 社群公告中心')
        .setDescription('• 這裡只發布重要通知、活動資訊、伺服器更新\n• 最新公告會由 Bot 自動置頂\n• 一般討論請到日常交流區'),
      buttons: [
        button('panel_subscribe_announcement', '🔔 訂閱公告', ButtonStyle.Primary),
        button('panel_show_rules', '📜 查看規則'),
        button('panel_show_guide', '🧭 查看導覽')
      ]
    }),
    role_select: () => ({
      embed: new EmbedBuilder()
        .setColor(0x9b51e0)
        .setTitle('🎭 身分組領取中心')
        .setDescription(
          '請依照你的興趣領取身分組，之後系統會依身分組開放對應通知與分類。\n\n' +
          '身分組分類：\n' +
          '• 🎮 遊戲玩家\n• 🧑‍🤝‍🧑 找隊友通知\n• 📈 股票投資\n• 🛠 開發/AI\n• 🎨 設計創作\n• 🍜 生活閒聊'
        ),
      buttons: [],
      extraRows: [
        new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('role_select_menu')
            .setPlaceholder('選擇或取消你的身分組')
            .setMinValues(0)
            .setMaxValues(getRoleOptions().length)
            .addOptions(getRoleOptions())
        )
      ]
    }),
    welcome: () => ({
      embed: new EmbedBuilder()
        .setColor(0x27ae60)
        .setTitle('👋 新人報到區')
        .setDescription('歡迎加入，可以簡單介紹：\n• 暱稱：\n• 常玩遊戲：\n• 興趣：\n• 想交流的內容：'),
      buttons: [
        button('panel_open_roles', '🎭 領取身分組', ButtonStyle.Primary),
        button('panel_show_rules', '📜 查看規則'),
        button('panel_show_chat', '💬 前往聊天')
      ]
    }),
    guide: () => ({
      embed: new EmbedBuilder()
        .setColor(0x56ccf2)
        .setTitle('🧭 伺服器導覽')
        .setDescription(
          '• 📌 社群入口：規則、公告、身分組與新人資訊\n' +
          '• 💬 日常交流：生活閒聊、美食、圖片與音樂\n' +
          '• 🎮 各遊戲分類：聊天、找隊友、戰績與臨時語音\n' +
          '• 🛠 創作與開發：程式、AI、設計與作品展示\n' +
          '• 📈 投資討論：台股、盤勢、投資筆記\n' +
          '• 🎉 活動專區：活動、投票、抽獎與排行\n' +
          '• 🎫 客服支援：問題回報、建議與 Ticket'
        ),
      buttons: [
        button('panel_open_roles', '🎭 領取身分組', ButtonStyle.Primary),
        button('panel_create_ticket', '🎫 需要協助')
      ]
    }),
    general_chat: () => ({
      embed: new EmbedBuilder()
        .setColor(0x2f80ed)
        .setTitle('💬 日常交流規範')
        .setDescription('• 可以聊生活、遊戲、工作、AI、股票之外的一般話題\n• 美食、圖片、音樂建議到對應頻道\n• 避免洗版、吵架、引戰'),
      buttons: [
        button('panel_show_games', '🎮 前往遊戲區'),
        button('panel_open_roles', '🎭 領取身分組', ButtonStyle.Primary),
        button('panel_create_ticket', '🎫 需要協助')
      ]
    }),
    party: () => ({
      embed: new EmbedBuilder()
        .setColor(0x9b51e0)
        .setTitle('🎮 找隊友區')
        .setDescription('• 請說明遊戲、模式、人數、語音需求\n• 也可以使用 /create-party 建立臨時語音'),
      buttons: [
        button('panel_create_voice', '🔊 建立臨時語音', ButtonStyle.Primary),
        button('panel_show_party_format', '📌 查看組隊格式')
      ]
    }),
    clips: () => ({
      embed: new EmbedBuilder()
        .setColor(0xf2994a)
        .setTitle('🏆 戰績與精華分享')
        .setDescription('• 分享戰績、截圖、影片、精彩操作\n• 請避免惡意嘲諷或引戰'),
      buttons: [
        button('panel_show_clip_format', '📤 分享格式'),
        button('panel_show_party', '🎮 前往找隊友')
      ]
    }),
    food: () => ({
      embed: new EmbedBuilder()
        .setColor(0xf2c94c)
        .setTitle('🍜 美食分享')
        .setDescription('• 分享餐廳、宵夜、料理、飲料、外送推薦\n• 歡迎附照片與地區'),
      buttons: [
        button('panel_show_photo_hint', '📸 分享照片'),
        button('panel_show_food_format', '📝 推薦格式')
      ]
    }),
    images: () => ({
      embed: new EmbedBuilder()
        .setColor(0x56ccf2)
        .setTitle('🖼 好圖分享')
        .setDescription('• 分享梗圖、桌布、遊戲截圖、AI 圖\n• 禁止色情、血腥、惡意攻擊圖片'),
      buttons: [button('panel_show_image_rules', '📌 發圖規範')]
    }),
    support: () => ({
      embed: new EmbedBuilder()
        .setColor(0x2f80ed)
        .setTitle('🎫 客服支援中心')
        .setDescription('遇到問題請開 Ticket：\n• 權限問題\n• 頻道建議\n• 成員檢舉\n• Bot 問題'),
      buttons: [
        button('panel_create_ticket', '🎟 建立 Ticket', ButtonStyle.Primary),
        button('panel_show_suggestion_format', '💡 提交建議格式')
      ]
    }),
    ticket: () => builders.support(),
    admin: () => ({
      embed: new EmbedBuilder()
        .setColor(0xeb5757)
        .setTitle('🔒 管理員控制台')
        .setDescription('常用指令：\n• /analyze-server\n• /deep-cleanup\n• /rebuild-server\n• /setup-channel-panels\n• /setup-game\n• /cleanup-empty-categories'),
      buttons: [
        button('panel_hint_analyze', '📊 分析伺服器'),
        button('panel_hint_deep_cleanup', '🧹 深度整理'),
        button('panel_hint_setup_roles', '🎭 設定身分組'),
        button('panel_hint_announce', '📢 發公告')
      ]
    }),
    game_chat: () => ({
      embed: new EmbedBuilder()
        .setColor(0x27ae60)
        .setTitle('🎮 遊戲聊天區')
        .setDescription('• 討論該遊戲心得、更新、角色、裝備、技巧\n• 找隊友請到找隊友頻道\n• 語音可使用臨時語音系統'),
      buttons: [
        button(`panel_create_voice:${game || ''}`, '🔊 建立遊戲語音', ButtonStyle.Primary),
        button('panel_show_party_format', '🧑‍🤝‍🧑 找隊友格式'),
        button('panel_show_clip_format', '🏆 分享戰績格式')
      ]
    }),
    game_party: () => ({
      embed: new EmbedBuilder()
        .setColor(0x9b51e0)
        .setTitle('🧑‍🤝‍🧑 找隊友格式')
        .setDescription('請使用以下格式：\n```text\n遊戲：\n模式：\n人數：\n牌位：\n是否開語音：\n備註：\n```'),
      buttons: [
        button('panel_show_party_format', '📋 顯示組隊格式'),
        button(`panel_create_voice:${game || ''}`, '🔊 建立臨時語音', ButtonStyle.Primary)
      ]
    })
  };

  const built = builders[panelType] ? builders[panelType]() : null;
  if (!built) return null;
  built.embed.setFooter({ text: 'Channel Panel' }).setTimestamp();
  return { embeds: [built.embed], components: [...buildRows(built.buttons), ...(built.extraRows || [])] };
}

function channelMatchesTarget(channel, panelType, target) {
  if (target === 'all') return true;
  if (target === 'game') return ['party', 'clips', 'game_chat', 'game_party'].includes(panelType) || /^🎮｜/.test(channel.parent?.name || '');
  if (target === 'support') return ['support', 'ticket'].includes(panelType);
  if (target === 'info') return ['rules', 'announcement', 'welcome'].includes(panelType);
  return false;
}

function getTargetChannels(guild, target, currentChannel) {
  if (target === 'current') {
    const panelType = inferPanelType(currentChannel);
    return panelType ? [{ channel: currentChannel, panelType }] : [];
  }

  return [...guild.channels.cache.values()]
    .filter((channel) => channel.type === ChannelType.GuildText)
    .map((channel) => ({ channel, panelType: inferPanelType(channel) }))
    .filter((item) => item.panelType && channelMatchesTarget(item.channel, item.panelType, target));
}

async function applyPanelToChannel(client, guild, channel, panelType, mode) {
  const record = getPanelRecord(guild.id, channel.id);
  const payload = buildPanel(panelType, channel);
  if (!payload) return { status: 'skipped', channel: channel.name, reason: '無面板內容' };

  if (record && mode === 'create') {
    return { status: 'skipped', channel: channel.name, reason: '面板已存在' };
  }

  if (record && ['refresh', 'force'].includes(mode)) {
    try {
      const oldMessage = await channel.messages.fetch(record.messageId);
      if (oldMessage.author.id !== client.user.id) {
        return { status: 'skipped', channel: channel.name, reason: '記錄訊息不是 Bot 發送' };
      }

      if (mode === 'refresh') {
        await oldMessage.edit(payload);
        savePanelRecord(guild.id, channel.id, { messageId: oldMessage.id, panelType });
        return { status: 'refreshed', channel: channel.name };
      }

      await oldMessage.delete();
      deletePanelRecord(guild.id, channel.id);
    } catch (error) {
      if (mode === 'refresh') {
        return { status: 'failed', channel: channel.name, reason: '更新既有面板失敗' };
      }
    }
  }

  const message = await channel.send(payload);
  savePanelRecord(guild.id, channel.id, { messageId: message.id, panelType });
  return { status: 'created', channel: channel.name };
}

async function setupChannelPanels({ client, guild, currentChannel, mode, target }) {
  const targets = getTargetChannels(guild, target, currentChannel);
  const results = [];

  for (const item of targets) {
    try {
      results.push(await applyPanelToChannel(client, guild, item.channel, item.panelType, mode));
    } catch (error) {
      console.error(`設定 ${item.channel.name} 面板失敗：`, error);
      results.push({ status: 'failed', channel: item.channel.name, reason: error.message });
    }
  }

  return results;
}

module.exports = {
  applyPanelToChannel,
  buildPanel,
  getPanelRecord,
  inferGameName,
  inferPanelType,
  readPanels,
  setupChannelPanels
};
