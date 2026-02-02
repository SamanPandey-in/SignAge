/**
 * Lesson Card Component
 * Reusable card for displaying lesson information
 */

import { IoCheckmarkCircle, IoTimeOutline, IoChevronForward, IoLockClosed } from 'react-icons/io5';
import { getDifficultyColor } from '@utils/helpers';

const LessonCard = ({
  lesson,
  isCompleted = false,
  isLocked = false,
  onClick,
  showProgress = false,
  progress = 0,
}) => {
  const difficultyColor = {
    Beginner: 'bg-success-100 text-success-700 border-success-300',
    Intermediate: 'bg-warning-100 text-warning-700 border-warning-300',
    Advanced: 'bg-danger-100 text-danger-700 border-danger-300',
  }[lesson.difficulty] || 'bg-gray-100 text-gray-700 border-gray-300';

  return (
    <div
      onClick={isLocked ? undefined : onClick}
      className={`bg-white rounded-xl p-6 shadow-soft hover:shadow-medium transition-all group ${
        isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      <div className="flex items-start space-x-4">
        {/* Icon/Badge */}
        <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
          isLocked 
            ? 'bg-gray-100' 
            : isCompleted 
            ? 'bg-success-100' 
            : 'bg-primary-100'
        }`}>
          {isLocked ? (
            <IoLockClosed className="text-gray-400" />
          ) : isCompleted ? (
            <IoCheckmarkCircle className="text-success-500" />
          ) : (
            <span className="font-bold text-primary-500">
              {lesson.signs?.length || 0}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-primary-500 transition-colors">
                {lesson.title}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2">{lesson.description}</p>
            </div>
            {!isLocked && (
              <IoChevronForward className="text-xl text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
            )}
          </div>

          {/* Meta Info */}
          <div className="flex items-center flex-wrap gap-3 mt-3">
            <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${difficultyColor}`}>
              {lesson.difficulty}
            </span>
            
            <div className="flex items-center text-sm text-gray-600">
              <IoTimeOutline className="mr-1" />
              {lesson.duration}
            </div>
            
            <div className="text-sm text-gray-600">
              {lesson.signs?.length || 0} signs
            </div>

            {isCompleted && (
              <div className="flex items-center text-sm text-success-500 font-medium">
                <IoCheckmarkCircle className="mr-1" />
                Completed
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {showProgress && progress > 0 && (
            <div className="mt-3">
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 transition-all duration-300"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">{progress}% complete</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonCard;
