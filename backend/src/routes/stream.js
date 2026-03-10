const express = require('express');
const router = express.Router();
const {
  generateStreamToken,
  upsertStreamUser,
  sanitizeUserId
} = require('../utils/streamUtils'); 

router.post('/token', async (req, res) => {
  const { userId, email, image } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  try {
    const sanitizedId = sanitizeUserId(userId);

    // Optional: Upsert the user to make sure they exist
    await upsertStreamUser({
      id: sanitizedId,
      email: email || 'Guest',
      image: image || `https://getstream.io/random_svg/?id=${sanitizedId}&email=${email || 'Guest'}`
    });

    const token = generateStreamToken(sanitizedId);
    res.json({ token });
  } catch (error) {
    console.error('Token generation error:', error);
    res.status(500).json({ error: 'Failed to generate Stream token' });
  }
});

module.exports = router;
