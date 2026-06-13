const { fromThrowable, ok } = require('../../core/result');
const legacy = require('../../systems/channelPanels');

async function setup(options) {
  try {
    return ok(await legacy.setupChannelPanels(options));
  } catch (error) {
    return fromThrowable(error, 'CHANNEL_PANEL_SETUP_FAILED');
  }
}

module.exports = { setup };
