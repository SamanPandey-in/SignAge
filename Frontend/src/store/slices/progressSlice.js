/**
 * Progress Redux Slice
 * Manages user progress and statistics
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { progressApi } from '@api/progressApi';
import { streakApi } from '@api/streakApi';

// Async thunks
export const fetchProgress = createAsyncThunk(
  'progress/fetchProgress',
  async (_, { rejectWithValue }) => {
    try {
      const result = await progressApi.getProgress();
      if (result.success) {
        return result.data;
      }
      return rejectWithValue(result.error);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateProgress = createAsyncThunk(
  'progress/updateProgress',
  async (progressData, { rejectWithValue }) => {
    try {
      const result = await progressApi.updateProgress(progressData);
      if (result.success) {
        return result.data;
      }
      return rejectWithValue(result.error);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchStreak = createAsyncThunk(
  'progress/fetchStreak',
  async (_, { rejectWithValue }) => {
    try {
      const result = await streakApi.getStreak();
      if (result.success) {
        return result.data;
      }
      return rejectWithValue(result.error);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  streak: 0,
  todayProgress: 0,
  totalLessonsCompleted: 0,
  totalPracticeTime: 0,
  starsEarned: 0,
  isLoading: false,
  error: null,
};

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    setTodayProgress: (state, action) => {
      state.todayProgress = action.payload;
    },
    incrementStreak: (state) => {
      state.streak += 1;
    },
    resetStreak: (state) => {
      state.streak = 0;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProgress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProgress.fulfilled, (state, action) => {
        state.isLoading = false;
        Object.assign(state, action.payload);
      })
      .addCase(fetchProgress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateProgress.fulfilled, (state, action) => {
        Object.assign(state, action.payload);
      })
      .addCase(fetchStreak.fulfilled, (state, action) => {
        state.streak = action.payload.streak || 0;
      });
  },
});

export const { setTodayProgress, incrementStreak, resetStreak, clearError } = progressSlice.actions;

// Selectors
export const selectStreak = (state) => state.progress.streak;
export const selectTodayProgress = (state) => state.progress.todayProgress;
export const selectTotalLessonsCompleted = (state) => state.progress.totalLessonsCompleted;
export const selectTotalPracticeTime = (state) => state.progress.totalPracticeTime;
export const selectStarsEarned = (state) => state.progress.starsEarned;
export const selectProgressLoading = (state) => state.progress.isLoading;
export const selectProgressError = (state) => state.progress.error;

export default progressSlice.reducer;
