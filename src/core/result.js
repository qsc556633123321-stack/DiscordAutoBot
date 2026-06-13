function ok(data = null, meta = {}) {
  return { ok: true, data, meta };
}

function fail(code, message, details = null) {
  return { ok: false, error: { code, message, details } };
}

function fromThrowable(error, code = 'UNEXPECTED_ERROR') {
  return fail(code, error?.message || 'Unexpected error', { cause: error });
}

module.exports = { fail, fromThrowable, ok };
