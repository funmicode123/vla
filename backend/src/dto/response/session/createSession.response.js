const session = require("../../../models/session");

class CreateSessionResponse {
  constructor(session) {
    this.id = session.id;
    this.topic = session.topic;
    this.startTime = session.startTime;
    this.endTime = session.endTime;
    this.host = this.formatUser(session.host);
    this.attendeeList = session.attendeeList.map(user => this.formatUser(user));
    this.createdAt = session.createdAt;
    this.updatedAt = session.updatedAt;
  }

  formatUser(user) {
    if (user && typeof user === 'object') {
      return {
        id: user._id || user.id,
        email: user.email,
        // name: user.name || null

      };
    }
    return { id: user };
  }

  static from(session) {
    return new CreateSessionResponse(session);
  }

  static fromList(sessions) {
    return sessions.map(session => new CreateSessionResponse(session));
  }

  toJSON() {
    return {
    //   status: false,
      sessionId: this.id,
      topic: this.topic,
      startTime: this.startTime,
      endTime: this.endTime,
      host: this.host,
      attendees: this.attendeeList,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      duration: this.calculateDuration(),
      link: this.link
    };
  }

  calculateDuration() {
    const diffMs = new Date(this.endTime) - new Date(this.startTime);
    const minutes = Math.floor(diffMs / 60000);
    return `${minutes} min`;
  }
}

module.exports = CreateSessionResponse;