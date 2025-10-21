import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { StreamChat } from 'stream-chat';
import { jwtDecode } from 'jwt-decode';

const streamClient = StreamChat.getInstance(import.meta.env.VITE_STREAM_API_KEY);

export const hostSessionThunk = createAsyncThunk(
  'session/host',
  async ({ topic, startTime, endTime }, { rejectWithValue }) => {
    try {
      const jwtToken = localStorage.getItem('authToken');
      let rawEmail = localStorage.getItem('streamUserEmail');
      let userEmail = (rawEmail && rawEmail !== 'undefined' && rawEmail !== 'null') ? JSON.parse(rawEmail) : null;
      const userId = localStorage.getItem('streamUserId');

      if (!jwtToken || !userEmail || !userId) {
        return rejectWithValue('Authentication data missing');
      }

      const payload = {
        topic,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        attendeeList: [userEmail],
      };

      const res = await api.post('/sessions', payload, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });

      const { data } = res.data;
      const { streamToken, sessionId, link, chatChannelId, ...rest } = data;

      const normalizedSession = {
        ...rest,
        sessionId,
        link,
        chatChannelId: chatChannelId || `session-${sessionId}`,
      };

      localStorage.setItem('streamToken', streamToken);
      localStorage.setItem('streamUser', JSON.stringify({ email: userEmail }));
      localStorage.setItem('activeSession', JSON.stringify(normalizedSession));

      return {
        session: normalizedSession,
        streamToken,
      };
    } catch (err) {
      console.error('Host error:', err.response?.data || err.message);
      return rejectWithValue(err.response?.data || 'Failed to host session');
    }
  }
);

export const joinSessionThunk = createAsyncThunk(
  'session/join',
  async (linkCode, { rejectWithValue }) => {
    try {
      const jwtToken = localStorage.getItem('authToken');

      const res = await api.patch(`/sessions/join/${linkCode}`, {}, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });

      const { data } = res.data;
      const { session, streamToken, chatChannelId } = data;

      const sessionId = session.id;
      const normalizedChatChannelId = chatChannelId || `session-${session.id}`;

      const userEmail = session.attendeeList?.slice(-1)[0];

      localStorage.setItem('streamToken', streamToken);
      localStorage.setItem('streamUser', JSON.stringify({ email: userEmail }));
      localStorage.setItem('activeSession', JSON.stringify({
        ...session,
        sessionId: session.id,
        chatChannelId: normalizedChatChannelId,
      }));

      return {
        session: {
          ...session,
          sessionId: session.id,
          chatChannelId: normalizedChatChannelId,
        },
        streamToken,
      };
    } catch (err) {
      console.error('Join error response:', err.response?.data);
      return rejectWithValue(err.response?.data || 'Failed to join session');
    }
  }
);

export const checkSessionPermissionThunk = createAsyncThunk(
  'session/checkPermission',
  async (sessionId, { rejectWithValue }) => {
    try {
      const jwtToken = localStorage.getItem('authToken');
      
      if (!jwtToken) {
        return rejectWithValue('Authentication token missing');
      }

      const res = await api.get(`/sessions/${sessionId}/permission-check`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });

      return res.data;
    } catch (err) {
      console.error('Permission check error:', err.response?.data || err.message);
      return rejectWithValue(err.response?.data || 'Failed to check permission');
    }
  }
);

export const getMySessionsThunk = createAsyncThunk(
  'session/getMySessions',
  async (_, { rejectWithValue }) => {
    try {
      const jwtToken = localStorage.getItem('authToken');
      const userId = localStorage.getItem('streamUserId');

      const res = await api.get(`/sessions?host=${userId}`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });

      return res.data.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch my sessions';
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteSessionThunk = createAsyncThunk(
  'session/deleteSession',
  async (sessionId, { rejectWithValue }) => {
    try {
      const jwtToken = localStorage.getItem('authToken');
      await api.delete(`/sessions/${sessionId}`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      return sessionId;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to delete session');
    }
  }
);

export const updateSessionThunk = createAsyncThunk(
  'session/updateSession',
  async ({ sessionId, sessionData }, { rejectWithValue }) => {
    try {
      const jwtToken = localStorage.getItem('authToken');
      const res = await api.put(`/sessions/${sessionId}`, sessionData, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
      return res.data.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to update session';
      return rejectWithValue(errorMessage);
    }
  }
);


const sessionSlice = createSlice({
  name: 'session',
  initialState: {
    session: null,
    streamToken: null,
    isJoining: false,
    error: null,
    sessions: [],
    mySessions: [],
    isDeleting: false,
    isLoading: false,
    allowed: null,
    status: "idle",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(hostSessionThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(hostSessionThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.session = action.payload.session;
        state.streamToken = action.payload.streamToken;
      })
      .addCase(hostSessionThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(joinSessionThunk.pending, (state) => {
        state.isJoining = true;
        state.error = null;
      })
      .addCase(joinSessionThunk.fulfilled, (state, action) => {
        state.isJoining = false;
        state.session = action.payload.session;
        state.streamToken = action.payload.streamToken;
      })
      .addCase(joinSessionThunk.rejected, (state, action) => {
        state.isJoining = false;
        state.error = action.payload;
      })
      .addCase(getMySessionsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMySessionsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.mySessions = action.payload;
      })
      .addCase(getMySessionsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteSessionThunk.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteSessionThunk.fulfilled, (state, action) => {
        state.isDeleting = false;
        const deletedSessionId = action.payload;
        state.sessions = state.sessions.filter(s => s.id !== deletedSessionId);
        state.mySessions = state.mySessions.filter(s => s.id !== deletedSessionId);
        if (state.session?.id === deletedSessionId) {
          state.session = null;
        }
      })
      .addCase(deleteSessionThunk.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload;
      })
      .addCase(updateSessionThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSessionThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedSession = action.payload;
      
        const sessionIndex = state.sessions.findIndex(s => s.id === updatedSession.id);
        if (sessionIndex !== -1) state.sessions[sessionIndex] = updatedSession;
      
        const mySessionIndex = state.mySessions.findIndex(s => s.id === updatedSession.id);
        if (mySessionIndex !== -1) state.mySessions[mySessionIndex] = updatedSession;
      
        if (state.session?.id === updatedSession.id) {
          state.session = updatedSession;
        }
      })
      .addCase(updateSessionThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(checkSessionPermissionThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(checkSessionPermissionThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.allowed = action.payload.allowed; 
      })
      .addCase(checkSessionPermissionThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.message || "Failed to check permission";
        state.allowed = false;
      });
  },
});

export const { clearError, clearSession, setCurrentSession } = sessionSlice.actions;
export default sessionSlice.reducer;
