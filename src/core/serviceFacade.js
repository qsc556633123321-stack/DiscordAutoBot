const { fromThrowable, ok } = require('./result');

function createLegacyFacade(legacy, namespace = 'LEGACY') {
  return {
    legacy,
    async invoke(method, ...args) {
      try {
        if (typeof legacy[method] !== 'function') {
          return fromThrowable(new Error(`Unknown legacy method: ${method}`), `${namespace}_METHOD_MISSING`);
        }
        return ok(await legacy[method](...args));
      } catch (error) {
        return fromThrowable(error, `${namespace}_FAILED`);
      }
    }
  };
}

module.exports = { createLegacyFacade };
