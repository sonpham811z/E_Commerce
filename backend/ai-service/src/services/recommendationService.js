const axios = require('axios');
const UserPreferenceModel = require('../models/UserPreference');
const logger = require('../utils/logger');

const CORE_SERVICE_URL = process.env.CORE_SERVICE_URL || 'http://localhost:3003';

class RecommendationService {
  async getForUser(user_id, { limit = 8, authHeader } = {}) {
    const prefs = await UserPreferenceModel.findByUserId(user_id);

    if (!prefs || (!prefs.viewed_categories?.length && !prefs.viewed_products?.length)) {
      return this._getFeatured(limit, authHeader);
    }

    try {
      const params = new URLSearchParams({
        limit,
        ...(prefs.viewed_categories?.length && { categories: prefs.viewed_categories.join(',') }),
        ...(prefs.viewed_products?.length && {
          exclude: prefs.viewed_products.slice(0, 10).join(','),
        }),
      });

      const { data } = await axios.get(
        `${CORE_SERVICE_URL}/api/v1/products?${params}`,
        { headers: authHeader ? { Authorization: authHeader } : {}, timeout: 5000 }
      );

      return data.data?.products || [];
    } catch (err) {
      logger.warn('Core service unavailable for recommendations:', err.message);
      return [];
    }
  }

  async getSimilar(product_id, { limit = 6, authHeader } = {}) {
    try {
      const { data } = await axios.get(
        `${CORE_SERVICE_URL}/api/v1/products/${product_id}`,
        { headers: authHeader ? { Authorization: authHeader } : {}, timeout: 5000 }
      );

      const product = data.data;
      if (!product) return [];

      const { data: similarData } = await axios.get(
        `${CORE_SERVICE_URL}/api/v1/products?category=${product.category}&limit=${limit + 1}`,
        { headers: authHeader ? { Authorization: authHeader } : {}, timeout: 5000 }
      );

      return (similarData.data?.products || []).filter((p) => p.id !== product_id).slice(0, limit);
    } catch (err) {
      logger.warn('Failed to fetch similar products:', err.message);
      return [];
    }
  }

  async recordView(user_id, product_id, category) {
    await Promise.all([
      UserPreferenceModel.appendViewedProduct(user_id, product_id),
      category
        ? UserPreferenceModel.upsert(user_id, {
            viewed_categories: [category],
            viewed_products: null,
            search_history: null,
          })
        : Promise.resolve(),
    ]);
  }

  async recordSearch(user_id, term) {
    if (term?.trim()) {
      await UserPreferenceModel.appendSearchTerm(user_id, term.trim().toLowerCase());
    }
  }

  async _getFeatured(limit, authHeader) {
    try {
      const { data } = await axios.get(
        `${CORE_SERVICE_URL}/api/v1/products?featured=true&limit=${limit}`,
        { headers: authHeader ? { Authorization: authHeader } : {}, timeout: 5000 }
      );
      return data.data?.products || [];
    } catch {
      return [];
    }
  }
}

module.exports = new RecommendationService();
