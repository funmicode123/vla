const express = require('express');
const router = express.Router();
const MessageController = require('../controllers/messageController');


/**
 * @swagger
 * /api/message:
 *   post:
 *     summary: Create a new message
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               conversationId:
 *                 type: string
 *               senderId:
 *                 type: string
 *               content:
 *                 type: string
 *               messageType:
 *                 type: string
 *                 default: text
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Message created
 *       400:
 *         description: Error occurred
 */
router.post('/message', MessageController.createMessage);

/**
 * @swagger
 * /api/message:
 *   delete:
 *     summary: Delete a message
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               conversationId:
 *                 type: string
 *               messageId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message deleted
 *       400:
 *         description: Error occurred
 */
router.delete('/message', MessageController.deleteMessage);

module.exports = router;