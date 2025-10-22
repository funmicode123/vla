const EngagementLogRepository = require('../repositories/engagementLog.repository');

exports.logEngagement = async (req, res) => {
  try {
    const log = await EngagementLogRepository.create(req.body);
    res.status(201).json({ success: true, data: log });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getEngagementLogs = async (req, res) => {
  try {
    const { sessionId, userId } = req.query;
    let logs;
    if (sessionId && userId) {
      logs = await EngagementLogRepository.findBySession(sessionId);
      logs = logs.filter(l => l.user_id.toString() === userId);
    } else if (sessionId) {
      logs = await EngagementLogRepository.findBySession(sessionId);
    } else if (userId) {
      logs = await EngagementLogRepository.find({ user_id: userId });
    } else {
      return res.status(400).json({ success: false, error: 'sessionId or userId required' });
    }
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
