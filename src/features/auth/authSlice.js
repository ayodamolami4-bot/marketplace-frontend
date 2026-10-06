import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiRequest } from "../../services/api";

const savedToken = localStorage.getItem("marketplace_token");
const savedUser = localStorage.getItem("marketplace_user");

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      return await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const signupUser = createAsyncThunk(
  "auth/signup",
  async (payload, { rejectWithValue }) => {
    try {
      return await apiRequest("/auth/signup", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const loadCurrentUser = createAsyncThunk(
  "auth/me",
  async (_, { rejectWithValue }) => {
    try {
      return await apiRequest("/auth/me");
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  token: savedToken || null,
  user: savedUser ? JSON.parse(savedUser) : null,
  status: "idle",
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      state.status = "idle";
      state.error = null;
      localStorage.removeItem("marketplace_token");
      localStorage.removeItem("marketplace_user");
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem("marketplace_token", action.payload.token);
        localStorage.setItem(
          "marketplace_user",
          JSON.stringify(action.payload.user)
        );
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Login failed";
      })
      .addCase(signupUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem("marketplace_token", action.payload.token);
        localStorage.setItem(
          "marketplace_user",
          JSON.stringify(action.payload.user)
        );
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Signup failed";
      })
      .addCase(loadCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        localStorage.setItem(
          "marketplace_user",
          JSON.stringify(action.payload)
        );
      })
      .addCase(loadCurrentUser.rejected, (state) => {
        state.token = null;
        state.user = null;
        localStorage.removeItem("marketplace_token");
        localStorage.removeItem("marketplace_user");
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
