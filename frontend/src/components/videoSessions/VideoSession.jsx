import React, { useEffect, useState } from 'react';
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  SpeakerLayout,
  CallControls,
} from '@stream-io/video-react-sdk';

import {
  Chat,
  Channel,
  MessageList,
  MessageInput,
  Window,
  ChannelHeader,
} from 'stream-chat-react';

import { StreamChat } from 'stream-chat';
import '@stream-io/video-react-sdk/dist/css/styles.css';
import 'stream-chat-react/dist/css/v2/index.css';

import { useSelector } from 'react-redux';
import api from '../../utils/api';

// Sanitize user ID for Stream compatibility
const sanitizeUserId = (userId) => {
  if (!userId) return null;
  // Convert to string and replace invalid characters with underscores
  return userId.toString().replace(/[^a-z0-9@_-]/gi, '_');
};

const VideoSession = () => {
  const [videoClient, setVideoClient] = useState(null);
  const [chatClient, setChatClient] = useState(null);
  const [call, setCall] = useState(null);
  const [channel, setChannel] = useState(null);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState({});

  const apiKey = import.meta.env.VITE_STREAM_API_KEY;

  const rawUserId = localStorage.getItem('userId');
  const sanitizedUserId = sanitizeUserId(rawUserId);
  const { session, streamToken } = useSelector((state) => state.session);

  // Debug: Check all localStorage data
  useEffect(() => {
    const localStorageData = {
      userId: localStorage.getItem('userId'),
      streamUserId: localStorage.getItem('streamUserId'),
      authToken: !!localStorage.getItem('authToken'),
      streamToken: !!localStorage.getItem('streamToken'),
      activeSession: localStorage.getItem('activeSession'),
      streamUser: localStorage.getItem('streamUser'),
      streamUserEmail: localStorage.getItem('streamUserEmail'),
    };
    
    console.log('🔍 localStorage Debug:', localStorageData);
    setDebugInfo(prev => ({ ...prev, localStorage: localStorageData }));
  }, []);

  // Debug: Check Redux state
  useEffect(() => {
    const reduxData = {
      session: session,
      streamToken: streamToken,
      sessionKeys: session ? Object.keys(session) : null,
    };
    
    console.log('🔍 Redux State Debug:', reduxData);
    setDebugInfo(prev => ({ ...prev, redux: reduxData }));
  }, [session, streamToken]);

  useEffect(() => {
    const init = async () => {
      try {
        const callId = session?.id || session?.sessionId;
        
        const initDebug = {
          apiKey: !!apiKey,
          streamToken: !!streamToken,
          rawUserId,
          sanitizedUserId,
          callId,
          session: !!session,
          sessionId: session?.id,
          sessionSessionId: session?.sessionId
        };
        
        console.log('🔍 Debug VideoSession init:', initDebug);
        setDebugInfo(prev => ({ ...prev, init: initDebug }));

        if (!apiKey || !streamToken || !sanitizedUserId || !callId) {
          const missingData = [];
          if (!apiKey) missingData.push('apiKey');
          if (!streamToken) missingData.push('streamToken');
          if (!sanitizedUserId) missingData.push('userId');
          if (!callId) missingData.push('callId');
          
          const errorMsg = `Missing required data: ${missingData.join(', ')}`;
          setError(errorMsg);
          console.error("Missing video/chat session data:", missingData);
          return;
        }

        console.log('✅ All required data present, initializing Stream clients...');

        // Initialize Stream Video Client
        const videoClientInstance = new StreamVideoClient({
          apiKey,
          user: { id: sanitizedUserId },
          token: streamToken,
        });
        setVideoClient(videoClientInstance);

        // Join video call
        const videoCall = videoClientInstance.call("default", callId);
        console.log('📞 Joining video call with ID:', callId);
        await videoCall.join();
        setCall(videoCall);

        // Initialize Stream Chat Client
        const chatInstance = StreamChat.getInstance(apiKey);
        console.log('💬 Connecting to Stream Chat...');
        await chatInstance.connectUser({ id: sanitizedUserId }, streamToken);

        // Create or join chat channel
        const chatChannelId = session.conversationId || callId;
        console.log('📢 Creating chat channel:', chatChannelId);
        const chatChannel = chatInstance.channel(
          "messaging",
          chatChannelId,
          {
            members: session.attendeeList || [sanitizedUserId],
          }
        );

        await chatChannel.watch();

        setChatClient(chatInstance);
        setChannel(chatChannel);
        setError(null);
        console.log('✅ Stream clients initialized successfully!');
      } catch (err) {
        console.error('❌ Error initializing video/chat session:', err);
        setError(`Failed to initialize session: ${err.message}`);
      }
    };

    init();

    return () => {
      if (videoClient) videoClient.disconnectUser?.();
      if (chatClient) chatClient.disconnectUser?.();
    };
  }, [apiKey, streamToken, sanitizedUserId, session]);

  console.log('🔍 VideoSession state:', {
    apiKey: !!apiKey,
    streamToken: !!streamToken,
    rawUserId,
    sanitizedUserId,
    session: !!session,
    error,
    videoClient: !!videoClient,
    chatClient: !!chatClient,
    call: !!call,
    channel: !!channel
  });

  if (error) {
    return (
      <div style={{ padding: '20px', fontFamily: 'monospace' }}>
        <h3 style={{ color: 'red' }}>❌ Error: {error}</h3>
        <details>
          <summary>Debug Information</summary>
          <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
        </details>
      </div>
    );
  }

  if (!videoClient || !chatClient || !call || !channel) {
    return (
      <div style={{ padding: '20px', fontFamily: 'monospace' }}>
        <h3>⏳ Loading session and chat...</h3>
        <details>
          <summary>Debug Information</summary>
          <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
        </details>
      </div>
    );
  }

  if (!session?.id || !streamToken) {
    return (
      <div style={{ padding: '20px', fontFamily: 'monospace' }}>
        <h3 style={{ color: 'orange' }}>⚠️ Invalid or expired session</h3>
        <details>
          <summary>Debug Information</summary>
          <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
        </details>
      </div>
    );
  }

  return (
    <StreamVideo client={videoClient}>
      <StreamCall call={call}>
        <div style={{ display: 'flex', height: '100vh' }}>
          <div style={{ flex: 2 }}>
            <SpeakerLayout />
            <CallControls />
          </div>

          <div style={{ flex: 1, borderLeft: '1px solid #ccc' }}>
            <Chat client={chatClient}>
              <Channel channel={channel}>
                <Window>
                  <ChannelHeader />
                  <MessageList />
                  <MessageInput />
                </Window>
              </Channel>
            </Chat>
          </div>
        </div>
      </StreamCall>
    </StreamVideo>
  );
};

export default VideoSession;
