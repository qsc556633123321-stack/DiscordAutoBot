const legacy = require('../../legacy/commands/setupTicketLegacy');
module.exports = { data: legacy.data, execute: (interaction) => legacy.execute(interaction) };
