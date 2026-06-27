const { EventEmitter } = require('node:events');

const eventBus = new EventEmitter();
eventBus.setMaxListeners(50);

module.exports = eventBus;
