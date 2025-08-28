const { verifyToken } = require('../config/jwt');
const User = require('../models/user');
const { AppError } = require('../utils/customErrors');

const userCache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour 

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError('No token provided', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    const userId = decoded.id; 

    const cachedUser = userCache.get(userId);
    const now = Date.now();

    let user;
    if (cachedUser && cachedUser.expiresAt > now) {
      user = cachedUser.data;
    } else {
      const foundUser = await User.findOne({ id: userId });
      if (!foundUser) return next(new AppError('User not found', 404));

      user = {
        id: foundUser.id, 
        email: foundUser.email,
        bio: foundUser.bio,
        profilePic: foundUser.profilePic
      };

      userCache.set(userId, {
        data: user,
        expiresAt: now + CACHE_TTL_MS
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('JWT error:', err.message);
    
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Token expired', 401));
    } else if (err.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token', 401));
    }
    
    next(new AppError('Invalid or expired token', 401));
  }
};

module.exports = auth;
