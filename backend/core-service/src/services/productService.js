const ProductModel = require('../models/Product');
const redis = require('../config/redis');

const serializeFilters = (filters) => {
  if (!filters) return '';
  return Object.keys(filters)
    .sort()
    .map(key => `${key}=${filters[key]}`)
    .join('&');
};

const CACHE_TTL = 259200; // 3 days in seconds

class ProductService {
  async list(filters) {
    const serialized = serializeFilters(filters);
    const cacheKey = `products:list:${serialized}`;
    
    const cached = await redis.get(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await ProductModel.list(filters);
    await redis.setEx(cacheKey, CACHE_TTL, result);
    return result;
  }

  async getById(id) {
    const cacheKey = `product:id:${id}`;
    
    const cached = await redis.get(cacheKey);
    if (cached) {
      return cached;
    }

    const product = await ProductModel.findById(id);
    if (!product) {
      const err = new Error('Product not found');
      err.statusCode = 404;
      throw err;
    }

    await redis.setEx(cacheKey, CACHE_TTL, product);
    return product;
  }

  async create(data) {
    const product = await ProductModel.create(data);
    // Invalidate lists and suggestions cache
    await redis.delPattern('products:list:*');
    await redis.delPattern('products:suggestions:*');
    return product;
  }

  async update(id, data) {
    const product = await ProductModel.updateById(id, data);
    if (!product) {
      const err = new Error('Product not found');
      err.statusCode = 404;
      throw err;
    }
    // Invalidate specific product cache and all lists/suggestions
    await redis.del(`product:id:${id}`);
    await redis.delPattern('products:list:*');
    await redis.delPattern('products:suggestions:*');
    return product;
  }

  async delete(id) {
    const deleted = await ProductModel.deleteById(id);
    if (!deleted) {
      const err = new Error('Product not found');
      err.statusCode = 404;
      throw err;
    }
    // Invalidate specific product cache and all lists/suggestions
    await redis.del(`product:id:${id}`);
    await redis.delPattern('products:list:*');
    await redis.delPattern('products:suggestions:*');
  }

  async suggestions(term, limit) {
    const cacheKey = `products:suggestions:${term.toLowerCase().trim()}:${limit}`;
    
    const cached = await redis.get(cacheKey);
    if (cached) {
      return cached;
    }

    const results = await ProductModel.suggestions(term, limit);
    await redis.setEx(cacheKey, CACHE_TTL, results);
    return results;
  }
}

module.exports = new ProductService();


