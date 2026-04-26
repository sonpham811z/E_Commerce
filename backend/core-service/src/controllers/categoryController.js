const CategoryModel = require('../models/Category');

class CategoryController {
  async list(req, res, next) {
    try {
      const categories = await CategoryModel.findAll();
      res.json({ success: true, data: categories });
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const category = await CategoryModel.findById(req.params.id);
      if (!category) {
        return res.status(404).json({ success: false, error: 'Category not found' });
      }
      res.json({ success: true, data: category });
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const category = await CategoryModel.create(req.body);
      res.status(201).json({ success: true, data: category });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const category = await CategoryModel.updateById(req.params.id, req.body);
      if (!category) {
        return res.status(404).json({ success: false, error: 'Category not found' });
      }
      res.json({ success: true, data: category });
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      const deleted = await CategoryModel.deleteById(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Category not found' });
      }
      res.json({ success: true, message: 'Category deactivated' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CategoryController();
