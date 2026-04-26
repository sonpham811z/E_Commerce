const crypto = require('crypto');

const generateResetToken = () => crypto.randomBytes(32).toString('hex');

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const sanitizeUser = (user) => {
  const { password_hash, ...safeUser } = user;
  return safeUser;
};

const isExpired = (date) => new Date(date) < new Date();

module.exports = { generateResetToken, hashToken, sanitizeUser, isExpired };
