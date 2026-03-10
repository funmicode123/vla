const {v4: uuidv4}=require('uuid');
const SessionInvite = require('../models/sessionInvite'); 

async function generateInviteToken(sessionId, email = null) {
  const token =uuidv4();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60); 

  await SessionInvite.create({ token, sessionId, email, expiresAt });

  return token;
}

module.exports = { generateInviteToken };
