const { generateToken } = require('../config/jwt');
const User = require('../models/user');
const { UnauthorizedError, NotFoundError } = require('../utils/customErrors');
const {generateStreamToken, sanitizeUserId } = require('../config/stream')
const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    throw new NotFoundError('User does not exist');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new UnauthorizedError('Incorrect password');
  }

  const tokenPayload = { 
    id: user.id, 
    email: user.email 
  };

  const token = generateToken(tokenPayload);

  const sanitizedId = sanitizeUserId(user.id);
  const streamToken = generateStreamToken(sanitizedId);

  return {
    user: {
      id: user.id,
      email: user.email,
      profilePic: user.profilePic || null,
    },
    token,
    streamToken
  };
};

module.exports = { loginUser };
