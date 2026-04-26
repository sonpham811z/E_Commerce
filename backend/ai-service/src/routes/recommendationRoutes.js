const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const { authenticate, optionalAuth } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/v1/recommendations:
 *   get:
 *     summary: Get personalized product recommendations for the current user
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 8 }
 *     responses:
 *       200:
 *         description: List of recommended products
 */
router.get('/', authenticate, recommendationController.getForUser);

/**
 * @swagger
 * /api/v1/recommendations/similar/{product_id}:
 *   get:
 *     summary: Get products similar to a given product
 *     tags: [Recommendations]
 *     parameters:
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 6 }
 */
router.get('/similar/:product_id', optionalAuth, recommendationController.getSimilar);

/**
 * @swagger
 * /api/v1/recommendations/view:
 *   post:
 *     summary: Record a product view (improves future recommendations)
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 */
router.post('/view', authenticate, recommendationController.recordView);

/**
 * @swagger
 * /api/v1/recommendations/search:
 *   get:
 *     summary: AI-optimized product search
 *     tags: [Recommendations]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: min_price
 *         schema: { type: number }
 *       - in: query
 *         name: max_price
 *         schema: { type: number }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [price_asc, price_desc, rating, newest] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 */
router.get('/search', optionalAuth, recommendationController.search);

/**
 * @swagger
 * /api/v1/recommendations/suggest:
 *   get:
 *     summary: Get search autocomplete suggestions
 *     tags: [Recommendations]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema: { type: string }
 */
router.get('/suggest', recommendationController.suggest);

module.exports = router;
