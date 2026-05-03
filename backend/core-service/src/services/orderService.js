const OrderModel = require('../models/Order');
const ProductModel = require('../models/Product');
const DiscountCodeModel = require('../models/DiscountCode');
const logger = require('../utils/logger');

const VALID_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

class OrderService {
  async create({ user_id, customer_name, phone, address, items, shipping_method, payment_method, discount_code }) {
    if (!items?.length) {
      const err = new Error('Order must have at least one item');
      err.statusCode = 400;
      throw err;
    }

    // Validate stock and prices
    const enrichedItems = await Promise.all(
      items.map(async ({ product_id, quantity }) => {
        const product = await ProductModel.findById(product_id);
        if (!product) {
          const err = new Error(`Product ${product_id} not found`);
          err.statusCode = 400;
          throw err;
        }
        if (product.stock < quantity) {
          const err = new Error(`Insufficient stock for ${product.title}`);
          err.statusCode = 400;
          throw err;
        }
        return {
          product_id,
          product_name: product.title,
          product_image: product.image,
          quantity,
          price: product.sale_price || product.price,
        };
      })
    );

    const subtotal = enrichedItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const shipping_fee = this._calculateShipping(shipping_method);

    let discount = 0;
    let resolvedCode = null;
    if (discount_code) {
      const result = await DiscountCodeModel.validate(discount_code, subtotal);
      if (!result.valid) {
        const err = new Error(result.error);
        err.statusCode = 400;
        throw err;
      }
      discount = result.amount;
      resolvedCode = discount_code;
    }

    const order = await OrderModel.create({
      user_id, customer_name, phone, address,
      items: enrichedItems,
      shipping_method, payment_method,
      shipping_fee, discount,
      discount_code: resolvedCode,
    });

    // Decrement stock after order created
    await Promise.all(
      enrichedItems.map(({ product_id, quantity }) =>
        ProductModel.updateStock(product_id, -quantity)
      )
    );

    if (resolvedCode) {
      DiscountCodeModel.incrementUsage(resolvedCode).catch(() => {});
    }

    logger.info(`Order created: ${order.id} for user ${user_id}`);
    return order;
  }

  async getById(id, user) {
    const order = await OrderModel.findById(id);
    if (!order) {
      const err = new Error('Order not found');
      err.statusCode = 404;
      throw err;
    }
    if (user.role !== 'admin' && order.user_id !== user.id) {
      const err = new Error('Access denied');
      err.statusCode = 403;
      throw err;
    }
    return order;
  }

  async listForUser(user_id, filters) {
    return OrderModel.findByUserId(user_id, filters);
  }

  async listAll(filters) {
    return OrderModel.listAll(filters);
  }

  async updateStatus(id, status, user) {
    if (!VALID_STATUSES.includes(status)) {
      const err = new Error(`Invalid status: ${status}`);
      err.statusCode = 400;
      throw err;
    }

    const order = await OrderModel.findById(id);
    if (!order) {
      const err = new Error('Order not found');
      err.statusCode = 404;
      throw err;
    }

    if (user.role !== 'admin') {
      if (status !== 'cancelled') {
        const err = new Error('Access denied. Only admin can update order status.');
        err.statusCode = 403;
        throw err;
      }
      if (order.user_id !== user.id) {
        const err = new Error('Access denied. You can only cancel your own orders.');
        err.statusCode = 403;
        throw err;
      }
      if (!['pending', 'processing'].includes(order.status)) {
        const err = new Error('Order cannot be cancelled at this stage');
        err.statusCode = 400;
        throw err;
      }
    }

    return OrderModel.updateStatus(id, status);
  }

  async delete(id) {
    const deleted = await OrderModel.softDelete(id);
    if (!deleted) {
      const err = new Error('Order not found');
      err.statusCode = 404;
      throw err;
    }
  }

  async getRevenueSummary(filters) {
    return OrderModel.getRevenueSummary(filters);
  }

  _calculateShipping(method) {
    const rates = { standard: 30000, express: 60000, free: 0 };
    return rates[method] || rates.standard;
  }
}

module.exports = new OrderService();
