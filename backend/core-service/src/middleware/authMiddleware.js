const axios = require('axios');
const logger = require('../utils/logger');

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authorization token required' });
  }

  try {
    const { data } = await axios.get(`${AUTH_SERVICE_URL}/api/v1/auth/verify`, {
      headers: { Authorization: authHeader },
      timeout: 5000,
    });
    req.user = data.data.user;
    next();
  } catch (err) {
    logger.warn('Token verification failed:', err.message);
    const status = err.response?.status || 401;
    res.status(status).json({ success: false, error: err.response?.data?.error || 'Invalid token' });
  }
};

const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return next();

  try {
    const { data } = await axios.get(`${AUTH_SERVICE_URL}/api/v1/auth/verify`, {
      headers: { Authorization: authHeader },
      timeout: 5000,
    });
    req.user = data.data.user;
  } catch {
    // non-blocking
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }
  next();
};

module.exports = { authenticate, optionalAuth, requireAdmin };
