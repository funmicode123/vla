const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversationController');

/**
 * @swagger
 * /api/v1/conversations:
 *   post:
 *     summary: Create a new conversation
 *     tags: [Conversations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *               - host
 *               - participants
 *             properties:
 *               sessionId:
 *                 type: string
 *               host:
 *                 type: string
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Conversation created successfully
 *       500:
 *         description: Failed to create conversation
 */
router.post('/conversations', conversationController.createConversation);

module.exports = router;