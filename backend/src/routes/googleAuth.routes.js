const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/user');
const generateToken = require('../utils/generateToken'); 
const router = express.Router();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/auth/google', async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        name,
        googleId,
        avatar: picture,
      });
    }

    const jwtToken = generateToken(user._id);

    res.status(200).json({
      user,
      streamToken: jwtToken, 
    });
  } catch (err) {
    console.error('Google Auth Error:', err);
    res.status(401).json({ error: 'Google login failed' });
  }
});

module.exports = router;
