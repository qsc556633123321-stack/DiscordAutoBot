const ARCHITECTURE_VERSION = 'v3';
const DEFAULT_QUEUE_DELAY_MS = 800;
// Discord channel type numeric values are stable protocol values. Keeping the
// domain representation here avoids a domain dependency on discord.js.
const CHANNEL_TYPES = Object.freeze({ TEXT: 0, VOICE: 2 });

module.exports = { ARCHITECTURE_VERSION, CHANNEL_TYPES, DEFAULT_QUEUE_DELAY_MS };
