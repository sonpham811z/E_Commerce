const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const UserModel = require('../models/User');
const { generateTokenPair, verifyRefreshToken } = require('../config/jwt');
const { generateResetToken, hashToken, sanitizeUser, isExpired } = require('../utils/helpers');
const logger = require('../utils/logger');

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;

class AuthService {
  async register({ email, password, full_name, phone }) {
    const existing = await UserModel.findByEmail(email);
    if (existing) {
      const err = new Error('Email already registered');
      err.statusCode = 409;
      throw err;
    }

    const password_hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await UserModel.create({ email, password_hash, full_name, phone });

    logger.info(`New user registered: ${email}`);
    return { user: sanitizeUser(user) };
  }

  async login({ email, password }) {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }

    if (!user.is_active) {
      const err = new Error('Account is deactivated');
      err.statusCode = 403;
      throw err;
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const tokens = generateTokenPair(payload);

    const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await UserModel.storeRefreshToken(user.id, hashToken(tokens.refreshToken), refreshExpiry);

    logger.info(`User logged in: ${email}`);
    return { user: sanitizeUser(user), ...tokens };
  }

  async refreshToken(refreshToken) {
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      const err = new Error('Invalid or expired refresh token');
      err.statusCode = 401;
      throw err;
    }

    const stored = await UserModel.findRefreshToken(hashToken(refreshToken));
    if (!stored || !stored.is_active) {
      const err = new Error('Refresh token not found or account deactivated');
      err.statusCode = 401;
      throw err;
    }

    const payload = { sub: stored.user_id, email: stored.email, role: stored.role };
    const tokens = generateTokenPair(payload);

    const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await UserModel.storeRefreshToken(stored.user_id, hashToken(tokens.refreshToken), refreshExpiry);

    return tokens;
  }

  async logout(userId) {
    await UserModel.deleteRefreshToken(userId);
    logger.info(`User logged out: ${userId}`);
  }

  async getProfile(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }
    return sanitizeUser(user);
  }

  async updateProfile(userId, updates) {
    const user = await UserModel.updateById(userId, updates);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }
    return sanitizeUser(user);
  }

  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await UserModel.findById(userId);
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      const err = new Error('Current password is incorrect');
      err.statusCode = 400;
      throw err;
    }
    const newHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await UserModel.updatePassword(userId, newHash);
    await UserModel.deleteRefreshToken(userId);
    logger.info(`Password changed for user: ${userId}`);
  }

  async forgotPassword(email) {
    const user = await UserModel.findByEmail(email);
    if (!user) return; // Silently succeed to prevent email enumeration

    const resetToken = generateResetToken();
    const tokenHash = hashToken(resetToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await UserModel.storePasswordResetToken(user.id, tokenHash, expiresAt);
    await this._sendResetEmail(email, resetToken);
    logger.info(`Password reset requested for: ${email}`);
  }

  async resetPassword({ token, password }) {
    const tokenHash = hashToken(token);
    const record = await UserModel.findPasswordResetToken(tokenHash);
    if (!record) {
      const err = new Error('Invalid or expired reset token');
      err.statusCode = 400;
      throw err;
    }
    const newHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    await UserModel.updatePassword(record.user_id, newHash);
    await UserModel.markResetTokenUsed(tokenHash);
    await UserModel.deleteRefreshToken(record.user_id);
    logger.info(`Password reset completed for user: ${record.user_id}`);
  }

  async adminListUsers(filters) {
    return UserModel.listAll(filters);
  }

  async adminUpdateUser(id, updates) {
    const user = await UserModel.adminUpdateById(id, updates);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }
    logger.info(`Admin updated user: ${id}`);
    return sanitizeUser(user);
  }

  async adminDeactivateUser(id) {
    const user = await UserModel.adminUpdateById(id, { is_active: false });
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }
    await UserModel.deleteRefreshToken(id);
    logger.info(`Admin deactivated user: ${id}`);
  }

  async verifyToken(token) {
    const { verifyAccessToken } = require('../config/jwt');
    try {
      const decoded = verifyAccessToken(token);
      const user = await UserModel.findById(decoded.sub);
      if (!user) {
        const err = new Error('User not found');
        err.statusCode = 401;
        throw err;
      }
      return { valid: true, user: sanitizeUser(user) };
    } catch (e) {
      if (e.statusCode) throw e;
      const err = new Error('Invalid token');
      err.statusCode = 401;
      throw err;
    }
  }

  async _sendResetEmail(email, token) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Password Reset Request',
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 1 hour.</p>`,
    });
  }
}

module.exports = new AuthService();
