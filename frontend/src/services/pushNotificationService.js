class PushNotificationService {
  constructor() {
    this.isSupported = 'Notification' in window;
    this.permission = this.isSupported ? Notification.permission : 'denied';
    this.isInitialized = false;
  }

  async initialize() {
    if (!this.isSupported) {
      console.warn('Push notifications not supported in this browser');
      return false;
    }

    if (this.permission === 'default') {
      this.permission = await Notification.requestPermission();
    }

    this.isInitialized = true;
    return this.permission === 'granted';
  }

  async requestPermission() {
    if (!this.isSupported) return false;
    
    try {
      this.permission = await Notification.requestPermission();
      this.isInitialized = true;
      return this.permission === 'granted';
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }

  async sendNotification(title, options = {}) {
    if (!this.isSupported || this.permission !== 'granted') {
      console.warn('Notifications not available or permission denied');
      return false;
    }

    try {
      const defaultOptions = {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        requireInteraction: false,
        silent: false,
        tag: 'engagement-alert',
        ...options
      };

      const notification = new Notification(title, defaultOptions);

      setTimeout(() => {
        notification.close();
      }, 5000);

      notification.onclick = () => {
        window.focus();
        notification.close();
        
        if (options.sessionId) {
          window.location.href = `/session/${options.sessionId}`;
        }
      };

      return true;
    } catch (error) {
      console.error('Failed to send notification:', error);
      return false;
    }
  }

  async sendEngagementAlert(alertData, sessionId) {
    const { title, message } = alertData;
    
    return this.sendNotification(title, {
      body: message,
      sessionId,
      icon: '/engagement-alert-icon.png', // You can add a custom icon
      badge: '/engagement-alert-badge.png',
      tag: `engagement-${sessionId}`,
      requireInteraction: true,
      actions: [
        {
          action: 'focus',
          title: 'Focus Session'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    });
  }

  async sendSessionAlert(alertType, sessionId, participantName = null) {
    const alerts = {
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

    const alert = alerts[alertType];
    if (alert) {
      return this.sendNotification(alert.title, {
        body: alert.message,
        sessionId,
        tag: `session-${alertType}-${sessionId}`
      });
    }
  }

  isPermissionGranted() {
    return this.permission === 'granted';
  }

  isSupported() {
    return this.isSupported;
  }

  // Cleanup method
  destroy() {
    // Close any open notifications
    if (this.isSupported) {
      // Note: There's no direct API to close all notifications
      // They will auto-close based on the timeout we set
    }
  }
}

// Export singleton instance
const pushNotificationService = new PushNotificationService();
export default pushNotificationService; 