/**
 * User Data Redux Slice
 * Consolidates all user-related data: profile, stats, progress
 * Single source of truth for user information
 * Phase 3: Using cachedAPIService for automatic caching
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import cachedAPIService from '@services/cachedAPIService';
import { auth } from '@services/firebase';

/**
 * Async thunk to fetch complete user profile including stats and progress
 * Phase 3: Now uses cachedAPIService for automatic caching
 */
export const fetchUserProfile = createAsyncThunk(
  'userData/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }

      // Fetch all user data in parallel using Phase 3 cachedAPIService
      // Automatic caching, deduplication, and retry logic applied
      const [progressResult, streakResult, lessonsResult] = await Promise.all([
        cachedAPIService.getProgress(),
        cachedAPIService.getStreak(),
        cachedAPIService.getAllLessons(),
      ]);

      if (!progressResult.success) {
        throw new Error('Failed to fetch user profile');
      }

      return {
        profile: { email: auth.currentUser.email, displayName: auth.currentUser.displayName || 'User' },
        stats: { ...progressResult.data, streak: streakResult.data?.streak || 0 },
        completedLessons: lessonsResult.data?.filter(l => l.completed) || [],
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Async thunk to update user progress
 * Phase 3: Uses cachedAPIService which auto-invalidates related caches
 */
export const updateUserProgress = createAsyncThunk(
  'userData/updateUserProgress',
  async (progressData, { rejectWithValue }) => {
    try {
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }

      // Use Phase 3 cachedAPIService - automatic cache invalidation on update
      const result = await cachedAPIService.updateProgress(progressData);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update progress');
      }

      return result.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Async thunk to mark lesson as completed
 * Phase 3: Automatic cache invalidation after mutation
 */
export const markLessonCompleted = createAsyncThunk(
  'userData/markLessonCompleted',
  async ({ lessonId, score }, { rejectWithValue }) => {
    try {
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }

      // Use Phase 3 cachedAPIService - auto-invalidates all_lessons and progress caches
      const result = await cachedAPIService.completeLesson(lessonId, score);

      if (!result.success) {
        throw new Error(result.error || 'Failed to mark lesson as completed');
      }

      return { lessonId, score };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  profile: {
    userId: null,
    email: '',
    displayName: 'User',
    photoURL: null,
    createdAt: null,
  },
  stats: {
    lessonsCompleted: 0,
    streak: 0,
    longestStreak: 0,
    totalStars: 0,
    totalScore: 0,
    totalPracticeTime: 0,
    signsLearned: 0,
    practiceSessionsCount: 0,
    averageAccuracy: 0,
    bestAccuracy: 0,
    todayProgress: 0,
  },
  completedLessons: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

const userDataSlice = createSlice({
  name: 'userData',
  initialState,
  reducers: {
    /**
     * Reset user data on logout
     */
    resetUserData: (state) => {
      return initialState;
    },
    /**
     * Update today's progress locally
     */
    updateTodayProgress: (state, action) => {
      state.stats.todayProgress = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    /**
     * Add lesson to completed lessons list
     */
    addCompletedLesson: (state, action) => {
      if (!state.completedLessons.includes(action.payload)) {
        state.completedLessons.push(action.payload);
        state.stats.lessonsCompleted += 1;
        state.lastUpdated = new Date().toISOString();
      }
    },
    /**
     * Update streak locally
     */
    updateStreak: (state, action) => {
      state.stats.streak = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
  },
  extraReducers: (builder) => {
    // Fetch User Profile
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.profile;
        state.stats = {
          ...state.stats,
          ...action.payload.stats,
        };
        state.completedLessons = action.payload.completedLessons;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update User Progress
    builder
      .addCase(updateUserProgress.pending, (state) => {
        state.error = null;
      })
      .addCase(updateUserProgress.fulfilled, (state, action) => {
        Object.assign(state.stats, action.payload);
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateUserProgress.rejected, (state, action) => {
        state.error = action.payload;
      });

    // Mark Lesson Completed
    builder
      .addCase(markLessonCompleted.pending, (state) => {
        state.error = null;
      })
      .addCase(markLessonCompleted.fulfilled, (state, action) => {
        const { lessonId, stars, signsLearned } = action.payload;
        
        if (!state.completedLessons.includes(lessonId)) {
          state.completedLessons.push(lessonId);
        }
        
        state.stats.lessonsCompleted += 1;
        state.stats.totalStars += stars;
        state.stats.signsLearned += signsLearned;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(markLessonCompleted.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

// Actions
export const { resetUserData, updateTodayProgress, addCompletedLesson, updateStreak } = userDataSlice.actions;

// Selectors
export const selectUserProfile = (state) => state.userData.profile;
export const selectUserStats = (state) => state.userData.stats;
export const selectCompletedLessons = (state) => state.userData.completedLessons;
export const selectUserDataLoading = (state) => state.userData.loading;
export const selectUserDataError = (state) => state.userData.error;
export const selectStreak = (state) => state.userData.stats.streak;
export const selectTodayProgress = (state) => state.userData.stats.todayProgress;
export const selectLessonsCompleted = (state) => state.userData.stats.lessonsCompleted;
export const selectTotalPracticeTime = (state) => state.userData.stats.totalPracticeTime;
export const selectStarsEarned = (state) => state.userData.stats.totalStars;
export const selectLessonCompleted = (lessonId) => (state) =>
  state.userData.completedLessons.includes(lessonId);

export default userDataSlice.reducer;
