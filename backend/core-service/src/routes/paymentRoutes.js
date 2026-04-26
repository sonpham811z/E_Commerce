const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/v1/payments/process:
 *   post:
 *     summary: Process payment for an order
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [order_id, payment_method]
 *             properties:
 *               order_id: { type: string, format: uuid }
 *               payment_method: { type: string, enum: [cod, bank_transfer, stripe] }
 *               payment_data: { type: object }
 */
router.post('/process', authenticate, paymentController.process);

/**
 * @swagger
 * /api/v1/payments/verify/{order_id}/{transaction_id}:
 *   get:
 *     summary: Verify payment status
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 */
router.get('/verify/:order_id/:transaction_id', authenticate, paymentController.verify);

/**
 * @swagger
 * /api/v1/payments/refund:
 *   post:
 *     summary: Issue a refund (admin only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 */
router.post('/refund', authenticate, requireAdmin, paymentController.refund);

/**
 * @swagger
 * /api/v1/payments/discount/validate:
 *   post:
 *     summary: Validate a discount code
 *     tags: [Payments]
 */
router.post('/discount/validate', paymentController.validateDiscount);

/**
 * @swagger
 * /api/v1/payments/discounts:
 *   get:
 *     summary: List all discount codes (admin)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 */
router.get('/discounts', authenticate, requireAdmin, paymentController.listDiscounts);

/**
 * @swagger
 * /api/v1/payments/discounts:
 *   post:
 *     summary: Create a discount code (admin)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 */
router.post('/discounts', authenticate, requireAdmin, paymentController.createDiscount);

module.exports = router;
