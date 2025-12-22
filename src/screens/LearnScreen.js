/**
 * Learn Screen (Web Version)
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoTimeOutline, IoBarChartOutline, IoHandLeftOutline, IoCheckmarkCircle, IoChevronForward, IoBookOutline } from 'react-icons/io5';
import { LESSONS, LESSON_CATEGORIES, getLessonsByCategory } from '../constants/lessons';
import { DatabaseService, AuthService } from '../services/firebase';
import './LearnScreen.css';

const LearnScreen = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('basics');
  const [completedLessons, setCompletedLessons] = useState([]);
  const [filteredLessons, setFilteredLessons] = useState([]);

  useEffect(() => {
    loadCompletedLessons();
  }, []);

  useEffect(() => {
    const lessons = getLessonsByCategory(selectedCategory);
    setFilteredLessons(lessons);
  }, [selectedCategory]);

  const loadCompletedLessons = async () => {
    try {
      const user = AuthService.getCurrentUser();
      if (user) {
        const result = await DatabaseService.getCompletedLessons(user.userId || user.uid);
        if (result.success) {
          setCompletedLessons(result.lessons);
        }
      }
    } catch (error) {
      console.error('Error loading completed lessons:', error);
    }
  };

  const isLessonCompleted = (lessonId) => {
    return completedLessons.includes(lessonId);
  };

  const handleLessonPress = (lesson) => {
    navigate(`/learn/${lesson.id}`, { state: { lesson } });
  };

  const categories = Object.keys(LESSON_CATEGORIES);

  return (
    <div className="learn-screen">
      <div className="learn-header">
        <div>
          <h1 className="header-title">Learn</h1>
          <p className="header-subtitle">Choose a lesson to begin</p>
        </div>
      </div>

      <div className="categories-container">
        {categories.map((key) => {
          const category = LESSON_CATEGORIES[key];
          const isSelected = selectedCategory === category.id;
          return (
            <button
              key={category.id}
              className={`category-button ${isSelected ? 'selected' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-text">{category.title}</span>
            </button>
          );
        })}
      </div>

      <div className="category-info">
        <h2 className="category-info-title">
          {LESSON_CATEGORIES[selectedCategory.toUpperCase()]?.title}
        </h2>
        <p className="category-info-description">
          {LESSON_CATEGORIES[selectedCategory.toUpperCase()]?.description}
        </p>
      </div>

      <div className="lessons-list">
        {filteredLessons.length > 0 ? (
          filteredLessons.map((lesson) => {
            const completed = isLessonCompleted(lesson.id);
            const category = LESSON_CATEGORIES[lesson.categoryId.toUpperCase()];
            
            return (
              <div
                key={lesson.id}
                className="lesson-card"
                onClick={() => handleLessonPress(lesson)}
              >
                <div 
                  className="lesson-badge"
                  style={{ backgroundColor: category?.color || '#4A90E2' }}
                >
                  <span className="lesson-badge-text">{category?.icon || '📚'}</span>
                </div>
                
                <div className="lesson-info">
                  <h3 className="lesson-title">{lesson.title}</h3>
                  <p className="lesson-description">{lesson.description}</p>
                  
                  <div className="lesson-meta">
                    <div className="meta-item">
                      <IoTimeOutline size={16} />
                      <span>{lesson.duration}</span>
                    </div>
                    <div className="meta-item">
                      <IoBarChartOutline size={16} />
                      <span>{lesson.difficulty}</span>
                    </div>
                    <div className="meta-item">
                      <IoHandLeftOutline size={16} />
                      <span>{lesson.signs.length} signs</span>
                    </div>
                  </div>
                </div>
                
                <div className="lesson-status">
                  {completed ? (
                    <IoCheckmarkCircle size={28} color="#10B981" />
                  ) : (
                    <IoChevronForward size={24} color="#9CA3AF" />
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-container">
            <IoBookOutline size={64} color="#9CA3AF" />
            <p className="empty-text">No lessons available in this category</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearnScreen;
