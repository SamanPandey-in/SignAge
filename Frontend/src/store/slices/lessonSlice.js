/**
 * Lesson Redux Slice
 * Manages lesson data and state
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { lessonApi } from '@api/lessonApi';

// Async thunks
export const fetchLessons = createAsyncThunk(
  'lessons/fetchLessons',
  async (_, { rejectWithValue }) => {
    try {
      const result = await lessonApi.getAllLessons();
      if (result.success) {
        return result.data;
      }
      return rejectWithValue(result.error);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchLessonById = createAsyncThunk(
  'lessons/fetchLessonById',
  async (lessonId, { rejectWithValue }) => {
    try {
      const result = await lessonApi.getLessonById(lessonId);
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
  lessons: [],
  currentLesson: null,
  completedLessons: [],
  isLoading: false,
  error: null,
};

const lessonSlice = createSlice({
  name: 'lessons',
  initialState,
  reducers: {
    setCompletedLessons: (state, action) => {
      state.completedLessons = action.payload;
    },
    addCompletedLesson: (state, action) => {
      if (!state.completedLessons.includes(action.payload)) {
        state.completedLessons.push(action.payload);
      }
    },
    setCurrentLesson: (state, action) => {
      state.currentLesson = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch lessons
      .addCase(fetchLessons.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLessons.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lessons = action.payload;
      })
      .addCase(fetchLessons.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch lesson by ID
      .addCase(fetchLessonById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLessonById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentLesson = action.payload;
      })
      .addCase(fetchLessonById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setCompletedLessons, addCompletedLesson, setCurrentLesson, clearError } = lessonSlice.actions;

// Selectors
export const selectLessons = (state) => state.lessons.lessons;
export const selectCurrentLesson = (state) => state.lessons.currentLesson;
export const selectCompletedLessons = (state) => state.lessons.completedLessons;
export const selectLessonsLoading = (state) => state.lessons.isLoading;
export const selectLessonsError = (state) => state.lessons.error;

export default lessonSlice.reducer;
