const orderService = require('../services/orderService');

class OrderController {
  async create(req, res, next) {
    try {
      const order = await orderService.create({
        ...req.body,
        user_id: req.user?.id || null,
      });
      res.status(201).json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const order = await orderService.getById(req.params.id, req.user);
      res.json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  }

  async listMine(req, res, next) {
    try {
      const result = await orderService.listForUser(req.user.id, req.query);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async listAll(req, res, next) {
    try {
      const result = await orderService.listAll(req.query);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { status } = req.body;
      const order = await orderService.updateStatus(req.params.id, status, req.user);
      res.json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await orderService.delete(req.params.id);
      res.json({ success: true, message: 'Order deleted' });
    } catch (err) {
      next(err);
    }
  }

  async getRevenueSummary(req, res, next) {
    try {
      const summary = await orderService.getRevenueSummary(req.query);
      res.json({ success: true, data: summary });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new OrderController();
