/**
 * Lesson Content Page
 * Interactive lesson learning interface with step-by-step sign practice
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLessons } from '@hooks/useLessons';
import { useProgress } from '@hooks/useProgress';
import { getLessonById } from '@constants/lessons';
import { ROUTES } from '@constants/routes';
import {
  IoArrowBack,
  IoArrowForward,
  IoCheckmarkCircle,
  IoPlay,
  IoRefresh,
  IoClose,
} from 'react-icons/io5';
import Button from '@components/common/Button';
import Card from '@components/common/Card';
import ProgressBar from '@components/common/ProgressBar';
import LoadingSpinner from '@components/common/LoadingSpinner';

const LessonContent = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { addCompletedLesson } = useLessons();
  const { updateProgress } = useProgress();

  const [lesson, setLesson] = useState(null);
  const [currentSignIndex, setCurrentSignIndex] = useState(0);
  const [completedSigns, setCompletedSigns] = useState(new Set());
  const [showInstructions, setShowInstructions] = useState(true);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLesson();
  }, [lessonId]);

  const loadLesson = () => {
    setLoading(true);
    const lessonData = getLessonById(lessonId);
    if (lessonData) {
      setLesson(lessonData);
    }
    setLoading(false);
  };

  const currentSign = lesson?.signs?.[currentSignIndex];
  const progress = lesson?.signs?.length 
    ? ((completedSigns.size / lesson.signs.length) * 100)
    : 0;

  const handleMarkComplete = () => {
    if (!currentSign) return;
    
    setCompletedSigns(prev => new Set([...prev, currentSign.id]));
    
    // Check if this was the last sign
    if (currentSignIndex === lesson.signs.length - 1) {
      handleLessonComplete();
    } else {
      handleNext();
    }
  };

  const handleNext = () => {
    if (currentSignIndex < lesson.signs.length - 1) {
      setCurrentSignIndex(prev => prev + 1);
      setShowInstructions(true);
    }
  };

  const handlePrevious = () => {
    if (currentSignIndex > 0) {
      setCurrentSignIndex(prev => prev - 1);
      setShowInstructions(true);
    }
  };

  const handleLessonComplete = () => {
    // Mark lesson as completed
    addCompletedLesson(lessonId);
    
    // Update progress
    updateProgress({
      lessonId,
      completedAt: new Date().toISOString(),
      score: 100,
    });
    
    setShowCompletionModal(true);
  };

  const handleReturnToLessons = () => {
    navigate(ROUTES.LEARN);
  };

  const handlePracticeAgain = () => {
    setCurrentSignIndex(0);
    setCompletedSigns(new Set());
    setShowCompletionModal(false);
    setShowInstructions(true);
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
        <Button onClick={() => navigate(ROUTES.LEARN)}>Back to Lessons</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <IoArrowBack className="text-xl" />
          <span className="font-medium">Back</span>
        </button>
        
        <div className="text-center flex-1 mx-4">
          <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
          <p className="text-sm text-gray-600 mt-1">
            Sign {currentSignIndex + 1} of {lesson.signs.length}
          </p>
        </div>
        
        <div className="w-20"></div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <ProgressBar value={progress} max={100} showLabel={true} />
      </div>

      {/* Main Content */}
      <Card padding="large" className="mb-6">
        {/* Sign Title */}
        <div className="text-center mb-6">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            {currentSign?.word}
          </h2>
          <p className="text-lg text-gray-600">{currentSign?.description}</p>
        </div>

        {/* Video/Image Placeholder */}
        <div className="bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl aspect-video mb-6 flex items-center justify-center">
          <div className="text-center">
            <IoPlay className="text-6xl text-primary-500 mx-auto mb-4" />
            <p className="text-gray-700 font-medium">
              Video demonstration will appear here
            </p>
            <p className="text-sm text-gray-600 mt-2">
              {currentSign?.videoUrl || 'Video coming soon'}
            </p>
          </div>
        </div>

        {/* Instructions Toggle */}
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="w-full mb-4 p-4 bg-primary-50 rounded-xl text-left hover:bg-primary-100 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-primary-700">
              {showInstructions ? 'Hide' : 'Show'} Step-by-Step Instructions
            </span>
            <span className="text-primary-500 text-xl">
              {showInstructions ? '−' : '+'}
            </span>
          </div>
        </button>

        {/* Instructions */}
        {showInstructions && (
          <div className="space-y-3 mb-6 animate-fade-in">
            {currentSign?.instructions?.map((instruction, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl"
              >
                <span className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  {index + 1}
                </span>
                <p className="text-gray-700 flex-1">{instruction}</p>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentSignIndex === 0}
            className="flex-1"
          >
            <IoArrowBack className="mr-2" />
            Previous
          </Button>

          <Button
            variant="success"
            onClick={handleMarkComplete}
            className="flex-1"
          >
            {completedSigns.has(currentSign?.id) ? (
              <>
                <IoCheckmarkCircle className="mr-2" />
                Completed
              </>
            ) : (
              <>
                <IoCheckmarkCircle className="mr-2" />
                Mark Complete
              </>
            )}
          </Button>

          <Button
            onClick={handleNext}
            disabled={currentSignIndex === lesson.signs.length - 1}
            className="flex-1"
          >
            Next
            <IoArrowForward className="ml-2" />
          </Button>
        </div>
      </Card>

      {/* Practice Tip */}
      <Card padding="medium" className="bg-gradient-to-r from-warning-50 to-warning-100">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-warning-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <IoRefresh className="text-xl text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Practice Tip</h3>
            <p className="text-sm text-gray-700">
              Repeat each sign 5-10 times to build muscle memory. Focus on hand position and movement speed.
            </p>
          </div>
        </div>
      </Card>

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <Card padding="large" className="max-w-md w-full relative">
            <button
              onClick={() => setShowCompletionModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <IoClose className="text-2xl" />
            </button>

            <div className="text-center">
              <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <IoCheckmarkCircle className="text-5xl text-success-500" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Lesson Complete!
              </h2>
              <p className="text-gray-600 mb-6">
                Great job! You've completed "{lesson.title}". Keep practicing to master these signs.
              </p>

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="text-3xl font-bold text-primary-500 mb-1">
                  {lesson.signs.length}
                </div>
                <div className="text-sm text-gray-600">Signs Learned</div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleReturnToLessons}
                  variant="primary"
                  fullWidth
                >
                  Return to Lessons
                </Button>
                <Button
                  onClick={handlePracticeAgain}
                  variant="outline"
                  fullWidth
                >
                  <IoRefresh className="mr-2" />
                  Practice Again
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default LessonContent;
