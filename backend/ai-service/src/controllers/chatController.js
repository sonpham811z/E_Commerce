const chatService = require('../services/chatService');

class ChatController {
  async sendMessage(req, res, next) {
    try {
      const { message, session_id } = req.body;
      if (!message?.trim()) {
        return res.status(422).json({ success: false, error: 'Message is required' });
      }

      const result = await chatService.sendMessage({
        user_id: req.user?.id || null,
        session_id,
        message: message.trim(),
      });

      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getHistory(req, res, next) {
    try {
      const { session_id } = req.params;
      const history = await chatService.getHistory(session_id);
      res.json({ success: true, data: history });
    } catch (err) {
      next(err);
    }
  }

  async getUserSessions(req, res, next) {
    try {
      const sessions = await chatService.getUserSessions(req.user.id);
      res.json({ success: true, data: sessions });
    } catch (err) {
      next(err);
    }
  }

  async deleteSession(req, res, next) {
    try {
      await chatService.deleteSession(req.params.session_id, req.user.id);
      res.json({ success: true, message: 'Session deleted' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ChatController();
