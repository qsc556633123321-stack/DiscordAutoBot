const { EmbedBuilder } = require('discord.js');

const PERSONAS = {
  system: {
    color: 0x5865f2,
    footer: 'Community OS System',
    tone: '冷靜、短、結構化'
  },
  ai_manager: {
    color: 0x57f287,
    footer: 'Community Concierge',
    tone: '像社群管家 / 群友'
  },
  night_persona: {
    color: 0x2f3136,
    footer: 'Night Crew',
    tone: '深夜感'
  },
  event_persona: {
    color: 0xf2c94c,
    footer: 'Community Events',
    tone: '活動感'
  }
};

function normalizeLines(lines) {
  if (Array.isArray(lines)) return lines.filter(Boolean).join('\n');
  return String(lines || '');
}

function buildPersonaEmbed(type, { title, description, fields = [], timestamp = true } = {}) {
  const persona = PERSONAS[type] || PERSONAS.system;
  const embed = new EmbedBuilder()
    .setColor(persona.color)
    .setTitle(title || 'Community OS')
    .setDescription(normalizeLines(description))
    .setFooter({ text: persona.footer });

  if (fields.length) embed.addFields(fields);
  if (timestamp) embed.setTimestamp();
  return embed;
}

async function sendPersonaMessage(channel, type, payload = {}) {
  if (!channel?.send) return null;
  return channel.send({
    content: payload.content || null,
    embeds: [buildPersonaEmbed(type, payload)],
    components: payload.components || []
  });
}

function systemEmbed(payload) {
  return buildPersonaEmbed('system', payload);
}

function managerEmbed(payload) {
  return buildPersonaEmbed('ai_manager', payload);
}

function nightEmbed(payload) {
  return buildPersonaEmbed('night_persona', payload);
}

function eventEmbed(payload) {
  return buildPersonaEmbed('event_persona', payload);
}

async function sendSystemMessage(channel, payload) {
  return sendPersonaMessage(channel, 'system', payload);
}

async function sendManagerMessage(channel, payload) {
  return sendPersonaMessage(channel, 'ai_manager', payload);
}

async function sendNightMessage(channel, payload) {
  return sendPersonaMessage(channel, 'night_persona', payload);
}

async function sendEventMessage(channel, payload) {
  return sendPersonaMessage(channel, 'event_persona', payload);
}

module.exports = {
  PERSONAS,
  buildPersonaEmbed,
  eventEmbed,
  managerEmbed,
  nightEmbed,
  sendEventMessage,
  sendManagerMessage,
  sendNightMessage,
  sendPersonaMessage,
  sendSystemMessage,
  systemEmbed
};
