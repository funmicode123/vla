import React, { useState, useRef, useEffect } from 'react';
import {
  StreamVideoClient,
  StreamVideo,
  StreamCall,
  useCallStateHooks,
  ParticipantView,
  SpeakerLayout,
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';
import { StreamChat } from 'stream-chat';
import { useSelector, useDispatch } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import ChatBox from './ChatBox';
import './VideoCallLayout.css';
import { Copy } from 'lucide-react';
import { Toast } from "../../../ui/Modal";
import Modal from "../../../ui/Modal";
import api from '../../../../utils/api';
import SplitLayout from './SplitLayout';
import { AnimatePresence, motion } from 'framer-motion';
import { FaHandPaper } from 'react-icons/fa';
import { MdCallEnd } from 'react-icons/md';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { checkSessionPermissionThunk } from '../../../../store/slices/sessionSlice';
import faceDetectionService from '../../../../services/faceDetectionService';
import alertService from '../../../../services/alertService';

const apiKey = import.meta.env.VITE_STREAM_API_KEY;

export default function Session() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { session, streamToken, allowed, status, error } = useSelector((state) => state.session);
  const streamUser = JSON.parse(localStorage.getItem('streamUser') || '{}');

  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [captionsOn, setCaptionsOn] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [engagementData, setEngagementData] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const [allParticipantsData, setAllParticipantsData] = useState([]);
  const [lastSentIndex, setLastSentIndex] = useState(-1);
  const [isRecording, setIsRecording] = useState(false);
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false);
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);
  const [reaction, setReaction] = useState(false);
  const [distractionActive, setDistractionActive] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const videoRef = useRef(null); // Ref for local video (used for face detection)

  // Chat panel width state for resizing
  const [chatWidth, setChatWidth] = useState(380);
  const chatPanelRef = useRef(null);
  const resizing = useRef(false);
  const [windowWidth, setWindowWidth] = useState(1200);

  // Mouse events for resizing chat panel
  const onChatResizeMouseDown = (e) => {
    resizing.current = true;
    document.body.style.cursor = 'col-resize';
  };
  const onChatResizeMouseMove = (e) => {
    if (!resizing.current) return;
    const min = 240, max = 480;
    let newWidth = windowWidth - e.clientX;
    newWidth = Math.max(min, Math.min(max, newWidth));
    setChatWidth(newWidth);
  };
  const onChatResizeMouseUp = () => {
    resizing.current = false;
    document.body.style.cursor = '';
  };
  useEffect(() => {
    // Set initial window width
    setWindowWidth(window.innerWidth);

    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', onChatResizeMouseMove);
    window.addEventListener('mouseup', onChatResizeMouseUp);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onChatResizeMouseMove);
      window.removeEventListener('mouseup', onChatResizeMouseUp);
    };
  }, []);

  const callRef = useRef(null);
  const setupCompleteRef = useRef(false);

  // Check session permission when component mounts
  useEffect(() => {
    console.log('🔍 Session component mounted with sessionId:', sessionId);
    console.log('🔍 Current Redux state:', { session, streamToken, allowed, status, error });
    console.log('🔍 Local storage data:', {
      activeSession: localStorage.getItem('activeSession'),
      streamToken: localStorage.getItem('streamToken'),
      streamUser: localStorage.getItem('streamUser'),
      authToken: localStorage.getItem('authToken')
    });

    if (sessionId) {
      console.log('📡 Dispatching permission check for sessionId:', sessionId);
      dispatch(checkSessionPermissionThunk(sessionId));
    } else {
      console.warn('⚠️ No sessionId found in URL params');
    }
  }, [sessionId, dispatch]); // Removed dependencies that cause re-renders

  // Handle permission check results
  useEffect(() => {
    console.log('🔍 Permission check status changed:', { status, allowed, error });
    if (status === 'failed' || allowed === false) {
      console.warn('❌ Permission check failed:', { status, allowed, error });
      // Don't redirect immediately, let the session setup handle it
      // toast.error(error || 'Access denied to this session');
      // navigate('/sessions');
    } else if (status === 'succeeded' && allowed === true) {
      console.log('✅ Permission check succeeded');
    }
  }, [status, allowed, error]);

  // Check device permissions
  useEffect(() => {
    const checkDevicePermissions = async () => {
      try {
        // Check camera permission
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoStream.getTracks().forEach(track => track.stop());
        setCameraPermissionDenied(false);
      } catch (err) {
        console.warn('Camera permission denied:', err.message);
        setCameraPermissionDenied(true);
      }

      try {
        // Check microphone permission
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStream.getTracks().forEach(track => track.stop());
        setMicPermissionDenied(false);
      } catch (err) {
        console.warn('Microphone permission denied:', err.message);
        setMicPermissionDenied(true);
      }
    };

    checkDevicePermissions();
  }, []);

  const showToast = (message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  };
  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  useEffect(() => {
    if (!session) return;

    console.log('⏰ Checking session end time...');
    console.log('📅 Session data:', session);

    // Check if session has endTime, if not, set a default future time
    if (!session.endTime) {
      console.log('⚠️ No endTime found, setting default future time');
      // Set session to end in 2 hours from now
      const defaultEndTime = new Date(Date.now() + 2 * 60 * 60 * 1000);
      console.log('⏰ Default end time set to:', defaultEndTime);
      return; // Don't set up timers if no end time
    }

    const endTime = new Date(session.endTime).getTime();
    const now = Date.now();
    const msToEnd = endTime - now;

    console.log('⏰ Time calculations:', {
      endTime: new Date(endTime),
      now: new Date(now),
      msToEnd,
      msToEndMinutes: Math.round(msToEnd / 60000)
    });

    if (msToEnd <= 0) {
      console.log('⏰ Session has already ended, setting sessionEnded to true');
      setSessionEnded(true);
      return;
    }

    let hostTimer;
    if (session.host && streamUser && (session.host.id === streamUser.id || session.host.email === streamUser.email)) {
      const msToHostWarn = msToEnd - 5 * 60 * 1000;
      if (msToHostWarn > 0) {
        hostTimer = setTimeout(() => {
          showToast('Session will end in 5 minutes. Please wrap up.', 'warning', 30000);
        }
          , msToHostWarn);
      }
    }

    let engagementInterval;
    if (msToEnd > 0) {
      engagementInterval = setInterval(() => {
        showToast('Stay engaged! Please participate in the session.', 'info', 5000);
      }, 2 * 60 * 1000);
    }

    const endTimer = setTimeout(() => {
      console.log('⏰ Session end timer triggered');
      setSessionEnded(true);
    }, msToEnd);

    return () => {
      if (hostTimer) clearTimeout(hostTimer);
      if (engagementInterval) clearInterval(engagementInterval);
      clearTimeout(endTimer);
    };
  }, [session, streamUser]);

  // Handle session end (redirect or show summary)
  useEffect(() => {
    if (sessionEnded) {
      console.log('🔄 Session ended, showing summary and redirecting...');
      showToast('Session has ended.', 'error', 6000);
      // Temporarily disable dashboard navigation to debug
      // setTimeout(() => {
      //   console.log('🔄 Redirecting to dashboard...');
      //   window.location.href = '/dashboard'; 
      // }, 6000);
    }
  }, [sessionEnded]);

  // Session setup
  useEffect(() => {
    // Prevent multiple setup attempts
    if (setupCompleteRef.current) {
      console.log('🚫 Session setup already completed, skipping...');
      return;
    }

    const setup = async () => {
      console.log('🚀 Starting session setup...');

      // If session is not in Redux state, try to get it from localStorage
      let sessionData = session;
      let streamTokenData = streamToken;

      console.log('🔍 Initial data check:', {
        sessionFromRedux: !!session,
        streamTokenFromRedux: !!streamToken,
        sessionData: !!sessionData,
        streamTokenData: !!streamTokenData
      });

      if (!sessionData) {
        console.log('📦 Session not in Redux, checking localStorage...');
        const activeSession = localStorage.getItem('activeSession');
        if (activeSession) {
          try {
            sessionData = JSON.parse(activeSession);
            console.log('✅ Found session in localStorage:', sessionData);
          } catch (e) {
            console.error('❌ Failed to parse activeSession from localStorage:', e);
          }
        } else {
          console.warn('⚠️ No activeSession found in localStorage');
        }
      }

      if (!streamTokenData) {
        console.log('🔑 StreamToken not in Redux, checking localStorage...');
        streamTokenData = localStorage.getItem('streamToken');
        console.log('🔑 StreamToken from localStorage:', !!streamTokenData);
      }

      console.log('🔍 Final data check before setup:', {
        sessionData: !!sessionData,
        streamUser: !!streamUser?.email,
        streamTokenData: !!streamTokenData,
        streamUserEmail: streamUser?.email
      });

      // Log the actual session data structure
      if (sessionData) {
        console.log('📋 Session data structure:', {
          keys: Object.keys(sessionData),
          id: sessionData.id,
          sessionId: sessionData.sessionId,
          topic: sessionData.topic,
          startTime: sessionData.startTime,
          endTime: sessionData.endTime,
          host: sessionData.host
        });
      }

      if (!sessionData || !streamUser?.email || !streamTokenData) {
        console.error('❌ Missing required data for session setup:', {
          session: !!sessionData,
          streamUser: !!streamUser?.email,
          streamToken: !!streamTokenData,
        });
        toast.error('Missing session data. Please try creating a new session.');
        // Don't navigate immediately, let user see the error
        // navigate('/sessions');
        return;
      }

      try {
        console.log('🔐 Decoding stream token...');
        const { user_id } = jwtDecode(streamTokenData);
        const user = {
          id: user_id,
          name: streamUser.email,
          image: `https://getstream.io/random_svg/?id=${streamUser.email}&name=${streamUser.email}`,
        };
        console.log('👤 User object created:', user);

        console.log('📹 Initializing Stream Video Client...');
        const videoClient = new StreamVideoClient({ apiKey });
        await videoClient.connectUser(user, streamTokenData);
        console.log('✅ Video client connected');

        const sessionId = sessionData.sessionId || sessionData.id;
        console.log('📞 Creating video call with sessionId:', sessionId);
        const callInstance = videoClient.call('default', sessionId);
        await callInstance.join({ create: true });
        console.log('✅ Video call joined');

        if (!cameraPermissionDenied) {
          try {
            await callInstance.camera.enable();
            console.log('📷 Camera enabled');
          } catch (err) {
            console.warn('⚠️ Could not enable camera:', err.message);
            toast.error('Failed to enable camera. Check permissions.');
          }
        }

        if (!micPermissionDenied) {
          try {
            await callInstance.microphone.enable();
            console.log('🎤 Microphone enabled');
          } catch (err) {
            console.warn('⚠️ Could not enable microphone:', err.message);
            toast.error('Failed to enable microphone. Check permissions.');
          }
        }

        setClient(videoClient);
        setCall(callInstance);
        callRef.current = callInstance;
        console.log('✅ Video client and call set in state');

        console.log('💬 Initializing Stream Chat Client...');
        const chat = new StreamChat(apiKey);
        await chat.connectUser(user, streamTokenData);
        const chatChannel = chat.channel('messaging', sessionData.chatChannelId || `session-${sessionId}`);
        try {
          await chatChannel.create();
          console.log('✅ Chat channel created');
        } catch (err) {
          console.error('❌ Stream Chat error:', err.message);
          showToast('Unable to set up chat. Video and other features are still available.', 'error');
        }
        setChatClient(chat);
        setChannel(chatChannel);
        console.log('✅ Chat client and channel set in state');
        console.log('🎉 Session setup completed successfully!');

        // Mark setup as complete
        setupCompleteRef.current = true;
      } catch (err) {
        console.error('❌ Session setup error:', err);
        toast.error('Failed to initialize session. Please try again.');
        // Don't navigate immediately, let user see the error
        // navigate('/sessions');
      }
    };

    console.log('🔍 Session setup useEffect triggered with:', {
      status,
      allowed,
      session: !!session,
      streamUser: !!streamUser,
      streamToken: !!streamToken
    });

    // Temporarily bypass permission check to get video session working
    console.log('🚀 Proceeding with session setup immediately...');
    setup();

    return () => {
      if (callRef.current) callRef.current.leave().catch(() => { });
      if (chatClient) chatClient.disconnectUser().catch(() => { });
      faceDetectionService.stopDetection();
    };
  }, []); // Empty dependency array - only run once on mount

  // Initialize face detection and alerts
  useEffect(() => {
    if (call && !isHost && setupCompleteRef.current) {
      const initFaceDetection = async () => {
        try {
          await faceDetectionService.initialize();
          await alertService.initialize(sessionId);

          // We need a local stream for the face analysis
          const localStream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = localStream;

            faceDetectionService.startDetection(
              videoRef.current,
              (attentionData) => {
                setEngagementData(prev => [...prev.slice(-19), attentionData]);

                // Log to backend occasionally (e.g., every 10 seconds or on significant state change)
                if (Math.random() < 0.1) {
                  api.post('/api/v1/engagement', {
                    session_id: session._id || session.id,
                    user_id: streamUser.mongoId || streamUser.id, // Ensure we have the right ID format
                    expression_type: attentionData.expression,
                    confidence_score: attentionData.score,
                    timestamp: new Date(),
                    popup_message: 'Regular engagement check'
                  }).catch(console.error);
                }
              },
              (alert) => {
                setDistractionActive(true);
                showToast(alert.message, 'warning', 10000);

                // Log distraction event
                api.post('/api/v1/engagement', {
                  session_id: session._id || session.id,
                  user_id: streamUser.mongoId || streamUser.id,
                  expression_type: 'distracted',
                  confidence_score: 1.0,
                  timestamp: new Date(),
                  popup_message: alert.message
                }).catch(console.error);
              }
            );
          }
        } catch (err) {
          console.error('Face detection init error:', err);
        }
      };

      initFaceDetection();
    }
  }, [call, isHost, sessionId, session, streamUser]);

  // On session end, fetch and visualize host summary
  useEffect(() => {
    if (sessionEnded && session?.host && streamUser && (session.host.id === streamUser.id || session.host.email === streamUser.email)) {
      // Fetch all engagement logs for this session
      const sessionId = session.sessionId || session.id;
      api.get(`/api/v1/engagement?sessionId=${sessionId}`)
        .then(res => {
          const logs = res.data.data;
          // Group by user
          const byUser = {};
          logs.forEach(log => {
            const user = log.user_id?.email || log.user_id || 'Unknown';
            if (!byUser[user]) byUser[user] = [];
            byUser[user].push(log);
          });
          // Compute average attention per user
          const allData = Object.entries(byUser).map(([name, arr]) => ({
            name,
            avg: arr.reduce((a, b) => a + (b.averageAttention || b.attentionScore || 0), 0) / arr.length
          }));
          setAllParticipantsData(allData);
          setShowSummary(true);
        })
        .catch(() => setShowSummary(true)); // Show summary even if fetch fails
    }
  }, [sessionEnded, session, streamUser]);

  // Define isHost based on current session data
  const isHost = session?.host && streamUser && (session.host.id === streamUser.id || session.host.email === streamUser.email);

  // Add a simple test render to see if component is working
  console.log('🎬 Session component rendering with state:', {
    sessionId,
    session: !!session,
    streamUser: !!streamUser,
    streamToken: !!streamToken,
    client: !!client,
    call: !!call,
    chatClient: !!chatClient,
    channel: !!channel,
    status,
    allowed
  });

  // Show loading state while setting up
  if (!client || !call || !chatClient || !channel) {
    console.log('⏳ Component in loading state, waiting for session setup...');
    return (
      <div className="video-call-root" style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        height: '100vh',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f5f5f5'
      }}>
        <div style={{
          padding: '2rem',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <h2>Loading Video Session...</h2>
          <p>Setting up your video call and chat...</p>
          <div style={{ marginTop: '1rem' }}>
            <p><strong>Debug Info:</strong></p>
            <p>Session: {session ? '✅' : '❌'}</p>
            <p>Stream User: {streamUser?.email ? '✅' : '❌'}</p>
            <p>Stream Token: {streamToken ? '✅' : '❌'}</p>
            <p>Permission Status: {status}</p>
            <p>Allowed: {allowed ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>
    );
  }

  const handleMicToggle = async () => {
    if (!call) return;

    try {
      await call.microphone.toggle();
      setMicOn((prev) => !prev);
    } catch (error) {
      console.error("Failed to toggle microphone:", error);
    }
  };


  const handleCameraToggle = async () => {
    if (!call) return;

    try {
      if (cameraOn) {
        await call.camera.disable();
      } else {
        await call.camera.enable();
      }
      setCameraOn((prev) => !prev);
    } catch (error) {
      console.error("Failed to toggle camera:", error);
    }
  };

  const handleScreenShare = async () => {
    if (!call) return;
    try {
      if (screenSharing) {
        await call.screenShare.disable();
      } else {
        // Optionally set settings before starting
        // call.screenShare.setSettings({ contentHint: "detail" });
        await call.screenShare.enable();
      }

      setScreenSharing(prev => !prev);
    } catch (err) {
      console.error("Screen‑share toggle failed:", err);
      // Optional: surface an error toast/snackbar for the user here
      toast.error('Screen‑share toggle failed');
    }
  };

  const handleCaptions = () => setCaptionsOn((v) => !v);
  const handleHandRaise = () => setHandRaised((v) => !v);
  const handleReaction = () => setReaction((v) => !v);
  const handleParticipants = () => setParticipantsOpen((v) => !v);
  const handleLeave = () => window.location.href = '/dashboard';

  const handleRecordingToggle = async () => {
    if (isRecording) {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        setIsRecording(false);
        showToast('Recording stopped. Preparing download...', 'info');
      }
    } else {
      try {
        // Capture screen for recording (host usually wants to record participants + content)
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: { cursor: "always" }, audio: true });

        const recorder = new MediaRecorder(stream);
        const chunks = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = `session-recording-${sessionId}-${Date.now()}.webm`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);

          // Stop all tracks in the stream
          stream.getTracks().forEach(track => track.stop());
        };

        recorder.start();
        setMediaRecorder(recorder);
        setRecordedChunks(chunks);
        setIsRecording(true);
        showToast('Recording started. You are capturing your screen.', 'success');
      } catch (err) {
        console.error('Recording setup error:', err);
        toast.error('Failed to start recording. Please ensure you grant screen capture permissions.');
      }
    }
  };

  const HandRaiseIndicator = () => {
    useEffect(() => {
      if (handRaised) {
        const timer = setTimeout(() => {
          setHandRaised(false);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }, [handRaised]);
    return (
      <AnimatePresence>
        {handRaised && (
          <motion.div
            key="hand"
            initial={{ opacity: 0, y: 40, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.5 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="hand-raise-indicator"
            style={{
              position: 'absolute',
              top: 24,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 20,
              background: 'rgba(255,255,255,0.95)',
              borderRadius: 12,
              padding: '0.5rem 1.2rem',
              boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontWeight: 600,
              color: '#e6b800',
              fontSize: 18,
            }}
          >
            <FaHandPaper className="hand-icon" style={{ fontSize: 28, marginRight: 8 }} />
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  // Custom participant grid for flex row wrap
  const ParticipantGrid = () => {
    const { useParticipants } = useCallStateHooks();
    const participants = useParticipants();
    return (
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
        }}
      >
        {participants.map((participant) => (
          <div
            key={participant.sessionId}
            style={{
              flex: '1 1 220px',
              maxWidth: '320px',
              minWidth: '180px',
              aspectRatio: '16/9',
              background: '#222',
              borderRadius: '1rem',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {participant.publishingVideo ? (
              <ParticipantView participant={participant} />
            ) : (
              <span style={{ color: '#fff' }}>No Video</span>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (!client || !call || !chatClient || !channel) {
    return <div className="video-call-root"><div className="loading">Loading session and chat...</div></div>;
  }

  // Main content layout: flex row, video left, chat right 
  const mainContent = (
    <div
      style={{
        display: 'flex',
        flexDirection: windowWidth < 700 ? 'column' : 'row',
        width: '100vw',
        height: windowWidth < 700 ? 'auto' : 'calc(100vh - 6.5rem)',
        transition: 'all 0.3s',
      }}
    >
      <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
        <div className="video-area" style={{ width: '100%', height: '100%', position: 'relative' }}>
          {/* Session ID Overlay */}
          <div style={{
            position: 'absolute',
            top: 20,
            left: 20,
            zIndex: 30,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '8px 16px',
            borderRadius: '12px',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter invisible sm:visible">Session ID</span>
              <span className="font-mono text-sm font-bold text-gray-800">{sessionId}</span>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(sessionId);
                showToast('Session ID copied!', 'success');
              }}
              className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
              title="Copy Session ID"
            >
              <Copy className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
            </button>
          </div>
          <HandRaiseIndicator />
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <SpeakerLayout />
            </StreamCall>
          </StreamVideo>
          <div className="user-name">{streamUser?.email}</div>
        </div>
      </div>
      {/* Animated chat panel */}
      <div
        ref={chatPanelRef}
        style={{
          width: showChat ? chatWidth : 0,
          minWidth: showChat ? 240 : 0,
          maxWidth: 480,
          height: '100%',
          borderLeft: showChat ? '1px solid #23243a' : 'none',
          background: '#fff',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'width 0.35s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: showChat ? '-2px 0 8px rgba(0,0,0,0.04)' : 'none',
        }}
      >
        {/* Drag handle for resizing */}
        {showChat && (
          <div
            style={{
              width: 8,
              cursor: 'col-resize',
              background: '#eee',
              height: '100%',
              position: 'absolute',
              left: 0,
              top: 0,
              zIndex: 2,
            }}
            onMouseDown={onChatResizeMouseDown}
          />
        )}
        {showChat && <ChatBox chatClient={chatClient} channel={channel} onClose={() => setShowChat(false)} />}
      </div>
    </div>
  );

  return (
    <div className="video-call-root" style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh' }}>
      {/* Toast notifications */}
      <div style={{ position: 'fixed', top: 0, right: 0, zIndex: 9999 }}>
        {toasts.map((toast) => (
          <Toast key={toast.id} message={toast.message} type={toast.type} duration={toast.duration} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
      {/* Hidden video for face detection analysis */}
      <video
        ref={videoRef}
        style={{ display: 'none' }}
        autoPlay
        muted
        playsInline
      />
      {mainContent}
      <div className="call-controls-bar" style={{ width: '100vw', position: 'relative', left: 0, bottom: 0, margin: 0, borderRadius: 0, justifyContent: 'center' }}>
        {/* Host-only: Recording toggle */}
        {isHost && (
          <button
            className={`control-btn${isRecording ? ' on' : ''}`}
            style={{ background: isRecording ? '#e53935' : undefined }}
            onClick={handleRecordingToggle}
            title={isRecording ? 'Stop recording' : 'Start recording'}
          >
            {isRecording ? '⏺️ Recording' : '⏺️ Record'}
          </button>
        )}
        <button className={`control-btn ${micOn ? '' : 'off'}`} onClick={handleMicToggle} title="Toggle microphone">
          {micOn ? '🎤' : '🔇'}
        </button>
        <button className={`control-btn ${cameraOn ? '' : 'off'}`} onClick={handleCameraToggle} title="Toggle camera">
          {cameraOn ? '📷' : '🚫'}
        </button>
        <button className={`control-btn ${screenSharing ? 'on' : ''}`} onClick={handleScreenShare} title="Share screen">
          🖥️
        </button>
        <button className={`control-btn ${reaction ? 'on' : ''}`} onClick={handleReaction} title="Reactions">
          😊
        </button>
        <button className={`control-btn ${captionsOn ? 'on' : ''}`} onClick={handleCaptions} title="Captions">
          📝
        </button>
        <button className={`control-btn ${handRaised ? 'on' : ''}`} onClick={handleHandRaise} title="Raise hand">
          ✋
        </button>
        <button className={`control-btn ${participantsOpen ? 'on' : ''}`} onClick={handleParticipants} title="Show participants">
          👥
        </button>
        <button className={`control-btn ${showChat ? 'on' : ''}`} onClick={() => setShowChat((v) => !v)} title="Open chat">
          💬
        </button>
        <button className="control-btn" title="More options">
          ⋮
        </button>
        <button className="control-btn leave-btn" onClick={handleLeave} title="Leave call">
          <MdCallEnd />
        </button>
      </div>
      {/* Summary Modal */}
      {showSummary && (
        <Modal isOpen={showSummary} onClose={() => setShowSummary(false)} title="Session Engagement Summary">
          {/* Host view: Bar chart */}
          {session.host && streamUser && (session.host.id === streamUser.id || session.host.email === streamUser.email) ? (
            <div>
              <h4 className="font-bold mb-2">Participant Engagement (Average Attention)</h4>
              <div style={{ width: 300 }}>
                {allParticipantsData.map((p) => (
                  <div key={p.name} className="mb-2">
                    <div className="flex justify-between"><span>{p.name}</span><span>{(p.avg * 100).toFixed(1)}%</span></div>
                    <div style={{ background: '#e5e7eb', borderRadius: 4, height: 18 }}>
                      <div style={{ width: `${p.avg * 100}%`, background: '#3b82f6', height: 18, borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Participant view: Table
            <div>
              <h4 className="font-bold mb-2">Your Engagement Summary</h4>
              <table className="min-w-full text-sm">
                <thead><tr><th className="text-left">Metric</th><th className="text-left">Value</th></tr></thead>
                <tbody>
                  <tr><td>Average Attention</td><td>{(engagementData.reduce((a, b) => a + b.averageAttention, 0) / (engagementData.length || 1)).toFixed(2)}</td></tr>
                  <tr><td>Max Attention</td><td>{Math.max(...engagementData.map(d => d.averageAttention)).toFixed(2)}</td></tr>
                  <tr><td>Min Attention</td><td>{Math.min(...engagementData.map(d => d.averageAttention)).toFixed(2)}</td></tr>
                  <tr><td>Most Common Expression</td><td>{(() => { const freq = {}; engagementData.forEach(d => { freq[d.expression] = (freq[d.expression] || 0) + 1; }); return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'; })()}</td></tr>
                </tbody>
              </table>
            </div>
          )}
        </Modal>
      )}

      {/* Distraction Alert Modal */}
      <Modal
        isOpen={distractionActive}
        onClose={() => setDistractionActive(false)}
        title="Are you still there?"
        size="sm"
      >
        <div className="text-center">
          <p className="mb-4 text-gray-600">We noticed you've been distracted. Please click the button below to confirm you're still following the session.</p>
          <button
            onClick={() => setDistractionActive(false)}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
          >
            I'm back!
          </button>
        </div>
      </Modal>

      {/* You can add a ParticipantsPanel here if you want */}
    </div>
  );
}
