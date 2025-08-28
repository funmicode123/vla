import {
  StreamVideo,
  StreamCall,
  StreamVideoClient,
  CallControls,
  CallParticipantsList,
  SpeakerLayout,
  useCall,
  useCallStateHooks,
  CallingState,
} from '@stream-io/video-react-sdk';

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../utils/api'; 

export default function VideoPlayer() {
  const { callId } = useParams();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    const joinCall = async () => {
      if (!callId) return;

      const apiKey = import.meta.env.VITE_STREAM_API_KEY;
      const storedUser = JSON.parse(localStorage.getItem('user'));

      if (!storedUser) {
        console.error('User not found in localStorage');
        return;
      }

      try {
        const response = await api.post('/stream/token', { userId: storedUser.id });
        const { token } = response.data;

        const user = {
          id: storedUser.id,
          name: storedUser.name,
          image: storedUser.image || `https://getstream.io/random_svg/?id=${storedUser.id}&name=${storedUser.name}`,
        };

        const streamClient = new StreamVideoClient({ apiKey, user, token });
        const callInstance = streamClient.call('default', callId);

        await callInstance.join({ create: true });

        setClient(streamClient);
        setCall(callInstance);
        setJoined(true);
        
      } catch (error) {
        console.error('Error joining call:', error);
      }
    };

    joinCall();
  }, [callId]);

  if (!joined || !client || !call) return <div>Joining call...</div>;

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <LiveVideoUI />
      </StreamCall>
    </StreamVideo>
  );
}

// export const LiveVideoUI = () => {
//   console.log("🔁 LiveVideoUI rendering...");
//   const call = useCall();
//   const { useCallCallingState } = useCallStateHooks();
//   const callingState = useCallCallingState();

//   console.log(" 📞 Calling state:", callingState);

//   if (callingState !== CallingState.JOINED) {
//     // return <div>Loading video session...</div>;
//     return <div style={{ color: 'white' }}>✅ JOINED</div>;
// }

export const LiveVideoUI = () => {
  const call = useCall();
  const { useCallCallingState, useParticipantCount, useCameraState, useMicrophoneState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const camera = useCameraState();
  const mic = useMicrophoneState();
  const participantCount = useParticipantCount();

  useEffect(() => {
    console.log("🔍 CallingState:", callingState);
    console.log("👤 ParticipantCount:", participantCount);
    console.log("📷 Camera:", camera);
    console.log("🎙️ Mic:", mic);
    console.log("📞 Full call object:", call);
  }, [callingState, participantCount, camera, mic, call]);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        console.log("✅ Camera/Mic access granted.");
        stream.getTracks().forEach(track => track.stop()); // Stop after test
      })
      .catch((err) => {
        console.error("🚫 Camera/Mic access denied or error:", err);
      });
  }, []);


  console.log("Calling state:", callingState);         // This should say "joining" then "joined"
  console.log("Participant count:", participantCount); // Should be 1 or more
  console.log("Camera state:", camera);
  console.log("Mic state:", mic);
  console.log("Call object:", call);

  if (callingState !== CallingState.JOINED) {
    return <div style={{ color: 'white' }}>🔥 Forcing render — check console logs</div>;
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ flex: 3, padding: '10px' }}>
        <SpeakerLayout />
        <CallControls />
      </div>
      <div style={{ flex: 1, borderLeft: '1px solid #ccc', padding: '10px' }}>
        <CallParticipantsList />
      </div>
    </div>
  );
};
