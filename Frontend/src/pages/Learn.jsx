/**
 * Learn Page - Lesson Selection
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLessons } from '@hooks/useLessons';
import { LESSONS, LESSON_CATEGORIES, getLessonsByCategory } from '@constants/lessons';
import { ROUTES, generatePath } from '@constants/routes';
import { IoCheckmarkCircle, IoChevronForward } from 'react-icons/io5';
import LoadingSpinner from '@components/common/LoadingSpinner';

const Learn = () => {
  const navigate = useNavigate();
  const { completedLessons, isLoading } = useLessons();
  const [selectedCategory, setSelectedCategory] = useState('basics');
  const [filteredLessons, setFilteredLessons] = useState([]);

  useEffect(() => {
    const lessons = getLessonsByCategory(selectedCategory);
    setFilteredLessons(lessons);
  }, [selectedCategory]);

  const isLessonCompleted = (lessonId) => completedLessons.includes(lessonId);

  const handleLessonClick = (lesson) => {
    navigate(generatePath(ROUTES.LESSON_DETAIL, { lessonId: lesson.id }));
  };

  const categories = Object.keys(LESSON_CATEGORIES);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Learn</h1>
        <p className="text-gray-600">Choose a lesson to begin your learning journey</p>
      </div>

      {/* Category Tabs */}
      <div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
        {categories.map((key) => {
          const category = LESSON_CATEGORIES[key];
          const isSelected = selectedCategory === category.id;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                isSelected
                  ? 'bg-primary-500 text-white shadow-medium'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl">{category.icon}</span>
              <span>{category.title}</span>
            </button>
          );
        })}
      </div>

      {/* Category Info */}
      <div className="bg-white rounded-xl p-6 mb-8 shadow-soft">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          {LESSON_CATEGORIES[selectedCategory.toUpperCase()]?.title}
        </h2>
        <p className="text-gray-600">
          {LESSON_CATEGORIES[selectedCategory.toUpperCase()]?.description}
        </p>
      </div>

      {/* Lessons List */}
      <div className="space-y-4">
        {filteredLessons.length > 0 ? (
          filteredLessons.map((lesson) => {
            const completed = isLessonCompleted(lesson.id);
            const category = LESSON_CATEGORIES[lesson.categoryId.toUpperCase()];
            
            return (
              <div
                key={lesson.id}
                onClick={() => handleLessonClick(lesson)}
                className="bg-white rounded-xl p-6 shadow-soft hover:shadow-medium transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
                      style={{ backgroundColor: `${category?.color}20` }}
                    >
                      {category?.icon}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-xl font-semibold text-gray-900">{lesson.title}</h3>
                        {completed && (
                          <IoCheckmarkCircle className="text-success-500 text-xl" />
                        )}
                      </div>
                      <p className="text-gray-600 mb-2">{lesson.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="px-2 py-1 bg-gray-100 rounded-lg">{lesson.difficulty}</span>
                        <span>{lesson.duration}</span>
                        <span>{lesson.signs?.length || 0} signs</span>
                      </div>
                    </div>
                  </div>

                  <IoChevronForward className="text-2xl text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No lessons available in this category yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Learn;
