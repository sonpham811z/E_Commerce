const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(`${req.method} ${req.path} - ${err.message}`, err);

  if (err.code === '23505') {
    return res.status(409).json({ success: false, error: 'Resource already exists' });
  }
  if (err.code === '23503') {
    return res.status(400).json({ success: false, error: 'Referenced resource not found' });
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'Internal server error'
    : err.message;

  res.status(statusCode).json({ success: false, error: message });
};

module.exports = errorHandler;
