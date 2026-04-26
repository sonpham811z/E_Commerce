const { query } = require('../config/database');

class UserModel {
  static async findById(id) {
    const { rows } = await query(
      'SELECT * FROM users WHERE id = $1 AND is_active = true',
      [id]
    );
    return rows[0] || null;
  }

  static async findByEmail(email) {
    const { rows } = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return rows[0] || null;
  }

  static async create({ email, password_hash, full_name, phone, role = 'user' }) {
    const { rows } = await query(
      `INSERT INTO users (email, password_hash, full_name, phone, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [email, password_hash, full_name, phone, role]
    );
    return rows[0];
  }

  static async updateById(id, fields) {
    const allowed = ['full_name', 'phone', 'avatar_url', 'is_active'];
    const updates = Object.entries(fields)
      .filter(([k]) => allowed.includes(k))
      .map(([k], i) => `${k} = $${i + 2}`);

    if (!updates.length) return null;

    const values = Object.entries(fields)
      .filter(([k]) => allowed.includes(k))
      .map(([, v]) => v);

    const { rows } = await query(
      `UPDATE users SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return rows[0] || null;
  }

  static async updatePassword(id, password_hash) {
    await query(
      'UPDATE users SET password_hash = $2, updated_at = NOW() WHERE id = $1',
      [id, password_hash]
    );
  }

  static async storeRefreshToken(userId, tokenHash, expiresAt) {
    await query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id) DO UPDATE
       SET token_hash = $2, expires_at = $3, created_at = NOW()`,
      [userId, tokenHash, expiresAt]
    );
  }

  static async findRefreshToken(tokenHash) {
    const { rows } = await query(
      `SELECT rt.*, u.id as user_id, u.email, u.role, u.is_active
       FROM refresh_tokens rt
       JOIN users u ON rt.user_id = u.id
       WHERE rt.token_hash = $1 AND rt.expires_at > NOW()`,
      [tokenHash]
    );
    return rows[0] || null;
  }

  static async deleteRefreshToken(userId) {
    await query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
  }

  static async storePasswordResetToken(userId, tokenHash, expiresAt) {
    await query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id) DO UPDATE
       SET token_hash = $2, expires_at = $3, created_at = NOW()`,
      [userId, tokenHash, expiresAt]
    );
  }

  static async findPasswordResetToken(tokenHash) {
    const { rows } = await query(
      `SELECT prt.*, u.id as user_id
       FROM password_reset_tokens prt
       JOIN users u ON prt.user_id = u.id
       WHERE prt.token_hash = $1 AND prt.expires_at > NOW() AND prt.used = false`,
      [tokenHash]
    );
    return rows[0] || null;
  }

  static async markResetTokenUsed(tokenHash) {
    await query(
      'UPDATE password_reset_tokens SET used = true WHERE token_hash = $1',
      [tokenHash]
    );
  }

  static async adminUpdateById(id, fields) {
    const allowed = ['full_name', 'phone', 'avatar_url', 'is_active', 'role'];
    const entries = Object.entries(fields).filter(([k]) => allowed.includes(k));
    if (!entries.length) return null;

    const updates = entries.map(([k], i) => `${k} = $${i + 2}`);
    const values  = entries.map(([, v]) => v);

    const { rows } = await query(
      `UPDATE users SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $1 RETURNING id, email, full_name, phone, role, avatar_url, is_active, created_at, updated_at`,
      [id, ...values]
    );
    return rows[0] || null;
  }

  static async listAll({ page = 1, limit = 20, role, is_active } = {}) {
    const conditions = [];
    const values = [];

    if (role) { conditions.push(`role = $${values.push(role)}`); }
    if (is_active !== undefined) { conditions.push(`is_active = $${values.push(is_active)}`); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    const [{ rows: data }, { rows: countRows }] = await Promise.all([
      query(
        `SELECT id, email, full_name, phone, role, avatar_url, is_active, created_at
         FROM users ${where} ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
        [...values, limit, offset]
      ),
      query(`SELECT COUNT(*) FROM users ${where}`, values),
    ]);

    return { data, total: parseInt(countRows[0].count), page, limit };
  }
}

module.exports = UserModel;
