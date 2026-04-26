const axios = require('axios');
const UserPreferenceModel = require('../models/UserPreference');
const logger = require('../utils/logger');

const CORE_SERVICE_URL = process.env.CORE_SERVICE_URL || 'http://localhost:3003';

class SearchService {
  async search({ query, category, min_price, max_price, sort, page = 1, limit = 20, user_id, authHeader }) {
    if (user_id && query) {
      UserPreferenceModel.appendSearchTerm(user_id, query).catch(() => {});
    }

    const params = new URLSearchParams({
      ...(query && { search: query }),
      ...(category && { category }),
      ...(min_price && { min_price }),
      ...(max_price && { max_price }),
      ...(sort && { sort }),
      page,
      limit,
    });

    try {
      const { data } = await axios.get(
        `${CORE_SERVICE_URL}/api/v1/products?${params}`,
        { headers: authHeader ? { Authorization: authHeader } : {}, timeout: 8000 }
      );
      return data.data;
    } catch (err) {
      logger.error('Search failed:', err.message);
      const serviceErr = new Error('Search service temporarily unavailable');
      serviceErr.statusCode = 503;
      throw serviceErr;
    }
  }

  async suggest(term, limit = 5) {
    if (!term || term.length < 2) return [];

    try {
      const { data } = await axios.get(
        `${CORE_SERVICE_URL}/api/v1/products/suggestions?q=${encodeURIComponent(term)}&limit=${limit}`,
        { timeout: 3000 }
      );
      return data.data || [];
    } catch {
      return [];
    }
  }
}

module.exports = new SearchService();
