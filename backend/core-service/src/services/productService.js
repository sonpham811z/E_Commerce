const ProductModel = require('../models/Product');

class ProductService {
  async list(filters) {
    return ProductModel.list(filters);
  }

  async getById(id) {
    const product = await ProductModel.findById(id);
    if (!product) {
      const err = new Error('Product not found');
      err.statusCode = 404;
      throw err;
    }
    return product;
  }

  async create(data) {
    return ProductModel.create(data);
  }

  async update(id, data) {
    const product = await ProductModel.updateById(id, data);
    if (!product) {
      const err = new Error('Product not found');
      err.statusCode = 404;
      throw err;
    }
    return product;
  }

  async delete(id) {
    const deleted = await ProductModel.deleteById(id);
    if (!deleted) {
      const err = new Error('Product not found');
      err.statusCode = 404;
      throw err;
    }
  }

  async suggestions(term, limit) {
    return ProductModel.suggestions(term, limit);
  }
}

module.exports = new ProductService();
