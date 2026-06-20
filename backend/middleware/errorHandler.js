// Central error handler. Everything thrown or rejected in a route ends up here,
// so error responses stay consistent and we never leak stack traces to clients.
// Express recognises it as an error handler because it takes four arguments.
const errorHandler = (err, req, res, next) => {
  // Duplicate key from the unique {listId, phone} index = phone already in list.
  if (err.code === 11000) {
    return res.status(409).json({ message: 'This phone number already exists in the list' });
  }

  // Schema validation failures (e.g. missing required field).
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }

  // Malformed id in the URL (e.g. /api/lists/not-an-id).
  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Invalid ${err.path}: ${err.value}` });
  }

  const status = err.statusCode || 500;
  if (status === 500) console.error(err);

  res.status(status).json({ message: err.message || 'Internal server error' });
};

module.exports = errorHandler;
