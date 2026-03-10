const express = require('express');
const loginRouter = express.Router();
const loginRequestDto = require('../dto/request/user/login.dto');
const validateRequest = require('../middlewares/validateRequest');
const {login, forgotPassword, resetPassword} = require('../controllers/login.controller');
const ForgotPasswordRequest = require('../dto/request/user/forgotPassword.dto');
const ResetPasswordRequest = require('../dto/request/user/resetPassword.dto');

loginRouter.post('/login', validateRequest(loginRequestDto), login);
loginRouter.post('/forgot-password', validateRequest(ForgotPasswordRequest), forgotPassword);
loginRouter.post('/reset-password', validateRequest(ResetPasswordRequest), resetPassword);

module.exports = loginRouter;


/**
 * @swagger
 * /api/v1/login:
 *   post:
 *     summary: Log in existing user account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@gmail.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: User login and token returned
 *       400:
 *         description: Invalid credential
 */

/**
 * @swagger
 * /api/v1/forgot-password:
 *   post:
 *     summary: Request a password reset link
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@gmail.com
 *     responses:
 *       200:
 *         description: If your email exists, a reset link has been sent.
 */

/**
 * @swagger
 * /api/v1/reset-password:
 *   post:
 *     summary: Reset password using token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: abc123token
 *               newPassword:
 *                 type: string
 *                 example: newPassword123
 *     responses:
 *       200:
 *         description: Password has been reset successfully.
 *       400:
 *         description: Invalid or expired token.
 */

