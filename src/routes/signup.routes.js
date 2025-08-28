const express = require('express');
const signupRouter = express.Router();
const { signupSchema } = require('../dto/request/user/signup.dto');
const validateRequest = require('../middlewares/validateRequest');
const {signup} = require('../controllers/signup.controller');
const multer = require('multer');
const path = require('path');
// const upload = multer({ dest: 'uploads/' });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); 
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

const upload = multer({ storage, 
    limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
 });

signupRouter.post('/signup', upload.single('profilePic'), validateRequest(signupSchema), signup);

module.exports = signupRouter;



/**
 * @swagger
 * /api/v1/signup:
 *   post:
 *     summary: Create a new user account
 *     description: |
 *       Creates a new user account and returns authentication tokens.
 *       **Important:** Copy the `token` from the response and use it in the "Authorize" button above for other API calls.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
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
 *               profilePic:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: User created and tokens returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT access token - Copy this for authorization
 *                 streamToken:
 *                   type: string
 *                   description: Token for Stream chat access
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     profilePic:
 *                       type: string
 *                       nullable: true
 *                 message:
 *                   type: string
 *                   example: User created successfully
 *       400:
 *         description: Invalid request
 */
