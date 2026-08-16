const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  expandGameRoleKeys,
  roleCanAccessGame,
  roleCanAccessGameCenter
} = require('../../../src/domain/games/gameAccessPolicy');

const fixturePath = path.join(__dirname, '..', '..', 'fixtures', 'games', 'game-role-access-matrix.json');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
const cases = fixture.examples.map((example) => ({
  name: example.roles.join('+'),
  roles: example.roles,
  center: example.gameCenter,
  games: { valorant: example.valorant, apex: example.apex }
}));

for (const scenario of cases) {
  assert.equal(roleCanAccessGameCenter(scenario.roles), scenario.center, scenario.name);
  for (const [gameId, expected] of Object.entries(scenario.games)) {
    if (expected === undefined) continue;
    assert.equal(roleCanAccessGame(scenario.roles, gameId), expected, scenario.name + ': ' + gameId);
  }
}

assert.deepEqual(expandGameRoleKeys(['game:valorant']), ['game:valorant', 'game', 'member']);
assert.deepEqual(expandGameRoleKeys(['game:valorant', 'game:apex']), ['game:valorant', 'game:apex', 'game', 'member']);

console.log('Game role access foundation integration tests passed.');
