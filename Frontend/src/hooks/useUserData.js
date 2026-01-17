/**
 * useUserData Hook
 * Provides convenient access to consolidated user data from Redux
 * Phase 2 Integrated: Async thunks now use unified apiService
 * Single source of truth for all user-related information
 */

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '@hooks/useAuth';
import {
  fetchUserProfile,
  markLessonCompleted,
  updateUserProgress,
  selectUserProfile,
  selectUserStats,
  selectCompletedLessons,
  selectUserDataLoading,
  selectUserDataError,
  selectStreak,
  selectTodayProgress,
  selectLessonsCompleted,
  selectTotalPracticeTime,
  selectStarsEarned,
  selectLessonCompleted,
  addCompletedLesson,
  updateTodayProgress,
  updateStreak,
} from '@store/slices/userDataSlice';
import { useNotification } from '@hooks/useNotification';

export const useUserData = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useAuth();
  const { error: notificationError } = useNotification();

  // Redux selectors
  const profile = useSelector(selectUserProfile);
  const stats = useSelector(selectUserStats);
  const completedLessons = useSelector(selectCompletedLessons);
  const isLoading = useSelector(selectUserDataLoading);
  const error = useSelector(selectUserDataError);
  const streak = useSelector(selectStreak);
  const todayProgress = useSelector(selectTodayProgress);
  const lessonsCompleted = useSelector(selectLessonsCompleted);
  const totalPracticeTime = useSelector(selectTotalPracticeTime);
  const starsEarned = useSelector(selectStarsEarned);

  // Load user data on mount or when user changes
  // Async thunks (fetchUserProfile, etc.) now use Phase 2 apiService internally
  useEffect(() => {
    if (isAuthenticated && user?.uid) {
      dispatch(fetchUserProfile());
    }
  }, [isAuthenticated, user?.uid, dispatch]);

  /**
   * Check if a specific lesson is completed
   */
  const isLessonCompleted = (lessonId) => completedLessons.includes(lessonId);

  /**
   * Mark a lesson as completed
   */
  const completeLesson = async (lessonId, score = 100, stars = 3, signsLearned = 0) => {
    try {
      const result = await dispatch(
        markLessonCompleted({ lessonId, score, stars, signsLearned })
      ).unwrap();
      return { success: true, data: result };
    } catch (err) {
      notificationError(err);
      return { success: false, error: err };
    }
  };

  /**
   * Update user progress
   */
  const updateProgress = async (progressData) => {
    try {
      const result = await dispatch(updateUserProgress(progressData)).unwrap();
      return { success: true, data: result };
    } catch (err) {
      notificationError(err);
      return { success: false, error: err };
    }
  };

  /**
   * Update today's progress locally (without API call)
   */
  const setTodayProgress = (progress) => {
    dispatch(updateTodayProgress(progress));
  };

  /**
   * Update streak locally (without API call)
   */
  const setStreak = (newStreak) => {
    dispatch(updateStreak(newStreak));
  };

  /**
   * Add completed lesson locally (without API call)
   */
  const addLesson = (lessonId) => {
    dispatch(addCompletedLesson(lessonId));
  };

  return {
    // User Profile
    profile,
    user: profile,

    // Statistics
    stats,
    streak,
    todayProgress,
    lessonsCompleted,
    totalPracticeTime,
    starsEarned,

    // Lessons
    completedLessons,
    isLessonCompleted,

    // State
    isLoading,
    error,

    // Actions
    completeLesson,
    updateProgress,
    setTodayProgress,
    setStreak,
    addLesson,
  };
};
