const User = require('../models/user');
const { generateToken } = require('../config/jwt');
const { BadRequestError } = require('../utils/customErrors');
const {
  upsertStreamUser,
  generateStreamToken,
  sanitizeUserId
} = require('../config/stream');

const DEFAULT_AVATAR = process.env.DEFAULT_AVATAR_URL || 'uploads/profilePic.png';

const SignupService = async ({ email, password }, file) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new BadRequestError('Email already in use');

  const profilePic = file?.path || DEFAULT_AVATAR;
  const newUser = new User({ email, password, profilePic });
  await newUser.save();

  const sanitizedId = sanitizeUserId(newUser.id);

  try {
    await upsertStreamUser({
      id: sanitizedId,
      name: email,
      image: profilePic
    });
    console.log(`Stream user created: ${sanitizedId}`);
  } catch (error) {
    console.error(`Failed to create Stream user for ${email}:`, error.message);
    // Optional: throw new Error if Stream is required
  }

  const tokenPayload = {
    id: newUser.id,
    email: newUser.email
  };
  const token = generateToken(tokenPayload);
  const streamToken = generateStreamToken(sanitizedId);

  return {
    user: {
      id: newUser.id,
      email: newUser.email,
      profilePic: newUser.profilePic || null
    },
    token,
    streamToken 
  };
};

module.exports = SignupService;
