// Wraps an async controller so any rejected promise is forwarded to Express's
// error handler via next(). Without this we'd need a try/catch in every route.
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
