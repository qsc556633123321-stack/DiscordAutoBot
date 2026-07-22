// fallbackAllowed: server logging remains system-owned until its dedicated migration.
const { writeServerLog } = require('../../systems/serverLogs');

// Isolates the existing server-log implementation while its own migration is pending.
module.exports = { writeServerLog };
