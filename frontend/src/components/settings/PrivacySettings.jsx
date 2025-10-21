import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Trash2, Eye, EyeOff, Bell, BellOff, Shield, AlertTriangle } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { toast } from 'react-toastify';

const PrivacySettings = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [faceDataConsent, setFaceDataConsent] = useState(false);
  const [attentionTracking, setAttentionTracking] = useState(true);

  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    // Load user preferences from localStorage
    const consent = localStorage.getItem('attentionConsent');
    const tracking = localStorage.getItem('attentionTracking');
    const notifications = localStorage.getItem('notificationPermission');

    setFaceDataConsent(consent === 'true');
    setAttentionTracking(tracking !== 'false');
    setNotificationPermission(notifications || 'default');
  }, []);

  const handleDeleteFaceData = async () => {
    setIsDeleting(true);
    try {
      // Call API to delete face embeddings
      const response = await fetch('/api/v1/user/face-data', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Face data deleted successfully');
        setFaceDataConsent(false);
        localStorage.removeItem('attentionConsent');
        setShowDeleteModal(false);
      } else {
        throw new Error('Failed to delete face data');
      }
    } catch (error) {
      console.error('Error deleting face data:', error);
      toast.error('Failed to delete face data. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleNotificationPermission = async () => {
    try {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        localStorage.setItem('notificationPermission', permission);
        
        if (permission === 'granted') {
          toast.success('Notifications enabled successfully');
        } else {
          toast.warn('Notifications are disabled. You can enable them in your browser settings.');
        }
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Failed to request notification permission');
    }
  };

  const handleAttentionTrackingToggle = () => {
    const newValue = !attentionTracking;
    setAttentionTracking(newValue);
    localStorage.setItem('attentionTracking', newValue.toString());
    
    if (!newValue) {
      toast.warn('Attention tracking disabled. Some features may not work properly.');
    } else {
      toast.success('Attention tracking enabled');
    }
  };

  const handleRevokeConsent = () => {
    setFaceDataConsent(false);
    localStorage.removeItem('attentionConsent');
    toast.success('Consent revoked. You will need to provide consent again for future sessions.');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-8 w-8 text-primary-600" />
        <h1 className="text-3xl font-bold text-gray-900">Privacy Settings</h1>
      </div>

      {/* Face Data Management */}
      <Card>
        <Card.Header>
          <Card.Title className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary-600" />
            Face Data Management
          </Card.Title>
          <Card.Subtitle>
            Control how your face data is used for attention tracking
          </Card.Subtitle>
        </Card.Header>
        <Card.Content className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Attention Tracking Consent</h3>
              <p className="text-sm text-gray-600">
                Allow face analysis for engagement monitoring during sessions
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                faceDataConsent 
                  ? 'bg-success-100 text-success-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {faceDataConsent ? 'Consented' : 'Not Consented'}
              </span>
              {faceDataConsent && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRevokeConsent}
                >
                  Revoke
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Attention Tracking</h3>
              <p className="text-sm text-gray-600">
                Enable real-time attention monitoring during sessions
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={attentionTracking}
                onChange={handleAttentionTrackingToggle}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Delete Face Data</h3>
                <p className="text-sm text-gray-600">
                  Permanently delete all stored face embeddings and analytics
                </p>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
                disabled={!faceDataConsent}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Data
              </Button>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Notification Settings */}
      <Card>
        <Card.Header>
          <Card.Title className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary-600" />
            Notification Settings
          </Card.Title>
          <Card.Subtitle>
            Manage push notifications for engagement alerts
          </Card.Subtitle>
        </Card.Header>
        <Card.Content className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Push Notifications</h3>
              <p className="text-sm text-gray-600">
                Receive alerts for engagement issues and session events
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                notificationPermission === 'granted'
                  ? 'bg-success-100 text-success-800'
                  : notificationPermission === 'denied'
                  ? 'bg-error-100 text-error-800'
                  : 'bg-warning-100 text-warning-800'
              }`}>
                {notificationPermission === 'granted' ? 'Enabled' :
                 notificationPermission === 'denied' ? 'Disabled' : 'Not Set'}
              </span>
              {notificationPermission !== 'granted' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleNotificationPermission}
                >
                  Enable
                </Button>
              )}
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Privacy Information */}
      <Card>
        <Card.Header>
          <Card.Title className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning-600" />
            Privacy Information
          </Card.Title>
        </Card.Header>
        <Card.Content className="space-y-3 text-sm text-gray-600">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">How we protect your data:</h4>
            <ul className="list-disc pl-5 space-y-1 text-blue-800">
              <li>Face images are processed in memory and never stored</li>
              <li>Face embeddings are encrypted before storage</li>
              <li>Data is automatically deleted after 90 days</li>
              <li>You can delete your data anytime</li>
              <li>We comply with GDPR and CCPA regulations</li>
            </ul>
          </div>
        </Card.Content>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Face Data"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-error-50 rounded-lg">
            <div className="flex items-center gap-2 text-error-800">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Warning</span>
            </div>
            <p className="text-sm text-error-700 mt-2">
              This action will permanently delete all your face data and engagement analytics. 
              This cannot be undone.
            </p>
          </div>
          
          <p className="text-gray-700">
            Are you sure you want to delete all your face data? This will:
          </p>
          
          <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
            <li>Remove all stored face embeddings</li>
            <li>Delete engagement analytics history</li>
            <li>Revoke attention tracking consent</li>
            <li>Require new consent for future sessions</li>
          </ul>

          <div className="flex gap-3 pt-4">
            <Button
              variant="danger"
              onClick={handleDeleteFaceData}
              loading={isDeleting}
              fullWidth
            >
              {isDeleting ? 'Deleting...' : 'Delete All Face Data'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              fullWidth
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PrivacySettings; 