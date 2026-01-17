/**
 * Lesson Detail Page
 * Displays detailed information about a specific lesson with interactive features
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLessons } from '@hooks/useLessons';
import { useAuth } from '@hooks/useAuth';
import { ROUTES, generatePath } from '@constants/routes';
import { getLessonById } from '@constants/lessons';
import {
  IoCheckmarkCircle,
  IoPlayCircle,
  IoTimeOutline,
  IoBarChartOutline,
  IoTrophyOutline,
  IoArrowBack,
  IoBookmark,
  IoBookmarkOutline,
  IoShareSocialOutline,
} from 'react-icons/io5';
import Button from '@components/common/Button';
import Card from '@components/common/Card';
import LoadingSpinner from '@components/common/LoadingSpinner';

const LessonDetail = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isLessonCompleted } = useLessons();
  
  const [lesson, setLesson] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLessonData();
  }, [lessonId]);

  const loadLessonData = async () => {
    setLoading(true);
    try {
      const lessonData = getLessonById(lessonId);
      if (lessonData) {
        setLesson(lessonData);
        const bookmarked = localStorage.getItem(`bookmark_${lessonId}`) === 'true';
        setIsBookmarked(bookmarked);
      }
    } catch (error) {
      console.error('Error loading lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartLesson = () => {
    navigate(generatePath(ROUTES.LESSON_CONTENT, { lessonId }));
  };

  const handleToggleBookmark = () => {
    const newBookmarkState = !isBookmarked;
    setIsBookmarked(newBookmarkState);
    localStorage.setItem(`bookmark_${lessonId}`, newBookmarkState.toString());
  };

  const handleShare = () => {
    setShowShareMenu(!showShareMenu);
  };

  const shareLesson = async () => {
    const shareUrl = window.location.href;
    const shareText = `Check out this sign language lesson: ${lesson?.title}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: lesson?.title,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
    setShowShareMenu(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Lesson Not Found</h1>
        <p className="text-gray-600 mb-6">The lesson you're looking for doesn't exist.</p>
        <Button onClick={() => navigate(ROUTES.LEARN)}>Back to Lessons</Button>
      </div>
    );
  }

  const isCompleted = isLessonCompleted(lessonId);
  const difficultyColor = {
    Beginner: 'bg-success-100 text-success-700',
    Intermediate: 'bg-warning-100 text-warning-700',
    Advanced: 'bg-danger-100 text-danger-700',
  }[lesson.difficulty] || 'bg-gray-100 text-gray-700';

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <button
        onClick={() => navigate(ROUTES.LEARN)}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <IoArrowBack className="text-xl" />
        <span className="font-medium">Back to Lessons</span>
      </button>

      <Card padding="large" className="mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${difficultyColor}`}>
                {lesson.difficulty}
              </span>
              {isCompleted && (
                <div className="flex items-center space-x-1 text-success-500">
                  <IoCheckmarkCircle className="text-xl" />
                  <span className="text-sm font-medium">Completed</span>
                </div>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
            <p className="text-lg text-gray-600">{lesson.description}</p>
          </div>

          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={handleToggleBookmark}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              {isBookmarked ? (
                <IoBookmark className="text-xl text-primary-500" />
              ) : (
                <IoBookmarkOutline className="text-xl text-gray-400" />
              )}
            </button>
            
            <div className="relative">
              <button
                onClick={handleShare}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <IoShareSocialOutline className="text-xl text-gray-400" />
              </button>
              
              {showShareMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-large border border-gray-200 py-2 z-10">
                  <button
                    onClick={shareLesson}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                  >
                    Share Link
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <IoTimeOutline className="text-xl text-primary-500" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Duration</div>
              <div className="font-semibold text-gray-900">{lesson.duration}</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
              <IoBarChartOutline className="text-xl text-success-500" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Signs</div>
              <div className="font-semibold text-gray-900">{lesson.signs?.length || 0} signs</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
              <IoTrophyOutline className="text-xl text-warning-500" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Level</div>
              <div className="font-semibold text-gray-900">{lesson.difficulty}</div>
            </div>
          </div>
        </div>

        <Button
          onClick={handleStartLesson}
          size="large"
          fullWidth
          className="group"
        >
          <IoPlayCircle className="text-xl mr-2 group-hover:scale-110 transition-transform" />
          {isCompleted ? 'Practice Again' : 'Start Lesson'}
        </Button>
      </Card>

      <Card padding="large" className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">What You'll Learn</h2>
        <div className="space-y-3">
          {lesson.signs?.map((sign, index) => (
            <div
              key={sign.id}
              className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-primary-500 text-white rounded-lg flex items-center justify-center font-semibold flex-shrink-0">
                {index + 1}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{sign.word}</h3>
                <p className="text-sm text-gray-600">{sign.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card padding="large">
        <h2 className="text-xl font-bold text-gray-900 mb-4">How to Practice</h2>
        <ol className="space-y-3">
          <li className="flex items-start space-x-3">
            <span className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
              1
            </span>
            <p className="text-gray-700">Watch the demonstration video carefully</p>
          </li>
          <li className="flex items-start space-x-3">
            <span className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
              2
            </span>
            <p className="text-gray-700">Follow the step-by-step instructions</p>
          </li>
          <li className="flex items-start space-x-3">
            <span className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
              3
            </span>
            <p className="text-gray-700">Practice in front of your camera for AI feedback</p>
          </li>
          <li className="flex items-start space-x-3">
            <span className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
              4
            </span>
            <p className="text-gray-700">Repeat until you master each sign</p>
          </li>
        </ol>
      </Card>
    </div>
  );
};

export default LessonDetail;
