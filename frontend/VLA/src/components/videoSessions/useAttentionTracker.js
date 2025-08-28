import { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as facemesh from '@tensorflow-models/facemesh';
import faceDetectionService from '../../services/faceDetectionService';
import alertService from '../../services/alertService';

export function useAttentionTracker({ sessionId, userId, hostView, onEngagementUpdate }) {
  const webcamRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [attention, setAttention] = useState({
    score: 0,
    expression: 'neutral',
    averageAttention: 0,
    confidence: 0,
    timestamp: null,
    error: null
  });
  const [alert, setAlert] = useState(null);
  const [showRetry, setShowRetry] = useState(false);
  const [detectionActive, setDetectionActive] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [model, setModel] = useState(null);
  const [blinkFrames, setBlinkFrames] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function loadModel() {
      try {
        const loadedModel = await facemesh.load();
        if (isMounted) setModel(loadedModel);
      } catch (err) {
        setAttention((prev) => ({ ...prev, error: 'Failed to load ML model.' }));
      }
    }
    loadModel();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    let animationId;

    const initializeServices = async () => {
      setLoading(true);
      setShowRetry(false);
      setAlert(null);
      setDetectionActive(true);

      try {
        await alertService.initialize(sessionId);
        setNotificationsEnabled(true);
        await faceDetectionService.initialize();
        setLoading(false);
        faceDetectionService.startDetection(
          webcamRef.current?.video,
          (data) => {
            if (!isMounted) return;
            setAttention(data);
            if (onEngagementUpdate) onEngagementUpdate(data);
            if (data.error) {
              setShowRetry(true);
            } else {
              setShowRetry(false);
            }
          },
          async (alertData) => {
            if (!isMounted) return;
            await alertService.sendEngagementAlert(
              alertData.expression,
              alertData.duration,
              hostView ? 'Participant' : null
            );
            setAlert(alertData);
            setTimeout(() => {
              if (isMounted) setAlert(null);
            }, 5000);
          }
        );

        
        if (model && webcamRef.current && webcamRef.current.video) {
          let blinkCounter = 0;
          const BLINK_THRESHOLD = 2.5; 
          const BLINK_FRAMES = 3; 

          const runFacemesh = async () => {
            if (!isMounted) return;
            const video = webcamRef.current.video;
            if (video.readyState === 4) {
              const predictions = await model.estimateFaces(video);
              if (predictions.length > 0 && predictions[0].annotations) {
                const { leftEyeIris, rightEyeIris, leftEyeUpper0, leftEyeLower0, rightEyeUpper0, rightEyeLower0 } = predictions[0].annotations;
                if (leftEyeIris && rightEyeIris && leftEyeUpper0 && leftEyeLower0 && rightEyeUpper0 && rightEyeLower0) {
                  const avgX = (leftEyeIris[0][0] + rightEyeIris[0][0]) / 2;
                  const avgY = (leftEyeIris[0][1] + rightEyeIris[0][1]) / 2;
                  const centerX = video.videoWidth / 2;
                  const centerY = video.videoHeight / 2;
                  const deviationX = Math.abs(avgX - centerX) / centerX;
                  const deviationY = Math.abs(avgY - centerY) / centerY;
                  
                  const leftEyeOpen = Math.abs(leftEyeUpper0[3][1] - leftEyeLower0[4][1]);
                  const rightEyeOpen = Math.abs(rightEyeUpper0[3][1] - rightEyeLower0[4][1]);
                  const avgEyeOpen = (leftEyeOpen + rightEyeOpen) / 2;
                  
                  if (avgEyeOpen < BLINK_THRESHOLD) {
                    blinkCounter++;
                  } else {
                    blinkCounter = 0;
                  }
                  let newExpression = 'engaged';
                  let clampedScore = 1 - (deviationX + deviationY) / 2;
                  clampedScore = Math.max(0, Math.min(1, clampedScore));
                  if (blinkCounter >= BLINK_FRAMES) {
                    newExpression = 'blink';
                    clampedScore = 0.2; 
                  } else if (clampedScore > 0.75) {
                    newExpression = 'engaged';
                  } else if (clampedScore > 0.4) {
                    newExpression = 'distracted';
                  } else {
                    newExpression = 'bored';
                  }
                  const newAttention = {
                    score: clampedScore,
                    averageAttention: (attention.averageAttention + clampedScore) / 2,
                    expression: newExpression,
                    confidence: 1,
                    timestamp: Date.now(),
                    error: null,
                  };
                  setAttention(newAttention);
                  if (onEngagementUpdate) onEngagementUpdate(newAttention);
                }
              }
            }
            animationId = requestAnimationFrame(runFacemesh);
          };
          runFacemesh();
        }
        

        const handleAttentionAlert = (event) => {
          if (isMounted) {
            setAlert(event.detail);
            setTimeout(() => {
              if (isMounted) setAlert(null);
            }, 5000);
          }
        };
        window.addEventListener('attentionAlert', handleAttentionAlert);
        return () => {
          window.removeEventListener('attentionAlert', handleAttentionAlert);
        };
      } catch (error) {
        setLoading(false);
        setAttention((prev) => ({ ...prev, error: 'Face detection initialization failed. Please refresh or try again.' }));
        setShowRetry(true);
      }
    };
    if (detectionActive && webcamRef.current && webcamRef.current.video) {
      initializeServices();
    }
    return () => {
      isMounted = false;
      faceDetectionService.stopDetection();
      alertService.destroy();
      if (animationId) cancelAnimationFrame(animationId);
    };

  }, [detectionActive, model]);

  const retryFaceDetection = () => {
    setDetectionActive(false);
    setTimeout(() => setDetectionActive(true), 100);
  };

  return {
    attention,
    loading,
    webcamRef,
    alert,
    showRetry,
    notificationsEnabled,
    retryFaceDetection,
  };
}
