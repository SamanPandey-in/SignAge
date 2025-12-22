import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IoTimeOutline, IoBarChartOutline, IoHandLeftOutline, IoArrowForward } from 'react-icons/io5';
import './LessonDetailScreen.css';

const LessonDetailScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const lesson = location.state?.lesson;

  if (!lesson) {
    return <div>Lesson not found</div>;
  }

  return (
    <div className="lesson-detail-screen">
      <div className="detail-header">
        <h1 className="detail-title">{lesson.title}</h1>
        <p className="detail-description">{lesson.description}</p>
      </div>

      <div className="meta-cards">
        <div className="meta-card">
          <IoTimeOutline size={24} color="#4A90E2" />
          <span>{lesson.duration}</span>
        </div>
        <div className="meta-card">
          <IoBarChartOutline size={24} color="#50C878" />
          <span>{lesson.difficulty}</span>
        </div>
        <div className="meta-card">
          <IoHandLeftOutline size={24} color="#FFA500" />
          <span>{lesson.signs.length} signs</span>
        </div>
      </div>

      <div className="signs-section">
        <h2>What you'll learn</h2>
        {lesson.signs.map((sign, index) => (
          <div key={sign.id} className="sign-item">
            <div className="sign-number">{index + 1}</div>
            <div>
              <h3>{sign.word}</h3>
              <p>{sign.description}</p>
            </div>
          </div>
        ))}
      </div>

      <button 
        className="start-button"
        onClick={() => navigate(`/lesson/${lesson.id}`, { state: { lesson } })}
      >
        Start Lesson
        <IoArrowForward size={20} />
      </button>
    </div>
  );
};

export default LessonDetailScreen;
