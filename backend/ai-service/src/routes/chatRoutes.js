const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticate, optionalAuth } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/v1/chat/message:
 *   post:
 *     summary: Send a message to the AI chatbot
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message:
 *                 type: string
 *               session_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: AI reply
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     session_id: { type: string }
 *                     reply: { type: string }
 */
router.post('/message', optionalAuth, chatController.sendMessage);

/**
 * @swagger
 * /api/v1/chat/sessions:
 *   get:
 *     summary: Get all chat sessions for the current user
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 */
router.get('/sessions', authenticate, chatController.getUserSessions);

/**
 * @swagger
 * /api/v1/chat/sessions/{session_id}:
 *   get:
 *     summary: Get chat history for a session
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: session_id
 *         required: true
 *         schema: { type: string }
 */
router.get('/sessions/:session_id', optionalAuth, chatController.getHistory);

/**
 * @swagger
 * /api/v1/chat/sessions/{session_id}:
 *   delete:
 *     summary: Delete a chat session
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/sessions/:session_id', authenticate, chatController.deleteSession);

module.exports = router;
