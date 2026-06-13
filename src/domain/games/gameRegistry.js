const { GAME_REGISTRY } = require('../../config/gameRegistry');

module.exports = Object.freeze(GAME_REGISTRY.map((game) => Object.freeze({ ...game })));
