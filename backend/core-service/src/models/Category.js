const { query } = require('../config/database');

class CategoryModel {
  static async findAll() {
    const { rows } = await query(
      'SELECT * FROM categories WHERE is_active = true ORDER BY name ASC'
    );
    return rows;
  }

  static async findById(id) {
    const { rows } = await query('SELECT * FROM categories WHERE id = $1', [id]);
    return rows[0] || null;
  }

  static async findBySlug(slug) {
    const { rows } = await query('SELECT * FROM categories WHERE slug = $1', [slug]);
    return rows[0] || null;
  }

  static async create({ name, slug, description, image, parent_id }) {
    const { rows } = await query(
      `INSERT INTO categories (name, slug, description, image, parent_id)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [name, slug, description, image, parent_id]
    );
    return rows[0];
  }

  static async updateById(id, data) {
    const allowed = ['name', 'slug', 'description', 'image', 'parent_id', 'is_active'];
    const updates = Object.entries(data)
      .filter(([k]) => allowed.includes(k))
      .map(([k], i) => `${k} = $${i + 2}`);

    if (!updates.length) return null;

    const values = Object.entries(data)
      .filter(([k]) => allowed.includes(k))
      .map(([, v]) => v);

    const { rows } = await query(
      `UPDATE categories SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return rows[0] || null;
  }

  static async deleteById(id) {
    const { rowCount } = await query(
      'UPDATE categories SET is_active = false WHERE id = $1',
      [id]
    );
    return rowCount > 0;
  }
}

module.exports = CategoryModel;
