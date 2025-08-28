const { StreamChat } = require('stream-chat');
require('dotenv').config();

const api_key = process.env.STREAM_API;
const api_secret = process.env.STREAM_SECRET_KEY;
//const stream_url = process.env.STREAM_BASE_URL;

if (!api_key || !api_secret ) {
  throw new Error("Stream API key or secret key or base url is missing");
}

const chatClient = StreamChat.getInstance(api_key, api_secret, {
  // baseURL: stream_url,
  timeout: 10000,
});

const sanitizeUserId = (userId) => {
  if (userId == null) {
    throw new Error("User ID is null or undefined");
  }
  return userId.toString().toLowerCase().replace(/[^a-z0-9@_-]/g, '_');
};

const sanitizeEmail = (email) => {
  if (email == null) {
    throw new Error("Email is null or undefined");
  }
  return email.toString().toLowerCase().replace(/[^a-z0-9@_-]/g, '_');
};

const upsertStreamUser = async (user) => {
  if (!user.id || !user.email) {
    throw new Error("User ID or email is missing");
  }
  try {
    const safeUser = {
      ...user,
      id: sanitizeUserId(user.id),
      email: sanitizeEmail(user.email)
    };
    await chatClient.upsertUsers([safeUser]);
    return safeUser;
  } catch (error) {
    throw new Error(`Error upserting stream user: ${error.message}`);
  }
};


const generateStreamToken = (userId) => {
  const sanitizedUserId = sanitizeUserId(userId);
  return chatClient.createToken(sanitizedUserId);
};


module.exports = {
  serverClient: chatClient,
  upsertStreamUser,
  generateStreamToken,
  sanitizeUserId,
  sanitizeEmail,
};
