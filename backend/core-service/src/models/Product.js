const { query } = require('../config/database');

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = parseInt(process.env.DEFAULT_PAGE_SIZE) || 20;
const MAX_LIMIT = parseInt(process.env.MAX_PAGE_SIZE) || 100;

class ProductModel {
  static async findById(id) {
    const { rows } = await query(
      'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = $1',
      [id]
    );
    return rows[0] || null;
  }

  static async list({ page = DEFAULT_PAGE, limit = DEFAULT_LIMIT, category, search, min_price, max_price, sort, featured, is_active = true } = {}) {
    const cap = Math.min(limit, MAX_LIMIT);
    const conditions = ['p.is_active = $1'];
    const values = [is_active];

    if (category) { conditions.push(`p.category = $${values.push(category)}`); }
    if (featured !== undefined) { conditions.push(`p.is_featured = $${values.push(featured === 'true' || featured === true)}`); }
    if (min_price) { conditions.push(`p.price >= $${values.push(parseFloat(min_price))}`); }
    if (max_price) { conditions.push(`p.price <= $${values.push(parseFloat(max_price))}`); }
    if (search) {
      conditions.push(`(p.title ILIKE $${values.push(`%${search}%`)} OR p.description ILIKE $${values.length})`);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const sortMap = {
      price_asc: 'p.price ASC',
      price_desc: 'p.price DESC',
      rating: 'p.rating DESC',
      newest: 'p.created_at DESC',
    };
    const orderBy = sortMap[sort] || 'p.created_at DESC';
    const offset = (page - 1) * cap;

    const [{ rows: products }, { rows: countRows }] = await Promise.all([
      query(
        `SELECT p.*, c.name as category_name FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         ${where} ORDER BY ${orderBy} LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
        [...values, cap, offset]
      ),
      query(`SELECT COUNT(*) FROM products p ${where}`, values),
    ]);

    return {
      products,
      total: parseInt(countRows[0].count),
      page: parseInt(page),
      limit: cap,
      pages: Math.ceil(parseInt(countRows[0].count) / cap),
    };
  }

  static async create(data) {
    const { title, description, category, category_id, image, images, price, original_price, sale_price, stock, rating, is_active, is_featured } = data;
    const { rows } = await query(
      `INSERT INTO products (title, description, category, category_id, image, images, price, original_price, sale_price, stock, rating, is_active, is_featured)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [title, description, category, category_id, image, JSON.stringify(images || []), price, original_price, sale_price, stock ?? 0, rating ?? 0, is_active ?? true, is_featured ?? false]
    );
    return rows[0];
  }

  static async updateById(id, data) {
    const allowed = ['title', 'description', 'category', 'category_id', 'image', 'images', 'price', 'original_price', 'sale_price', 'stock', 'rating', 'is_active', 'is_featured'];
    const updates = Object.entries(data)
      .filter(([k]) => allowed.includes(k))
      .map(([k], i) => `${k} = $${i + 2}`);

    if (!updates.length) return null;

    const values = Object.entries(data)
      .filter(([k]) => allowed.includes(k))
      .map(([, v]) => v);

    const { rows } = await query(
      `UPDATE products SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return rows[0] || null;
  }

  static async deleteById(id) {
    const { rowCount } = await query('DELETE FROM products WHERE id = $1', [id]);
    return rowCount > 0;
  }

  static async updateStock(id, delta) {
    const { rows } = await query(
      `UPDATE products SET stock = GREATEST(0, stock + $2), updated_at = NOW()
       WHERE id = $1 RETURNING id, stock`,
      [id, delta]
    );
    return rows[0] || null;
  }

  static async suggestions(term, limit = 5) {
    const { rows } = await query(
      `SELECT id, title, category, image FROM products
       WHERE title ILIKE $1 AND is_active = true
       ORDER BY rating DESC LIMIT $2`,
      [`${term}%`, limit]
    );
    return rows;
  }
}

module.exports = ProductModel;
