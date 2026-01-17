/**
 * useLessons Hook
 * Provides lesson-related functionality and state
 */

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchLessons,
  fetchLessonById,
  selectLessons,
  selectCurrentLesson,
  selectCompletedLessons,
  selectLessonsLoading,
  selectLessonsError,
} from '@store/slices/lessonSlice';

export const useLessons = () => {
  const dispatch = useDispatch();
  const lessons = useSelector(selectLessons);
  const currentLesson = useSelector(selectCurrentLesson);
  const completedLessons = useSelector(selectCompletedLessons);
  const isLoading = useSelector(selectLessonsLoading);
  const error = useSelector(selectLessonsError);

  const loadLessons = () => {
    dispatch(fetchLessons());
  };

  const loadLessonById = (lessonId) => {
    dispatch(fetchLessonById(lessonId));
  };

  const isLessonCompleted = (lessonId) => {
    return completedLessons.includes(lessonId);
  };

  return {
    lessons,
    currentLesson,
    completedLessons,
    isLoading,
    error,
    loadLessons,
    loadLessonById,
    isLessonCompleted,
  };
};
