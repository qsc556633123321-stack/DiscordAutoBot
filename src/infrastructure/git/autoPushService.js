const { fail } = require('../../core/result');

function unavailable() {
  return fail('GIT_OPERATION_DISABLED', 'Git operations are intentionally executed outside the running Discord bot.');
}

module.exports = { push: unavailable };
