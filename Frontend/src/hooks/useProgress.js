/**
 * useProgress Hook
 * Provides progress-related functionality and state
 */

import { useDispatch, useSelector } from 'react-redux';
import {
  fetchProgress,
  updateProgress as updateProgressAction,
  fetchStreak,
  selectStreak,
  selectTodayProgress,
  selectTotalLessonsCompleted,
  selectTotalPracticeTime,
  selectStarsEarned,
  selectProgressLoading,
} from '@store/slices/progressSlice';

export const useProgress = () => {
  const dispatch = useDispatch();
  const streak = useSelector(selectStreak);
  const todayProgress = useSelector(selectTodayProgress);
  const totalLessonsCompleted = useSelector(selectTotalLessonsCompleted);
  const totalPracticeTime = useSelector(selectTotalPracticeTime);
  const starsEarned = useSelector(selectStarsEarned);
  const isLoading = useSelector(selectProgressLoading);

  const loadProgress = () => {
    dispatch(fetchProgress());
  };

  const loadStreak = () => {
    dispatch(fetchStreak());
  };

  const updateProgress = (progressData) => {
    dispatch(updateProgressAction(progressData));
  };

  return {
    streak,
    todayProgress,
    totalLessonsCompleted,
    totalPracticeTime,
    starsEarned,
    isLoading,
    loadProgress,
    loadStreak,
    updateProgress,
  };
};
