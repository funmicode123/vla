import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchUserSessionsThunk = createAsyncThunk(
  'sessions/fetchUserSessions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/sessions/my-sessions');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch sessions');
    }
  }
);

export const fetchAllSessionsThunk = createAsyncThunk(
  'sessions/fetchAllSessions',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams(filters);
      const response = await api.get(`/sessions?${params}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch sessions');
    }
  }
);

export const createSessionThunk = createAsyncThunk(
  'sessions/createSession',
  async (sessionData, { rejectWithValue }) => {
    try {
      const response = await api.post('/sessions', sessionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create session');
    }
  }
);

export const updateSessionThunk = createAsyncThunk(
  'sessions/updateSession',
  async ({ sessionId, sessionData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/sessions/${sessionId}`, sessionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update session');
    }
  }
);

export const deleteSessionThunk = createAsyncThunk(
  'sessions/deleteSession',
  async (sessionId, { rejectWithValue }) => {
    try {
      await api.delete(`/sessions/${sessionId}`);
      return sessionId;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete session');
    }
  }
);

const sessionTemplates = {
  lecture: {
    name: 'Lecture',
    description: 'Traditional lecture format with presentation and Q&A',
    settings: {
      allowScreenShare: true,
      allowChat: true,
      attentionTracking: true,
      recording: true
    }
  },
  discussion: {
    name: 'Discussion',
    description: 'Interactive group discussion with breakout rooms',
    settings: {
      allowScreenShare: true,
      allowChat: true,
      attentionTracking: true,
      recording: false,
      breakoutRooms: true
    }
  },
  workshop: {
    name: 'Workshop',
    description: 'Hands-on workshop with collaborative activities',
    settings: {
      allowScreenShare: true,
      allowChat: true,
      attentionTracking: true,
      recording: true,
      fileSharing: true
    }
  }
};

const sessionsSlice = createSlice({
  name: 'sessions',
  initialState: {
    userSessions: [],
    allSessions: [],
    sessionTemplates,
    selectedSession: null,
    loading: false,
    error: null,
    filters: {
      status: 'all', // upcoming, active, completed
      type: 'all',
      dateRange: null
    }
  },
  reducers: {
    setSelectedSession: (state, action) => {
      state.selectedSession = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        status: 'all',
        type: 'all',
        dateRange: null
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch user sessions
      .addCase(fetchUserSessionsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserSessionsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.userSessions = action.payload.data || [];
      })
      .addCase(fetchUserSessionsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch all sessions
      .addCase(fetchAllSessionsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllSessionsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.allSessions = action.payload.data || [];
      })
      .addCase(fetchAllSessionsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create session
      .addCase(createSessionThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSessionThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.userSessions.unshift(action.payload.data);
        state.selectedSession = action.payload.data;
      })
      .addCase(createSessionThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update session
      .addCase(updateSessionThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSessionThunk.fulfilled, (state, action) => {
        state.loading = false;
        const updatedSession = action.payload.data;
        const index = state.userSessions.findIndex(s => s.id === updatedSession.id);
        if (index !== -1) {
          state.userSessions[index] = updatedSession;
        }
        if (state.selectedSession?.id === updatedSession.id) {
          state.selectedSession = updatedSession;
        }
      })
      .addCase(updateSessionThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete session
      .addCase(deleteSessionThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSessionThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.userSessions = state.userSessions.filter(s => s.id !== action.payload);
        if (state.selectedSession?.id === action.payload) {
          state.selectedSession = null;
        }
      })
      .addCase(deleteSessionThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { 
  setSelectedSession, 
  clearError, 
  setFilters, 
  clearFilters 
} = sessionsSlice.actions;

export default sessionsSlice.reducer; 