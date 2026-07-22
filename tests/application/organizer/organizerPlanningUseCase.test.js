const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createOrganizerPlanningUseCase } = require('../../../src/application/organizer/createOrganizerPlanningUseCase');

const TYPES = { TEXT: 0, VOICE: 2, CATEGORY: 4 };

function createPlanner({ rules = [], failReader = false } = {}) {
  const calls = [];
  const planner = createOrganizerPlanningUseCase({
    channelRuleReader: {
      listByGuild(guildId) {
        calls.push(guildId);
        if (failReader) throw new Error('reader unavailable');
        return rules;
      }
    },
    logger: { error: () => {} },
    channelTools: {
      categoryType: TYPES.CATEGORY,
      movableTypes: new Set([TYPES.TEXT, TYPES.VOICE]),
      voiceTypes: new Set([TYPES.VOICE]),
      inferGameCategoryName: () => null,
      isCreateVoiceChannel: () => false,
      isTempVoice: () => false,
      typeName: (type) => String(type)
    }
  });
  return { calls, planner };
}

function createGuild({ id = 'guild-1', channels = [] } = {}) {
  return { id, name: 'Test Guild', channels: { cache: new Map(channels.map((channel) => [channel.id, channel])) } };
}

const category = { id: 'category', name: '📌｜社群入口', type: TYPES.CATEGORY };
const custom = { id: 'custom', name: 'Kuro專區', type: TYPES.TEXT, parent: null, parentId: null };
const guild = createGuild({ channels: [category, custom] });
const { calls, planner } = createPlanner({ rules: [{ keyword: 'Kuro', category: '🧠｜記憶專區', weight: 7 }] });
const plan = planner.createPlan(guild, 'source', 'member');
assert.deepEqual(calls, ['guild-1']);
assert.equal(plan.moves.length, 1);
assert.equal(plan.moves[0].suggestedCategoryName, '🧠｜記憶專區');
assert.equal(plan.moves[0].score, 7);
assert.match(plan.moves[0].reason, /命中伺服器記憶：Kuro \+7/);

const fallback = createPlanner({ failReader: true }).planner.createPlan(guild, 'source', 'member');
assert.equal(fallback.moves.length, 0);
assert.equal(fallback.manualReview.length, 0);

const undefinedGuild = createGuild({ id: undefined, channels: [category, custom] });
assert.doesNotThrow(() => createPlanner().planner.createPlan(undefinedGuild, 'source', 'member'));

const applicationSource = fs.readFileSync(path.join(__dirname, '..', '..', '..', 'src', 'application', 'organizer', 'createOrganizerPlanningUseCase.js'), 'utf8');
for (const forbidden of ['serverMemory', 'jsonChannelRuleRepository', "node:fs", "node:path", "discord.js", 'process.env']) {
  assert.equal(applicationSource.includes(forbidden), false, `Organizer application must not reference ${forbidden}.`);
}

console.log('Organizer planning application tests passed.');
