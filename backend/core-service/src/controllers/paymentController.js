const paymentService = require('../services/paymentService');
const DiscountCodeModel = require('../models/DiscountCode');

class PaymentController {
  async process(req, res, next) {
    try {
      const { order_id, payment_method, amount, payment_data } = req.body;
      if (!order_id || !payment_method) {
        return res.status(422).json({ success: false, error: 'order_id and payment_method are required' });
      }
      const result = await paymentService.processPayment({ order_id, payment_method, amount, payment_data });
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async verify(req, res, next) {
    try {
      const { order_id, transaction_id } = req.params;
      const result = await paymentService.verifyPayment(order_id, transaction_id);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async refund(req, res, next) {
    try {
      const { order_id, reason } = req.body;
      const result = await paymentService.refund(order_id, reason);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async validateDiscount(req, res, next) {
    try {
      const { code, order_total } = req.body;
      if (!code) {
        return res.status(422).json({ success: false, error: 'Discount code is required' });
      }
      const result = await DiscountCodeModel.validate(code, parseFloat(order_total) || 0);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async listDiscounts(req, res, next) {
    try {
      const result = await DiscountCodeModel.findAll(req.query);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async createDiscount(req, res, next) {
    try {
      const discount = await DiscountCodeModel.create(req.body);
      res.status(201).json({ success: true, data: discount });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PaymentController();
