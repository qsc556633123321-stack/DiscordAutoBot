const assert = require('node:assert/strict');
const { buildGuidePayload } = require('../../../src/systems/communityConcierge');
const baseline = require('../../fixtures/communityGuideLegacyBaseline');

async function main() {
  const previous = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = '';
  try {
    const guild = {
      ...baseline.guild
    };
    const payload = await buildGuidePayload(guild);
    const embed = payload.embeds[0].toJSON();
    delete embed.timestamp;
    if (embed.footer?.icon_url === undefined) delete embed.footer.icon_url;
    assert.deepEqual(embed, baseline.embedWithoutTimestamp);
    assert.deepEqual(payload.components.map((row) => row.toJSON()), baseline.componentPayload);
    console.log('Community Guide compatibility consumer tests passed.');
  } finally {
    if (previous === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previous;
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
