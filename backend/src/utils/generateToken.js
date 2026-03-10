require('dotenv').config();
const jwt = require('jsonwebtoken');

function generateToken(userId = '64dcebbd2a2a0123456789a1') {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

module.exports = generateToken;
