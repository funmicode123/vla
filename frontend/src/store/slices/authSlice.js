import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";

const getStoredData = () => {
  if (typeof window === 'undefined') {
    return { user: null, token: null };
  }
  
  try {
    const storedUserStr = localStorage.getItem('streamUser');
    const storedUser = storedUserStr && storedUserStr !== 'undefined' ? JSON.parse(storedUserStr) : null;
    const storedToken = localStorage.getItem('authToken');
    return { user: storedUser, token: storedToken };
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return { user: null, token: null };
  }
};

const authSlice = createSlice({
  name: "auth",
  initialState: () => {
    const { user: storedUser, token: storedToken } = getStoredData();
    return {
      user: storedUser,
      token: storedToken || null,
      loading: false,
      error: null,
      activeSession: null,
    };
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userId");
        localStorage.removeItem("streamUserEmail");
        localStorage.removeItem("streamUserId");
        localStorage.removeItem("streamUser");
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signupThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(googleAuthThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })

      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addMatcher(
        (action) =>
          [signupThunk.pending.type, googleAuthThunk.pending.type].includes(
            action.type
          ),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          [signupThunk.rejected.type, googleAuthThunk.rejected.type].includes(
            action.type
          ),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

const signupThunk = createAsyncThunk(
  "auth/signup",
  async (formData, thunkAPI) => {
    try {
      const response = await axiosInstance.post("/signup", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const { token, user } = response.data;

      if (typeof window !== 'undefined') {
        if (user?.id) localStorage.setItem("userId", user.id);
        localStorage.setItem("authToken", token);
        localStorage.setItem('streamUserEmail', JSON.stringify(user.email));
        localStorage.setItem('streamUserId', JSON.stringify(user.id));
      }

      return { user, token };
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Signup failed"
      );
    }
  }
);

const loginThunk = createAsyncThunk(
  "auth/login",
  async (formData, thunkAPI) => {
    try {
      const response = await axiosInstance.post("/login", formData);
      const { token, user } = response.data;

      if (typeof window !== 'undefined') {
        if (user?.id) localStorage.setItem("userId", user.id);
        localStorage.setItem("authToken", token);
        localStorage.setItem('streamUserEmail', JSON.stringify(user.email));
        localStorage.setItem('streamUserId', JSON.stringify(user.id));
      }

      return { user, token };
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Login failed"
      );
    }
  }
);

const googleAuthThunk = createAsyncThunk(
  "auth/googleAuth",
  async (googleToken, thunkAPI) => {
    try {
      const response = await axiosInstance.post("/auth/google", { 
        token: googleToken 
      });
      const { token, user } = response.data;

      if (typeof window !== 'undefined') {
        localStorage.setItem("authToken", token);
        if (user?.id) {
          localStorage.setItem("userId", user.id);
          localStorage.setItem('streamUserEmail', JSON.stringify(user.email));
          localStorage.setItem('streamUserId', JSON.stringify(user.id));
        }
      }

      return { user, token };
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Google auth failed"
      );
    }
  }
);

export const { logout } = authSlice.actions;
export { signupThunk, googleAuthThunk, loginThunk, authSlice };
export default authSlice.reducer;
