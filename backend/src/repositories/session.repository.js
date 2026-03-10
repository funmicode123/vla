const User = require('../models/user'); 
const Session = require('../models/session');

class SessionRepository {
  async createSession(data) {
    return await Session.create(data);
  }

  async joinSession(sessionId, email) {
    const updated = await Session.findOneAndUpdate(
      { id: sessionId },
      { $addToSet: { attendeeList: email } },
      { new: true }
    );

    if (!updated) return null;

    const attendees = await User.find({ email: { $in: updated.attendeeList } });

    return {
      ...updated.toObject(),
      attendeeDetails: attendees
    };
  }

  async findById(id) {
    const session = await Session.findOne({ id });
    if (!session) return null;

    const attendees = await User.find({ email: { $in: session.attendeeList } });

    session.attendeeDetails = attendees;

    return session; 
 
  }

  async findAll() {
    return await Session.find(); 
  }

  async updateSession(id, updates) {
    return await Session.findOneAndUpdate({ id }, updates, { new: true });
  }

  async deleteSession(id) {
    return await Session.findOneAndDelete({ id });
  }

  async addAttendee(sessionId, email) {
    return await this.joinSession(sessionId, email); 
  }
}

module.exports = new SessionRepository();