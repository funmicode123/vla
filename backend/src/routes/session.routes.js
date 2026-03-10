const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const authenticate = require('../middlewares/authMiddleware'); 
const validateRequest = require('../middlewares/validateRequest');
const joinValidateRequest = require('../middlewares/joinValidateRequest');
const createSessionDto  = require('../dto/request/session/createSession.dto');
const joinSessionDto = require('../dto/request/session/joinSession.dto')
const updateSessionDto = require('../dto/request/session/updateSession.dto')

router.post('/', authenticate, validateRequest(createSessionDto), sessionController.createSession);

router.patch('/join/:token', authenticate, joinValidateRequest(joinSessionDto), sessionController.joinViaInvite);

router.get('/', authenticate, sessionController.getAllSessions);
router.get('/:id/summary', authenticate, sessionController.getSessionSummary);
router.get('/:id/permission-check', authenticate, sessionController.checkSessionPermission);
// router.get('/:id', authenticate, sessionController.getSessionById);

router.put('/:id', authenticate, validateRequest(updateSessionDto), sessionController.updateSession);
router.delete('/:id', authenticate, sessionController.deleteSession);


router.get('/:token', authenticate, sessionController.getSessionById);
module.exports = router;



/**
 * @swagger
 * /sessions:
 *   post:
 *     summary: Create a new session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - topic
 *               - startTime
 *               - endTime
 *             properties:
 *               topic:
 *                 type: string
 *                 example: "How might we track participant attention?"
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-06-20T10:00:00Z"
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-06-20T12:00:00Z"
 *               attendeeList:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: email
 *                   example: "user@gmail.com"
 *     responses:
 *       201:
 *         description: Session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                   example: "e1aabf3e-5f4d-4fcb-b14a-cab6dc69a317"
 *                 topic:
 *                   type: string
 *                   example: "How might we track participant attention?"
 *                 startTime:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-06-03T10:00:00Z"
 *                 endTime:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-06-03T12:00:00Z"
 *                 host:
 *                   type: string
 *                   format: uuid
 *                   example: "8e1acb13-1ad8-4539-9309-58a1c5552193"
 *                 attendeeList:
 *                   type: array
 *                   items:
 *                     type: string
 *                     format: email
 *                     example: "user@gmail.com"
 *                 link:
 *                   type: string
 *                   format: uri
 *                   example: "http://localhost:5000/join/56582545-e37d-442f-927a-c83587064cd5"
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /sessions/{id}/permission-check:
 *   get:
 *     summary: Check session permissions for the authenticated user
 *     description: Verifies if the currently authenticated user has permission to access the specified session.
 *     tags:
 *       - Sessions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: UUID of the session to check
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Permission check successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User has permission to access this session
 *                 data:
 *                   type: object
 *                   properties:
 *                     hasPermission:
 *                       type: boolean
 *                       example: true
 *       401:
 *         description: Unauthorized - JWT token missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Forbidden - User does not have permission to access this session
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: User does not have permission to access this session
 *       404:
 *         description: Session not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Session not found
 */



/**
 * @swagger
 * /sessions:
 *   get:
 *     summary: Retrieve a list of all sessions
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of sessions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   topic:
 *                     type: string
 *                   startTime:
 *                     type: string
 *                     format: date-time
 *                   endTime:
 *                     type: string
 *                     format: date-time
 *                   attendeeList:
 *                     type: array
 *                     items:
 *                       type: string
 *       401:
 *         description: Unauthorized - missing or invalid token
 */


/**
 * @swagger
 * /sessions/{token}:
 *   get:
 *     summary: Get a session by token
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The token of the session to retrieve
 *     responses:
 *       200:
 *         description: Session retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 topic:
 *                   type: string
 *                 startTime:
 *                   type: string
 *                   format: date-time
 *                 endTime:
 *                   type: string
 *                   format: date-time
 *                 attendeeList:
 *                   type: array
 *                   items:
 *                     type: string
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       404:
 *         description: Session not found
 */


/**
 * @swagger
 * /sessions/{id}:
 *   put:
 *     summary: Update a session by an ID
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The session ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               topic:
 *                 type: string
 *                 example: "Updated session topic"
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-06-20T01:40:57.742Z"
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-06-20T01:44:57.742Z"
 *     responses:
 *       200:
 *         description: Session updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       404:
 *         description: Session not found
 */


/**
 * @swagger
 * /sessions/join/{token}:
 *   patch:
 *     summary: Join a session as an attendee
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The session invite token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Successfully joined the session
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User successfully joined the session."
 *                 session:
 *                   $ref: '#/components/schemas/Session'
 *       400:
 *         description: Invalid input or already joined
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       404:
 *         description: Session not found
 */




/**
 * @swagger
 * /sessions/{id}:
 *   delete:
 *     summary: Delete a session by ID
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the session to delete
 *     responses:
 *       204:
 *         description: Session successfully deleted (No Content)
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       404:
 *         description: Session not found
 */



/**
 * @swagger
 * components:
 *   schemas:
 *     Session:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: '8980b2ed-c6ad-4959-953e-cf5f238a3a5c'
 *         topic:
 *           type: string
 *           example: 'How might we track participant attention?'
 *         host:
 *           type: string
 *           format: uuid
 *           example: '81f43db8-c06e-41e0-97ff-41a4c333d000'
 *         attendeeList:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *           example:
 *             - 'a5d3210b-87de-41e9-a4c9-835ed342bd30'
 *             - '81f43db8-c06e-41e0-97ff-41a4c333d000'
 *         startTime:
 *           type: string
 *           format: date-time
 *           example: '2025-06-05T10:00:00.000Z'
 *         endTime:
 *           type: string
 *           format: date-time
 *           example: '2025-06-05T12:00:00.000Z'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: '2025-06-03T21:03:01.104Z'
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: '2025-06-03T21:42:08.090Z'
 */
