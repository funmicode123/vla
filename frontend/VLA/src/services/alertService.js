import pushNotificationService from './pushNotificationService';

class AlertService {
  constructor() {
    this.alertHistory = [];
    this.alertCooldowns = new Map();
    this.isInitialized = false;
    this.sessionId = null;
  }

  async initialize(sessionId) {
    this.sessionId = sessionId;
    await pushNotificationService.initialize();
    this.isInitialized = true;
  }

  async sendAlert(alertData, type = 'engagement') {
    if (!this.isInitialized) {
      console.warn('Alert service not initialized');
      return false;
    }

    const alertId = `${type}-${alertData.title}-${Date.now()}`;
    const cooldownKey = `${type}-${alertData.title}`;
    
    // Check cooldown
    const lastAlertTime = this.alertCooldowns.get(cooldownKey);
    const cooldownDuration = this.getCooldownDuration(type);
    
    if (lastAlertTime && (Date.now() - lastAlertTime) < cooldownDuration) {
      console.log(`Alert ${alertData.title} is in cooldown`);
      return false;
    }

    // Store alert in history
    const alert = {
      id: alertId,
      type,
      title: alertData.title,
      message: alertData.message,
      timestamp: Date.now(),
      sessionId: this.sessionId
    };

    this.alertHistory.push(alert);
    this.alertCooldowns.set(cooldownKey, Date.now());

    // Keep only last 100 alerts
    if (this.alertHistory.length > 100) {
      this.alertHistory = this.alertHistory.slice(-100);
    }

    // Send push notification
    if (type === 'engagement') {
      await pushNotificationService.sendEngagementAlert(alertData, this.sessionId);
    } else {
      await pushNotificationService.sendSessionAlert(type, this.sessionId, alertData.participantName);
    }

    // Dispatch custom event for UI updates
    this.dispatchAlertEvent(alert);

    return true;
  }

  getCooldownDuration(type) {
    const cooldowns = {
      engagement: 30000, // 30 seconds for engagement alerts
      session: 10000,    // 10 seconds for session events
      system: 5000       // 5 seconds for system alerts
    };
    return cooldowns[type] || 30000;
  }

  dispatchAlertEvent(alert) {
    const event = new CustomEvent('attentionAlert', {
      detail: alert
    });
    window.dispatchEvent(event);
  }

  // Engagement-specific alerts
  async sendEngagementAlert(expressionType, duration, participantName = null) {
    const alerts = {
      bored: {
        title: 'Stay Focused',
        message: participantName 
          ? `${participantName} has been showing signs of boredom for ${duration}s.`
          : `You've been showing signs of boredom for ${duration}s. Try to engage more actively!`
      },
      distracted: {
        title: 'Attention Alert',
        message: participantName
          ? `${participantName} seems distracted for ${duration}s.`
          : `You seem distracted for ${duration}s. Please refocus on the session.`
      },
      confused: {
        title: 'Need Help?',
        message: participantName
          ? `${participantName} appears confused.`
          : 'You appear confused. Don\'t hesitate to ask questions!'
      },
      sad: {
        title: 'Are You Okay?',
        message: participantName
          ? `${participantName} seems down.`
          : 'You seem down. Take a moment if needed.'
      }
    };

    const alertData = alerts[expressionType];
    if (alertData) {
      return this.sendAlert(alertData, 'engagement');
    }
  }

  // Session event alerts
  async sendSessionEvent(eventType, participantName = null) {
    const events = {
      userJoined: {
        title: 'User Joined',
        message: `${participantName || 'A participant'} has joined the session.`
      },
      userLeft: {
        title: 'User Left',
        message: `${participantName || 'A participant'} left the session.`
      },
      networkIssue: {
        title: 'Network Issue',
        message: 'Your connection is unstable. Please check your internet connection.'
      },
      recordingStarted: {
        title: 'Recording Started',
        message: 'Session recording has started.'
      },
      cameraError: {
        title: 'Camera Error',
        message: 'Could not access your camera. Please check permissions.'
      },
      sessionEnded: {
        title: 'Session Ended',
        message: 'The host ended the session.'
      },
      handRaised: {
        title: 'Hand Raised',
        message: `${participantName || 'A participant'} raised their hand.`
      }
    };

    const eventData = events[eventType];
    if (eventData) {
      return this.sendAlert(eventData, 'session');
    }
  }

  // System alerts
  async sendSystemAlert(title, message) {
    return this.sendAlert({ title, message }, 'system');
  }

  // Get alert history
  getAlertHistory(limit = 50) {
    return this.alertHistory.slice(-limit);
  }

  // Get alerts by type
  getAlertsByType(type, limit = 50) {
    return this.alertHistory
      .filter(alert => alert.type === type)
      .slice(-limit);
  }

  // Clear alert history
  clearAlertHistory() {
    this.alertHistory = [];
    this.alertCooldowns.clear();
  }

  // Get alert statistics
  getAlertStats() {
    const stats = {
      total: this.alertHistory.length,
      byType: {},
      recent: this.alertHistory.filter(alert => 
        Date.now() - alert.timestamp < 300000 // Last 5 minutes
      ).length
    };

    this.alertHistory.forEach(alert => {
      stats.byType[alert.type] = (stats.byType[alert.type] || 0) + 1;
    });

    return stats;
  }

  // Cleanup method
  destroy() {
    this.clearAlertHistory();
    this.isInitialized = false;
    this.sessionId = null;
  }
}

// Export singleton instance
const alertService = new AlertService();
export default alertService; 