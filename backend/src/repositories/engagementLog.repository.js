const EngagementLog = require('../models/EngagementLog');

class EngagementLogRepository {
  async create(logData) {
    const log = new EngagementLog(logData);
    return await log.save();
  }

  async findBySession(sessionId) {
    return await EngagementLog.find({ session_id: sessionId }).sort({ timestamp: -1 });
  }

  async findRecentBySession(sessionId, limit = 10) {
    return await EngagementLog.find({ session_id: sessionId })
      .sort({ timestamp: -1 })
      .limit(limit);
  }

  async findByExpression(sessionId, expression) {
    return await EngagementLog.find({ 
      session_id: sessionId, 
      expression_type: expression 
    });
  }

  async deleteBySession(sessionId) {
    return await EngagementLog.deleteMany({ session_id: sessionId });
  }
}

module.exports = new EngagementLogRepository();
