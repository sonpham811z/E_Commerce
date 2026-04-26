const OrderModel = require('../models/Order');
const logger = require('../utils/logger');

class PaymentService {
  async processPayment({ order_id, payment_method, amount, payment_data }) {
    const order = await OrderModel.findById(order_id);
    if (!order) {
      const err = new Error('Order not found');
      err.statusCode = 404;
      throw err;
    }

    if (order.payment_status === 'paid') {
      const err = new Error('Order is already paid');
      err.statusCode = 400;
      throw err;
    }

    let result;
    switch (payment_method) {
      case 'cod':
        result = await this._processCOD(order);
        break;
      case 'bank_transfer':
        result = await this._processBankTransfer(order, payment_data);
        break;
      case 'stripe':
        result = await this._processStripe(order, payment_data);
        break;
      default: {
        const err = new Error(`Unsupported payment method: ${payment_method}`);
        err.statusCode = 400;
        throw err;
      }
    }

    logger.info(`Payment processed for order ${order_id}: ${result.status}`);
    return result;
  }

  async verifyPayment(order_id, transaction_id) {
    // In production this would verify with payment gateway
    const order = await OrderModel.findById(order_id);
    if (!order) {
      const err = new Error('Order not found');
      err.statusCode = 404;
      throw err;
    }
    return { verified: order.payment_status === 'paid', order };
  }

  async refund(order_id, reason) {
    const order = await OrderModel.findById(order_id);
    if (!order) {
      const err = new Error('Order not found');
      err.statusCode = 404;
      throw err;
    }
    if (order.payment_status !== 'paid') {
      const err = new Error('Only paid orders can be refunded');
      err.statusCode = 400;
      throw err;
    }

    await OrderModel.updatePaymentStatus(order_id, 'refunded');
    await OrderModel.updateStatus(order_id, 'cancelled');
    logger.info(`Refund issued for order ${order_id}: ${reason}`);
    return { refunded: true, order_id };
  }

  async _processCOD(order) {
    // COD: payment happens on delivery, mark as pending
    return { status: 'pending', method: 'cod', message: 'Cash on delivery — payment due at delivery' };
  }

  async _processBankTransfer(order, { bank_reference }) {
    if (!bank_reference) {
      const err = new Error('Bank reference is required for bank transfer');
      err.statusCode = 400;
      throw err;
    }
    await OrderModel.updatePaymentStatus(order.id, 'pending');
    return { status: 'pending', method: 'bank_transfer', reference: bank_reference };
  }

  async _processStripe(order, { payment_intent_id }) {
    // In production: verify payment_intent_id with Stripe API
    if (!payment_intent_id) {
      const err = new Error('Payment intent ID required');
      err.statusCode = 400;
      throw err;
    }
    // Mock successful verification
    await OrderModel.updatePaymentStatus(order.id, 'paid');
    await OrderModel.updateStatus(order.id, 'processing');
    return { status: 'paid', method: 'stripe', transaction_id: payment_intent_id };
  }
}

module.exports = new PaymentService();
