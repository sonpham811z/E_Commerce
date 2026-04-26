const recommendationService = require('../services/recommendationService');
const searchService = require('../services/searchService');

class RecommendationController {
  async getForUser(req, res, next) {
    try {
      const limit = Math.min(parseInt(req.query.limit) || 8, 20);
      const products = await recommendationService.getForUser(req.user.id, {
        limit,
        authHeader: req.headers.authorization,
      });
      res.json({ success: true, data: products });
    } catch (err) {
      next(err);
    }
  }

  async getSimilar(req, res, next) {
    try {
      const { product_id } = req.params;
      const limit = Math.min(parseInt(req.query.limit) || 6, 12);
      const products = await recommendationService.getSimilar(product_id, {
        limit,
        authHeader: req.headers.authorization,
      });
      res.json({ success: true, data: products });
    } catch (err) {
      next(err);
    }
  }

  async recordView(req, res, next) {
    try {
      const { product_id, category } = req.body;
      if (!product_id) {
        return res.status(422).json({ success: false, error: 'product_id is required' });
      }
      await recommendationService.recordView(req.user.id, product_id, category);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }

  async search(req, res, next) {
    try {
      const result = await searchService.search({
        ...req.query,
        user_id: req.user?.id,
        authHeader: req.headers.authorization,
      });
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async suggest(req, res, next) {
    try {
      const suggestions = await searchService.suggest(req.query.q, parseInt(req.query.limit) || 5);
      res.json({ success: true, data: suggestions });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new RecommendationController();
