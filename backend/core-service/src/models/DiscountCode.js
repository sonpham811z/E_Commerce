const { query } = require('../config/database');

class DiscountCodeModel {
  static async findByCode(code) {
    const { rows } = await query(
      `SELECT * FROM discount_codes
       WHERE code = $1 AND is_active = true
         AND (starts_at IS NULL OR starts_at <= NOW())
         AND (expires_at IS NULL OR expires_at > NOW())
         AND (max_uses IS NULL OR used_count < max_uses)`,
      [code.toUpperCase()]
    );
    return rows[0] || null;
  }

  static async findById(id) {
    const { rows } = await query('SELECT * FROM discount_codes WHERE id = $1', [id]);
    return rows[0] || null;
  }

  static async findAll({ page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;
    const [{ rows: data }, { rows: countRows }] = await Promise.all([
      query('SELECT * FROM discount_codes ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]),
      query('SELECT COUNT(*) FROM discount_codes'),
    ]);
    return { data, total: parseInt(countRows[0].count), page, limit };
  }

  static async create({ code, discount_type, discount_value, min_order_value, max_uses, starts_at, expires_at }) {
    const { rows } = await query(
      `INSERT INTO discount_codes
         (code, discount_type, discount_value, min_order_value, max_uses, starts_at, expires_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [code.toUpperCase(), discount_type, discount_value, min_order_value, max_uses, starts_at, expires_at]
    );
    return rows[0];
  }

  static async incrementUsage(code) {
    await query(
      'UPDATE discount_codes SET used_count = used_count + 1 WHERE code = $1',
      [code.toUpperCase()]
    );
  }

  static async validate(code, order_total) {
    const discount = await this.findByCode(code);
    if (!discount) return { valid: false, error: 'Invalid or expired discount code' };
    if (discount.min_order_value && order_total < discount.min_order_value) {
      return {
        valid: false,
        error: `Minimum order value of ${discount.min_order_value} required`,
      };
    }

    const amount = discount.discount_type === 'percentage'
      ? (order_total * discount.discount_value) / 100
      : discount.discount_value;

    return { valid: true, discount, amount: Math.min(amount, order_total) };
  }
}

module.exports = DiscountCodeModel;
