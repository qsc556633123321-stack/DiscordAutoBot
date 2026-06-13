const LEVELS = ['info', 'warn', 'error', 'audit'];

function emit(level, message, context = {}) {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context
  };
  const writer = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
  writer(`[${level.toUpperCase()}] ${message}`, Object.keys(context).length ? context : '');
  return payload;
}

module.exports = Object.fromEntries(LEVELS.map((level) => [
  level,
  (message, context) => emit(level, message, context)
]));
