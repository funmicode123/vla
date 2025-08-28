const StreamChat = require('stream-chat').StreamChat;

const apiKey = process.env.STREAM_API;
const apiSecret = process.env.STREAM_SECRET_KEY;

const serverClient = StreamChat.getInstance(apiKey, apiSecret);

function generateStreamToken(userId) {
  return serverClient.createToken(userId);
}

module.exports = { generateStreamToken };
