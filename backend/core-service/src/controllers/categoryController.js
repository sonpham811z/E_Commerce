const CategoryModel = require('../models/Category');
const redis = require('../config/redis');

const CACHE_TTL = 259200; // 3 days in seconds

class CategoryController {
  async list(req, res, next) {
    try {
      const cacheKey = 'categories:list';
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.json({ success: true, data: cached });
      }

      const categories = await CategoryModel.findAll();
      await redis.setEx(cacheKey, CACHE_TTL, categories);
      res.json({ success: true, data: categories });
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `category:id:${id}`;
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.json({ success: true, data: cached });
      }

      const category = await CategoryModel.findById(id);
      if (!category) {
        return res.status(404).json({ success: false, error: 'Category not found' });
      }

      await redis.setEx(cacheKey, CACHE_TTL, category);
      res.json({ success: true, data: category });
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const category = await CategoryModel.create(req.body);
      // Invalidate list cache
      await redis.del('categories:list');
      res.status(201).json({ success: true, data: category });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const category = await CategoryModel.updateById(id, req.body);
      if (!category) {
        return res.status(404).json({ success: false, error: 'Category not found' });
      }
      // Invalidate specific cache and list cache
      await redis.del(`category:id:${id}`);
      await redis.del('categories:list');
      res.json({ success: true, data: category });
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await CategoryModel.deleteById(id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Category not found' });
      }
      // Invalidate specific cache and list cache
      await redis.del(`category:id:${id}`);
      await redis.del('categories:list');
      res.json({ success: true, message: 'Category deactivated' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CategoryController();


