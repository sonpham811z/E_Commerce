const { query } = require('../config/database');

class ChatHistoryModel {
  static async create({ user_id, session_id, role, content }) {
    const { rows } = await query(
      `INSERT INTO chat_history (user_id, session_id, role, content)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [user_id, session_id, role, content]
    );
    return rows[0];
  }

  static async getSession(session_id, limit = 50) {
    const { rows } = await query(
      `SELECT * FROM chat_history
       WHERE session_id = $1
       ORDER BY created_at ASC
       LIMIT $2`,
      [session_id, limit]
    );
    return rows;
  }

  static async getUserSessions(user_id, limit = 10) {
    const { rows } = await query(
      `SELECT DISTINCT ON (session_id) session_id, content, created_at
       FROM chat_history
       WHERE user_id = $1 AND role = 'user'
       ORDER BY session_id, created_at DESC
       LIMIT $2`,
      [user_id, limit]
    );
    return rows;
  }

  static async deleteSession(session_id, user_id) {
    await query(
      'DELETE FROM chat_history WHERE session_id = $1 AND user_id = $2',
      [session_id, user_id]
    );
  }

  static async countUserMessages(user_id, windowMinutes = 60) {
    const { rows } = await query(
      `SELECT COUNT(*) FROM chat_history
       WHERE user_id = $1 AND role = 'user'
         AND created_at > NOW() - INTERVAL '${windowMinutes} minutes'`,
      [user_id]
    );
    return parseInt(rows[0].count);
  }
}

module.exports = ChatHistoryModel;
