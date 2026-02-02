/**
 * User Data Redux Slice
 * Consolidates all user-related data: profile, stats, progress
 * Single source of truth for user information
 * Phase 3: Using cachedAPIService for automatic caching
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { auth, DatabaseService } from '@services/firebase';
import { logout } from './authSlice';



/**
 * Async thunk to fetch complete user profile including stats and progress
 */
export const fetchUserProfile = createAsyncThunk(
  'userData/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      if (!auth.currentUser) {
        return rejectWithValue('User not authenticated');
      }

      const uid = auth.currentUser.uid;

      // Call Firebase directly
      const [statsResult, lessonsResult] = await Promise.all([
        DatabaseService.getUserStats(uid),
        DatabaseService.getCompletedLessons(uid)
      ]);

      if (!statsResult.success) {
        return rejectWithValue(statsResult.error || 'Failed to fetch stats');
      }

      return {
        profile: {
          email: auth.currentUser?.email || '',
          displayName: auth.currentUser?.displayName || 'User',
          userId: uid
        },
        stats: statsResult.stats,
        completedLessons: lessonsResult.success ? lessonsResult.lessons : [],
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch profile');
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

      // Use DatabaseService
      const result = await DatabaseService.updateProgress(auth.currentUser.uid, progressData);

      if (!result.success) {
        throw new Error(result.error || 'Failed to update progress');
      }

      return progressData;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Async thunk to mark lesson as completed
 * Phase 3: Automatic cache invalidation after mutation + progress refresh
 */
export const markLessonCompleted = createAsyncThunk(
  'userData/markLessonCompleted',
  async ({ lessonId, score, stars = 0, signsLearned = 0 }, { rejectWithValue }) => {
    try {
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }

      const uid = auth.currentUser.uid;

      // Use DatabaseService
      const result = await DatabaseService.markLessonCompleted(uid, lessonId, score, stars, signsLearned);

      if (!result.success) {
        throw new Error(result.error || 'Failed to mark lesson as completed');
      }

      // Fetch updated user stats from Firebase to ensure UI is in sync
      const statsResult = await DatabaseService.getUserStats(uid);

      return {
        lessonId,
        score,
        stars,
        signsLearned,
        progressData: statsResult.success ? statsResult.stats : null
      };
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
        const { lessonId, stars, signsLearned, progressData } = action.payload;

        // If we fetched updated progress from backend, use that entirely
        if (progressData) {
          state.stats = { ...state.stats, ...progressData };
          state.completedLessons = progressData.completedLessons || state.completedLessons;
        } else {
          // Fallback to local update if progress fetch failed
          if (!state.completedLessons.includes(lessonId)) {
            state.completedLessons.push(lessonId);
          }
          state.stats.lessonsCompleted += 1;
          state.stats.totalStars += stars;
          state.stats.signsLearned += signsLearned;
        }

        state.lastUpdated = new Date().toISOString();
      })
      .addCase(markLessonCompleted.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(logout, (state) => {
        return initialState;
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
