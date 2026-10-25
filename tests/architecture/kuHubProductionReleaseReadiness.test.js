const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { dashboardWritesEnabled, getCookieSigningSecret } = require('../../apps/api/dashboardSecurityConfig');

const server = fs.readFileSync(path.join(__dirname, '../../apps/api/server.js'), 'utf8');

assert.throws(
  () => getCookieSigningSecret({ NODE_ENV: 'production' }),
  /SESSION_SECRET is required/
);
assert.equal(getCookieSigningSecret({ NODE_ENV: 'development' }), 'dev_secret');
assert.equal(dashboardWritesEnabled({}), false);
assert.equal(dashboardWritesEnabled({ DASHBOARD_WRITE_ENABLED: 'true' }), true);

for (const route of [
  "app.put('/api/guilds/:guildId/panels/:channelId', requireSession, requireDashboardWriteAccess",
  "app.post('/api/guilds/:guildId/panels/:channelId/publish', requireSession, requireDashboardWriteAccess",
  "app.post('/api/guilds/:guildId/announcements', requireSession, requireDashboardWriteAccess"
]) {
  assert.match(server, new RegExp(route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
}

console.log('KU HUB production release readiness safety checks passed.');
