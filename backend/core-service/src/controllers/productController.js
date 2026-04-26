const productService = require('../services/productService');

class ProductController {
  async list(req, res, next) {
    try {
      const result = await productService.list(req.query);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const product = await productService.getById(req.params.id);
      res.json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const product = await productService.create(req.body);
      res.status(201).json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const product = await productService.update(req.params.id, req.body);
      res.json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await productService.delete(req.params.id);
      res.json({ success: true, message: 'Product deleted' });
    } catch (err) {
      next(err);
    }
  }

  async suggestions(req, res, next) {
    try {
      const { q, limit } = req.query;
      if (!q) return res.json({ success: true, data: [] });
      const results = await productService.suggestions(q, parseInt(limit) || 5);
      res.json({ success: true, data: results });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ProductController();
