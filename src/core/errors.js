class ApplicationError extends Error {
  constructor(code, message, details = null) {
    super(message);
    this.name = 'ApplicationError';
    this.code = code;
    this.details = details;
  }
}

module.exports = { ApplicationError };
