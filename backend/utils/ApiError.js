// A small custom error that carries an HTTP status code alongside the message.
// Controllers throw `new ApiError(404, 'List not found')` and the central
// error handler turns it into a proper HTTP response.
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = ApiError;
