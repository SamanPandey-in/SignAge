import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IoArrowBack, IoArrowForward, IoHandLeft } from 'react-icons/io5';
import './LessonContentScreen.css';

const LessonContentScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const lesson = location.state?.lesson;
  const [currentSignIndex, setCurrentSignIndex] = useState(0);

  if (!lesson) {
    return <div>Lesson not found</div>;
  }

  const currentSign = lesson.signs[currentSignIndex];
  const progress = ((currentSignIndex + 1) / lesson.signs.length) * 100;

  const handleNext = () => {
    if (currentSignIndex < lesson.signs.length - 1) {
      setCurrentSignIndex(currentSignIndex + 1);
    } else {
      alert('Lesson Complete! Great job!');
      navigate('/learn');
    }
  };

  const handlePrevious = () => {
    if (currentSignIndex > 0) {
      setCurrentSignIndex(currentSignIndex - 1);
    }
  };

  return (
    <div className="lesson-content-screen">
      <div className="progress-header">
        <div className="progress-bar-bg">
          <div className="progress-bar-fg" style={{ width: `${progress}%` }} />
        </div>
        <span className="progress-label">
          {currentSignIndex + 1} / {lesson.signs.length}
        </span>
      </div>

      <div className="content-area">
        <div className="sign-display">
          <h1>{currentSign.word}</h1>
          <div className="sign-placeholder">
            <IoHandLeft size={120} color="#9CA3AF" />
            <p>Sign demonstration</p>
          </div>
          <p className="sign-desc">{currentSign.description}</p>
        </div>

        <div className="instructions">
          <h3>How to sign:</h3>
          {currentSign.instructions.map((inst, i) => (
            <div key={i} className="instruction-item">
              <span className="instruction-num">{i + 1}</span>
              <span>{inst}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="nav-buttons">
        <button 
          onClick={handlePrevious}
          disabled={currentSignIndex === 0}
          className="nav-btn"
        >
          <IoArrowBack /> Previous
        </button>
        <button onClick={handleNext} className="nav-btn primary">
          {currentSignIndex === lesson.signs.length - 1 ? 'Finish' : 'Next'} <IoArrowForward />
        </button>
      </div>
    </div>
  );
};

export default LessonContentScreen;
