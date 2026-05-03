const { query } = require('../config/database');

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = parseInt(process.env.DEFAULT_PAGE_SIZE) || 20;
const MAX_LIMIT = parseInt(process.env.MAX_PAGE_SIZE) || 100;

const CATEGORY_ALIASES = {
  laptop: ['laptop', 'laptop gaming'],
  laptops: ['laptop', 'laptop gaming'],
  keyboard: ['bàn phím'],
  keyboards: ['bàn phím'],
  headset: ['tai nghe'],
  headsets: ['tai nghe'],
  headphone: ['tai nghe'],
  headphones: ['tai nghe'],
  ssd: ['linh kiện'],
  storage: ['linh kiện'],
  mouse: ['chuột'],
  mice: ['chuột'],
  monitor: ['màn hình'],
  monitors: ['màn hình'],
  pc: ['pc gaming'],
  gaming: ['pc gaming'],
};

function getCategoryVariants(category) {
  const normalized = String(category || '').trim().toLowerCase();
  if (!normalized) return [];
  return [...new Set(CATEGORY_ALIASES[normalized] || [normalized])];
}

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
    const pageNum = Math.max(parseInt(page) || DEFAULT_PAGE, 1);
    const offset = (pageNum - 1) * cap;

    const params = [];
    const conditions = [];

    // Always filter by is_active
    params.push(is_active);
    conditions.push(`p.is_active = $${params.length}`);

    // Category filter with aliases
    if (category) {
      const variants = getCategoryVariants(category);
      if (variants.length > 0) {
        const placeholders = [];
        for (const variant of variants) {
          params.push(variant);
          params.push(`${variant}-%`);
          placeholders.push(`(LOWER(p.category) = $${params.length - 1} OR LOWER(p.category) LIKE $${params.length})`);
        }
        conditions.push(`(${placeholders.join(' OR ')})`);
      }
    }

    if (category) { conditions.push(`p.category ILIKE $${values.push(category)}`); }
    if (featured !== undefined) { conditions.push(`p.is_featured = $${values.push(featured === 'true' || featured === true)}`); }
    if (min_price) { conditions.push(`p.price >= $${values.push(parseFloat(min_price))}`); }
    if (max_price) { conditions.push(`p.price <= $${values.push(parseFloat(max_price))}`); }
    if (search) {
      const searchIdx = values.push(`%${search}%`);
      conditions.push(`(p.title ILIKE $${searchIdx} OR p.description ILIKE $${searchIdx})`);
    }

    // Price range filter
    if (min_price) {
      params.push(parseFloat(min_price));
      conditions.push(`p.price >= $${params.length}`);
    }
    if (max_price) {
      params.push(parseFloat(max_price));
      conditions.push(`p.price <= $${params.length}`);
    }

    // Search filter
    if (search) {
      const searchTerm = `%${search}%`;
      params.push(searchTerm);
      params.push(searchTerm);
      conditions.push(`(p.title ILIKE $${params.length - 1} OR p.description ILIKE $${params.length})`);
    }

    const whereClause = conditions.join(' AND ');
    
    const sortMap = {
      price_asc: 'p.price ASC',
      price_desc: 'p.price DESC',
      rating: 'p.rating DESC',
      newest: 'p.created_at DESC',
    };
    const orderBy = sortMap[sort] || 'p.created_at DESC';

    // Get count
    const { rows: countRows } = await query(
      `SELECT COUNT(*) as count FROM products p WHERE ${whereClause}`,
      params
    );

    // Get paginated products
    params.push(cap, offset);
    const { rows: products } = await query(
      `SELECT p.*, c.name as category_name FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE ${whereClause}
       ORDER BY ${orderBy}
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    return {
      products,
      total: parseInt(countRows[0].count),
      page: pageNum,
      limit: cap,
      pages: Math.ceil(parseInt(countRows[0].count) / cap),
    };
  }

  static async create(data) {
    const { title, description, category, category_id, brand, specs, image, images, price, original_price, sale_price, stock, rating, review_count, is_active, is_featured } = data;
    const { rows } = await query(
      `INSERT INTO products (title, description, category, category_id, brand, specs, image, images, price, original_price, sale_price, stock, rating, review_count, is_active, is_featured)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       RETURNING *`,
      [title, description, category, category_id, brand, JSON.stringify(specs || {}), image, JSON.stringify(images || []), price, original_price, sale_price, stock ?? 0, rating ?? 0, review_count ?? 0, is_active ?? true, is_featured ?? false]
    );
    return rows[0];
  }

  static async updateById(id, data) {
    const allowed = ['title', 'description', 'category', 'category_id', 'brand', 'specs', 'image', 'images', 'price', 'original_price', 'sale_price', 'stock', 'rating', 'review_count', 'is_active', 'is_featured'];
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
