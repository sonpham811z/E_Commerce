const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, optionalAuth, requireAdmin } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/v1/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [customer_name, phone, address, items, shipping_method, payment_method]
 *             properties:
 *               customer_name: { type: string }
 *               phone: { type: string }
 *               address: { type: object }
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product_id: { type: string }
 *                     quantity: { type: integer }
 *               shipping_method: { type: string, enum: [standard, express, free] }
 *               payment_method: { type: string, enum: [cod, bank_transfer, stripe] }
 *               discount_code: { type: string }
 */
router.post('/', optionalAuth, orderController.create);

/**
 * @swagger
 * /api/v1/orders/mine:
 *   get:
 *     summary: Get current user's orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 */
router.get('/mine', authenticate, orderController.listMine);

/**
 * @swagger
 * /api/v1/orders/admin:
 *   get:
 *     summary: List all orders (admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 */
router.get('/admin', authenticate, requireAdmin, orderController.listAll);

/**
 * @swagger
 * /api/v1/orders/revenue:
 *   get:
 *     summary: Get revenue summary (admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 */
router.get('/revenue', authenticate, requireAdmin, orderController.getRevenueSummary);

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authenticate, orderController.getById);

/**
 * @swagger
 * /api/v1/orders/{id}/status:
 *   patch:
 *     summary: Update order status
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/status', authenticate, orderController.updateStatus);

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   delete:
 *     summary: Delete (soft-delete) an order (admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authenticate, requireAdmin, orderController.delete);

module.exports = router;
