const authService = require('../services/authService');

class AuthController {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const tokens = await authService.refreshToken(req.body.refreshToken);
      res.json({ success: true, data: tokens });
    } catch (err) {
      next(err);
    }
  }

  async logout(req, res, next) {
    try {
      await authService.logout(req.user.sub);
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  }

  async getProfile(req, res, next) {
    try {
      const user = await authService.getProfile(req.user.sub);
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const user = await authService.updateProfile(req.user.sub, req.body);
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req, res, next) {
    try {
      await authService.changePassword(req.user.sub, req.body);
      res.json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
      next(err);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      await authService.forgotPassword(req.body.email);
      res.json({ success: true, message: 'If that email exists, a reset link has been sent' });
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req, res, next) {
    try {
      await authService.resetPassword(req.body);
      res.json({ success: true, message: 'Password reset successfully' });
    } catch (err) {
      next(err);
    }
  }

  async adminListUsers(req, res, next) {
    try {
      const result = await authService.adminListUsers(req.query);
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  }

  async adminUpdateUser(req, res, next) {
    try {
      const user = await authService.adminUpdateUser(req.params.id, req.body);
      res.json({ success: true, data: user });
    } catch (err) { next(err); }
  }

  async adminDeactivateUser(req, res, next) {
    try {
      await authService.adminDeactivateUser(req.params.id);
      res.json({ success: true, message: 'User deactivated' });
    } catch (err) { next(err); }
  }

  async verifyToken(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, error: 'No token provided' });
      }
      const token = authHeader.split(' ')[1];
      const result = await authService.verifyToken(token);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
