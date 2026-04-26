const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/v1/categories:
 *   get:
 *     summary: List all active categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Category list
 */
router.get('/', categoryController.list);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Categories]
 */
router.get('/:id', categoryController.getById);

/**
 * @swagger
 * /api/v1/categories:
 *   post:
 *     summary: Create category (admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authenticate, requireAdmin, categoryController.create);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   patch:
 *     summary: Update category (admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id', authenticate, requireAdmin, categoryController.update);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   delete:
 *     summary: Deactivate category (admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authenticate, requireAdmin, categoryController.delete);

module.exports = router;
