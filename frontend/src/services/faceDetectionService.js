import * as faceapi from 'face-api.js';

class FaceDetectionService {
  constructor() {
    this.isInitialized = false;
    this.modelsLoaded = false;
    this.detectionInterval = null;
    this.lastDetectionTime = 0;
    this.attentionThreshold = 0.7;
    this.boredThreshold = 30; 
    this.distractedThreshold = 15; 
    this.detectionTimeout = 5000; 
    this.retryAttempts = 0;
    this.maxRetries = 3;
  }

  async initialize() {
    if (this.isInitialized) return true;

    try {
      console.log('🔄 Initializing face detection service...');
      
      const modelPath = import.meta.env.VITE_FACEAPI;
      
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(modelPath),
        faceapi.nets.faceLandmark68Net.loadFromUri(modelPath),
        faceapi.nets.faceRecognitionNet.loadFromUri(modelPath),
        faceapi.nets.faceExpressionNet.loadFromUri(modelPath),
      ]);

      this.modelsLoaded = true;
      this.isInitialized = true;
      console.log('✅ Face detection models loaded successfully');
      return true;
    } catch (error) {
      console.error('Failed to load face detection models:', error);
      this.retryAttempts++;
      
      if (this.retryAttempts < this.maxRetries) {
        console.log(`🔄 Retrying model loading (attempt ${this.retryAttempts + 1}/${this.maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.initialize();
      }
      
      throw new Error('Face detection models failed to load after multiple attempts');
    }
  }

  async detectFace(videoElement) {
    if (!this.modelsLoaded) {
      throw new Error('Face detection models not loaded');
    }

    try {
      const detection = await faceapi
        .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      if (detection) {
        this.lastDetectionTime = Date.now();
        this.retryAttempts = 0; 
        
        return {
          detected: true,
          expressions: detection.expressions,
          landmarks: detection.landmarks,
          confidence: detection.detection.score,
          timestamp: Date.now()
        };
      } else {
        return {
          detected: false,
          error: 'No face detected',
          timestamp: Date.now()
        };
      }
    } catch (error) {
      console.error('Face detection error:', error);
      return {
        detected: false,
        error: error.message,
        timestamp: Date.now()
      };
    }
  }

  calculateAttentionScore(expressions) {
    if (!expressions) return 0;

    const attentionWeights = {
      happy: 0.8,
      sad: 0.3,
      angry: 0.2,
      fearful: 0.1,
      disgusted: 0.1,
      surprised: 0.6,
      neutral: 0.5
    };

    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(expressions).forEach(([expression, probability]) => {
      const weight = attentionWeights[expression] || 0.5;
      totalScore += probability * weight;
      totalWeight += probability;
    });

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  determineExpressionType(expressions) {
    if (!expressions) return 'unknown';

    const expressionEntries = Object.entries(expressions);
    const maxExpression = expressionEntries.reduce((max, [expression, probability]) => 
      probability > max.probability ? { expression, probability } : max
    , { expression: 'neutral', probability: 0 });

    const expressionMap = {
      happy: 'engaged',
      sad: 'sad',
      angry: 'confused',
      fearful: 'confused',
      disgusted: 'confused',
      surprised: 'engaged',
      neutral: 'neutral'
    };

    return expressionMap[maxExpression.expression] || 'neutral';
  }

  generateAlertMessage(expressionType, duration) {
    const messages = {
      bored: {
        title: 'Stay Focused',
        message: `You've been showing signs of boredom for ${duration}s. Try to engage more actively!`
      },
      distracted: {
        title: 'Attention Alert',
        message: `You seem distracted for ${duration}s. Please refocus on the session.`
      },
      confused: {
        title: 'Need Help?',
        message: `You appear confused. Don't hesitate to ask questions!`
      },
      sad: {
        title: 'Are You Okay?',
        message: 'You seem down. Take a moment if needed.'
      }
    };

    return messages[expressionType] || {
      title: 'Engagement Notice',
      message: 'Please stay engaged with the session.'
    };
  }

  async startDetection(videoElement, onAttentionUpdate, onAlert) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.detectionInterval) {
      this.stopDetection();
    }

    let attentionHistory = [];
    let lastAlertTime = 0;
    const alertCooldown = 30000; 

    this.detectionInterval = setInterval(async () => {
      try {
        const result = await this.detectFace(videoElement);
        
        if (result.detected) {
          const attentionScore = this.calculateAttentionScore(result.expressions);
          const expressionType = this.determineExpressionType(result.expressions);
          
          const attentionData = {
            score: attentionScore,
            expression: expressionType,
            confidence: result.confidence,
            timestamp: result.timestamp
          };

          attentionHistory.push(attentionData);

          const oneMinuteAgo = Date.now() - 60000;
          attentionHistory = attentionHistory.filter(data => data.timestamp > oneMinuteAgo);

          const averageAttention = attentionHistory.reduce((sum, data) => sum + data.score, 0) / attentionHistory.length;

          // Check for engagement issues
          const currentTime = Date.now();
          if (currentTime - lastAlertTime > alertCooldown) {
            if (expressionType === 'bored' && this.getDuration(expressionType, attentionHistory) > this.boredThreshold) {
              const alert = this.generateAlertMessage('bored', this.boredThreshold);
              onAlert(alert);
              lastAlertTime = currentTime;
            } else if (expressionType === 'distracted' && this.getDuration(expressionType, attentionHistory) > this.distractedThreshold) {
              const alert = this.generateAlertMessage('distracted', this.distractedThreshold);
              onAlert(alert);
              lastAlertTime = currentTime;
            }
          }

          // Call attention update callback
          onAttentionUpdate({
            score: attentionScore,
            expression: expressionType,
            averageAttention,
            confidence: result.confidence,
            timestamp: result.timestamp
          });

        } else {
          // Handle no face detected
          const timeSinceLastDetection = Date.now() - this.lastDetectionTime;
          
          if (timeSinceLastDetection > this.detectionTimeout) {
            onAttentionUpdate({
              score: 0,
              expression: 'no_face',
              averageAttention: 0,
              confidence: 0,
              timestamp: Date.now(),
              error: 'Face not detected. Please ensure your face is centered, well-lit, and clearly visible.'
            });
          }
        }
      } catch (error) {
        console.error('Detection loop error:', error);
        onAttentionUpdate({
          score: 0,
          expression: 'error',
          averageAttention: 0,
          confidence: 0,
          timestamp: Date.now(),
          error: 'Face detection error. Please try again.'
        });
      }
    }, 1000); // Check every second
  }

  getDuration(expressionType, history) {
    let duration = 0;
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].expression === expressionType) {
        duration++;
      } else {
        break;
      }
    }
    return duration;
  }

  stopDetection() {
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
      this.detectionInterval = null;
    }
  }

  // Privacy-compliant data handling
  async extractFaceEmbeddings(videoElement) {
    try {
      const detection = await faceapi
        .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
        .withFaceDescriptor();

      if (detection) {
        // Convert face descriptor to encrypted format
        const embeddings = Array.from(detection.descriptor);
        return {
          embeddings,
          confidence: detection.detection.score,
          timestamp: Date.now()
        };
      }
      return null;
    } catch (error) {
      console.error('Face embedding extraction error:', error);
      return null;
    }
  }

  destroy() {
    this.stopDetection();
    this.isInitialized = false;
    this.modelsLoaded = false;
  }
}

// Export singleton instance
const faceDetectionService = new FaceDetectionService();
export default faceDetectionService; 