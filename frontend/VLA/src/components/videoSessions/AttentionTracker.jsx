import React from 'react';
import Webcam from 'react-webcam';
import { AlertCircle, CheckCircle, Loader2, Bell, BellOff } from 'lucide-react';
import { useAttentionTracker } from './useAttentionTracker';

const AttentionTracker = ({ sessionId, userId, hostView, onEngagementUpdate }) => {
  const {
    attention,
    loading,
    webcamRef,
    alert,
    showRetry,
    notificationsEnabled,
    retryFaceDetection,
  } = useAttentionTracker({ sessionId, userId, hostView, onEngagementUpdate });

  // UI helpers
  const getExpressionLabel = (expression) => {
    switch (expression) {
      case 'engaged': return 'Engaged';
      case 'bored': return 'Bored';
      case 'distracted': return 'Distracted';
      case 'confused': return 'Confused';
      case 'sad': return 'Sad';
      case 'neutral': return 'Neutral';
      case 'no_face': return 'No Face Detected';
      case 'error': return 'Error';
      default: return expression;
    }
  };

  const getExpressionColor = (expression) => {
    switch (expression) {
      case 'engaged': return 'text-success-600';
      case 'bored': return 'text-warning-600';
      case 'distracted': return 'text-warning-600';
      case 'confused': return 'text-warning-600';
      case 'sad': return 'text-error-600';
      case 'neutral': return 'text-gray-600';
      case 'no_face': return 'text-error-600';
      case 'error': return 'text-error-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="absolute top-4 right-4 z-50 bg-white bg-opacity-90 rounded-lg shadow-lg p-4 border border-primary-200 min-w-[280px] max-w-xs">
      <div className="font-semibold text-primary-700 mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-success-500" /> 
          Attention Tracker
        </div>
        <div className="flex items-center gap-1">
          {notificationsEnabled ? (
            <Bell className="h-4 w-4 text-success-500" />
          ) : (
            <BellOff className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>
      <div className="mb-2">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          width={120}
          height={90}
          videoConstraints={{ facingMode: 'user' }}
          className="rounded border border-gray-200"
          style={{ objectFit: 'cover' }}
        />
      </div>
      {loading && (
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Loader2 className="animate-spin h-4 w-4" /> 
          Initializing face detection...
        </div>
      )}
      {!loading && (
        <>
          <div className="mb-1 text-sm">
            <span className="font-medium">Expression:</span> 
            <span className={`ml-1 ${getExpressionColor(attention.expression)}`}>
              {getExpressionLabel(attention.expression)}
            </span>
          </div>
          <div className="mb-1 text-sm">
            <span className="font-medium">Attention Score:</span> 
            <span className={`ml-1 ${attention.score > 0.7 ? 'text-success-600' : attention.score > 0.4 ? 'text-warning-600' : 'text-error-600'}`}>
              {attention.score.toFixed(2)}
            </span>
          </div>
          <div className="mb-1 text-sm">
            <span className="font-medium">Avg. Attention:</span> 
            <span className={`ml-1 ${attention.averageAttention > 0.7 ? 'text-success-600' : attention.averageAttention > 0.4 ? 'text-warning-600' : 'text-error-600'}`}>
              {attention.averageAttention.toFixed(2)}
            </span>
          </div>
          <div className="mb-1 text-xs text-gray-400">
            Confidence: {(attention.confidence * 100).toFixed(1)}%
          </div>
          {alert && (
            <div className="mt-2 p-2 rounded bg-warning-100 text-warning-800 text-xs flex items-center gap-2 animate-pulse">
              <AlertCircle className="h-4 w-4 text-warning-500" />
              <div>
                <div className="font-semibold">{alert.title}</div>
                <div>{alert.message}</div>
              </div>
            </div>
          )}
          {attention.error && (
            <div className="mt-2 p-2 rounded bg-error-100 text-error-800 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-error-500" />
              <div>
                <div className="font-semibold">{attention.error}</div>
                <button
                  onClick={retryFaceDetection}
                  className="mt-1 px-2 py-1 bg-primary-600 text-white rounded text-xs hover:bg-primary-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </>
      )}
      <div className="mt-2 text-xs text-gray-400">
        Session: {sessionId}<br />User: {userId}
        {hostView && (
          <>
            <br />
            View: Host Only
          </>
        )}
      </div>
    </div>
  );
};

export default AttentionTracker; 