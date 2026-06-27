const legacy = require('../../legacy/commands/setupServerLegacy');
module.exports = { data: legacy.data, execute: (interaction) => legacy.execute(interaction) };
