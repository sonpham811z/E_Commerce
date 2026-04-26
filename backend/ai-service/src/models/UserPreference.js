const { query } = require('../config/database');

class UserPreferenceModel {
  static async upsert(user_id, { viewed_categories, viewed_products, search_history }) {
    const { rows } = await query(
      `INSERT INTO user_preferences (user_id, viewed_categories, viewed_products, search_history)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id) DO UPDATE
       SET
         viewed_categories = COALESCE($2, user_preferences.viewed_categories),
         viewed_products   = COALESCE($3, user_preferences.viewed_products),
         search_history    = COALESCE($4, user_preferences.search_history),
         updated_at        = NOW()
       RETURNING *`,
      [user_id, viewed_categories, viewed_products, search_history]
    );
    return rows[0];
  }

  static async findByUserId(user_id) {
    const { rows } = await query(
      'SELECT * FROM user_preferences WHERE user_id = $1',
      [user_id]
    );
    return rows[0] || null;
  }

  static async appendViewedProduct(user_id, product_id) {
    await query(
      `INSERT INTO user_preferences (user_id, viewed_products)
       VALUES ($1, ARRAY[$2::uuid])
       ON CONFLICT (user_id) DO UPDATE
       SET viewed_products = (
         SELECT ARRAY(
           SELECT DISTINCT unnest(
             array_cat(ARRAY[$2::uuid], user_preferences.viewed_products[1:49])
           )
         )
       ), updated_at = NOW()`,
      [user_id, product_id]
    );
  }

  static async appendSearchTerm(user_id, term) {
    await query(
      `INSERT INTO user_preferences (user_id, search_history)
       VALUES ($1, ARRAY[$2])
       ON CONFLICT (user_id) DO UPDATE
       SET search_history = (
         SELECT ARRAY(
           SELECT DISTINCT unnest(
             array_cat(ARRAY[$2], user_preferences.search_history[1:19])
           )
         )
       ), updated_at = NOW()`,
      [user_id, term]
    );
  }
}

module.exports = UserPreferenceModel;
