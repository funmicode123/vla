const sessionRepository = require('../repositories/session.repository');
const { 
  AppError,
  BadRequestError, 
  NotFoundError,
  InternalServerError 
} = require('../utils/customErrors');

const validateUUID = require('../utils/validateUUID')

class SessionService {
  async createSession(data) {
    try {
      return await sessionRepository.createSession(data);
    } catch (error) {
      if (error.code === 11000) { 
        throw new AppError('Session with similar details already exists', 400);
      }
      throw new AppError('Failed to create session', 500);
    }
  }

  async getSessionById(id) {
  if (!validateUUID(id)) {
    throw new AppError('Invalid session ID format', 400);
  }
  
  const session = await sessionRepository.findById(id);
  console.log('🔍 Found session:', session); 

  if (!session) {
    throw new AppError('Session not found', 404);
  }
  return session;
}


  async getAllSessions(filter = {}) {
    try {
      return await sessionRepository.findAll(filter);
    } catch (error) {
      throw new AppError('Failed to retrieve sessions', 500);
    }
  }

  async updateSession(id, updates) {
    try {
      const updatedSession = await sessionRepository.updateSession(id, updates);
      if (!updatedSession) {
        throw new AppError('Session not found', 404);
      }
      return updatedSession;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update session', 500);
    }
  }

  async deleteSession(id) {
    try {
      const deletedSession = await sessionRepository.deleteSession(id);
      if (!deletedSession) {
        throw new AppError('Session not found', 404);
      }
      return deletedSession;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to delete session', 500);
    }
  }

  async joinSession(sessionId, email) {
  if (!validateUUID(sessionId)) {
    throw new BadRequestError('Invalid session ID format');
  }

  if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
    throw new BadRequestError('Invalid email');
  }

  try {
    const session = await this.getSessionById(sessionId);
    const normalizedEmail = email.toLowerCase().trim();

    const alreadyJoined = session.attendeeList.includes(normalizedEmail);
    if (!alreadyJoined) {
      session.attendeeList.push(normalizedEmail);
      await session.save();
    }

    return session;
  } catch (error) {
    console.error('Join session error', error);
    if (error instanceof AppError) throw error;
    throw new InternalServerError('Failed to join session')
      .withMetadata({ sessionId, email });
  }
}



}

module.exports = new SessionService();