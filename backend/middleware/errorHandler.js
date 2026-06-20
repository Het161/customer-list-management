const errorHandler = (err, req, res, next) => {
  // duplicate key on the {listId, phone} index
  if (err.code === 11000) {
    return res.status(409).json({ message: 'This phone number already exists in the list' });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Invalid ${err.path}: ${err.value}` });
  }

  const status = err.statusCode || 500;
  if (status === 500) console.error(err);

  res.status(status).json({ message: err.message || 'Internal server error' });
};

module.exports = errorHandler;
