const assert = require('node:assert/strict');
const { buildHelpMeStartEmbed } = require('../../../src/systems/interactiveGuideSystem');
const { createFakeGuild } = require('../../fixtures/helpMeStartFakes');
const baseline = require('../../fixtures/helpMeStartLegacyBaseline');

async function main() {
  const previous = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = '';
  try {
    const payload = (await buildHelpMeStartEmbed(createFakeGuild(), baseline.answers)).toJSON();
    assert.match(payload.timestamp, /^\d{4}-\d{2}-\d{2}T/);
    delete payload.timestamp;
    if (payload.footer?.icon_url === undefined) delete payload.footer.icon_url;
    assert.deepEqual(payload, baseline.embedWithoutTimestamp);
    console.log('Help-me-start compatibility helper tests passed.');
  } finally {
    if (previous === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previous;
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
