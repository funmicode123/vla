import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import sessionReducer from './slices/sessionSlice';

// Safe localStorage utility for SSR compatibility
const getStoredToken = () => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('authToken');
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
};

function parseJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    return { id: payload.id };
  } catch (e) {
    return null;
  }
}

const token = getStoredToken();

const initialState = {
  auth: {
    token,
    user: token ? parseJwt(token) : null,
    loading: false,
    error: null,
  },
};

const store = configureStore({
  reducer: {
    auth: authReducer,
    session: sessionReducer,
  },
  preloadedState: initialState,
});

export default store;
