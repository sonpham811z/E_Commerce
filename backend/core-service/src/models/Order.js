const { query, getClient } = require('../config/database');

class OrderModel {
  static async findById(id) {
    const { rows } = await query(
      `SELECT o.*, json_agg(oi.*) as items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE o.id = $1 AND o.deleted_at IS NULL
       GROUP BY o.id`,
      [id]
    );
    return rows[0] || null;
  }

  static async findByUserId(user_id, { page = 1, limit = 20, status } = {}) {
    const conditions = ['o.user_id = $1', 'o.deleted_at IS NULL'];
    const values = [user_id];

    if (status) conditions.push(`o.status = $${values.push(status)}`);

    const where = `WHERE ${conditions.join(' AND ')}`;
    const offset = (page - 1) * limit;

    const [{ rows: orders }, { rows: countRows }] = await Promise.all([
      query(
        `SELECT o.*, json_agg(oi.*) as items
         FROM orders o
         LEFT JOIN order_items oi ON oi.order_id = o.id
         ${where}
         GROUP BY o.id ORDER BY o.order_date DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
        [...values, limit, offset]
      ),
      query(`SELECT COUNT(*) FROM orders o ${where}`, values),
    ]);

    return { orders, total: parseInt(countRows[0].count), page, limit };
  }

  static async listAll({ page = 1, limit = 20, status, search } = {}) {
    const conditions = ['o.deleted_at IS NULL'];
    const values = [];

    if (status) conditions.push(`o.status = $${values.push(status)}`);
    if (search) conditions.push(`(o.customer_name ILIKE $${values.push(`%${search}%`)} OR o.phone ILIKE $${values.length})`);

    const where = `WHERE ${conditions.join(' AND ')}`;
    const offset = (page - 1) * limit;

    const [{ rows: orders }, { rows: countRows }] = await Promise.all([
      query(
        `SELECT o.* FROM orders o ${where}
         ORDER BY o.order_date DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
        [...values, limit, offset]
      ),
      query(`SELECT COUNT(*) FROM orders o ${where}`, values),
    ]);

    return { orders, total: parseInt(countRows[0].count), page, limit };
  }

  static async create({ user_id, customer_name, phone, address, items, shipping_method, payment_method, shipping_fee, discount, discount_code }) {
    const client = await getClient();
    try {
      await client.query('BEGIN');

      const product_price = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const total = product_price + (shipping_fee || 0) - (discount || 0);

      const { rows: [order] } = await client.query(
        `INSERT INTO orders
           (user_id, customer_name, phone, address, shipping_method, payment_method,
            product_price, shipping_fee, discount, discount_code, total, status, payment_status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'pending','pending')
         RETURNING *`,
        [user_id, customer_name, phone, JSON.stringify(address), shipping_method, payment_method,
         product_price, shipping_fee || 0, discount || 0, discount_code || null, total]
      );

      const itemInserts = items.map(({ product_id, product_name, product_image, quantity, price }) =>
        client.query(
          `INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [order.id, product_id, product_name, product_image, quantity, price]
        )
      );
      await Promise.all(itemInserts);

      await client.query('COMMIT');
      return order;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  static async updateStatus(id, status) {
    const { rows } = await query(
      `UPDATE orders SET status = $2, updated_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL RETURNING *`,
      [id, status]
    );
    return rows[0] || null;
  }

  static async updatePaymentStatus(id, payment_status) {
    const { rows } = await query(
      `UPDATE orders SET payment_status = $2, updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [id, payment_status]
    );
    return rows[0] || null;
  }

  static async softDelete(id) {
    const { rowCount } = await query(
      "UPDATE orders SET deleted_at = NOW(), status = 'deleted' WHERE id = $1 AND deleted_at IS NULL",
      [id]
    );
    return rowCount > 0;
  }

  static async getRevenueSummary({ start_date, end_date } = {}) {
    const conditions = ["status = 'delivered'", "payment_status = 'paid'", 'deleted_at IS NULL'];
    const values = [];

    if (start_date) conditions.push(`order_date >= $${values.push(start_date)}`);
    if (end_date) conditions.push(`order_date <= $${values.push(end_date)}`);

    const { rows } = await query(
      `SELECT
         COUNT(*) as total_orders,
         SUM(total) as total_revenue,
         AVG(total) as avg_order_value,
         DATE_TRUNC('day', order_date) as date
       FROM orders
       WHERE ${conditions.join(' AND ')}
       GROUP BY DATE_TRUNC('day', order_date)
       ORDER BY date DESC`,
      values
    );
    return rows;
  }
}

module.exports = OrderModel;
