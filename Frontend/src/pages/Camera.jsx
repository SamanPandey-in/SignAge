/**
 * Camera Page
 * AI-powered sign language practice with real-time feedback
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoCamera,
  IoVideocam,
  IoVideocamOff,
  IoRefresh,
  IoCheckmarkCircle,
  IoClose,
  IoTrophy,
  IoInformationCircle,
} from 'react-icons/io5';
import Button from '@components/common/Button';
import Card from '@components/common/Card';
import { LESSONS } from '@constants/lessons';

const Camera = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedSign, setSelectedSign] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(null);
  const [practiceHistory, setPracticeHistory] = useState([]);
  const [showInstructions, setShowInstructions] = useState(true);

  // Get all available signs from lessons
  const allSigns = LESSONS.flatMap(lesson => 
    lesson.signs.map(sign => ({ ...sign, lessonTitle: lesson.title }))
  );

  useEffect(() => {
    return () => {
      // Cleanup: stop camera when component unmounts
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false,
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check your permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  const handleStartPractice = async () => {
    if (!stream) {
      await startCamera();
    }
    setIsRecording(true);
    setFeedback(null);
    setScore(null);
    
    // Simulate AI processing after 3 seconds
    setTimeout(() => {
      analyzeSign();
    }, 3000);
  };

  const analyzeSign = () => {
    // Simulate AI analysis (in production, this would call ML model)
    const randomScore = Math.floor(Math.random() * 30) + 70; // 70-100
    const isSuccess = randomScore >= 80;
    
    setScore(randomScore);
    setIsRecording(false);
    
    if (isSuccess) {
      setFeedback({
        type: 'success',
        message: 'Great job! Your sign is accurate!',
        suggestions: ['Try to make your movements smoother', 'Maintain consistent hand position'],
      });
    } else {
      setFeedback({
        type: 'warning',
        message: 'Good attempt! Let\'s improve it.',
        suggestions: [
          'Check your hand position',
          'Review the tutorial video',
          'Practice the motion more slowly',
        ],
      });
    }
    
    // Add to practice history
    setPracticeHistory(prev => [{
      sign: selectedSign.word,
      score: randomScore,
      timestamp: new Date().toISOString(),
    }, ...prev.slice(0, 4)]);
  };

  const handleSelectSign = (sign) => {
    setSelectedSign(sign);
    setFeedback(null);
    setScore(null);
    setShowInstructions(false);
  };

  const handleReset = () => {
    setSelectedSign(null);
    setFeedback(null);
    setScore(null);
    setShowInstructions(true);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Practice with Camera</h1>
        <p className="text-gray-600">
          Use AI-powered feedback to perfect your signs in real-time
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Camera View */}
        <div className="lg:col-span-2">
          <Card padding="large">
            {/* Camera Feed */}
            <div className="bg-gray-900 rounded-xl aspect-video mb-6 relative overflow-hidden">
              {stream ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform scale-x-[-1]"
                  />
                  {isRecording && (
                    <div className="absolute top-4 right-4 flex items-center space-x-2 bg-danger-500 text-white px-3 py-2 rounded-full animate-pulse">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                      <span className="font-medium">Recording...</span>
                    </div>
                  )}
                  {score !== null && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 shadow-large text-center animate-fade-in">
                      <div className={`text-6xl font-bold mb-2 ${
                        score >= 80 ? 'text-success-500' : 'text-warning-500'
                      }`}>
                        {score}%
                      </div>
                      <p className="text-gray-600">Accuracy Score</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-white">
                  <div className="text-center">
                    <IoCamera className="text-6xl mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-4">Camera is off</p>
                    <Button onClick={startCamera} variant="primary">
                      <IoVideocam className="mr-2" />
                      Turn On Camera
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Selected Sign Info */}
            {selectedSign ? (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedSign.word}</h2>
                    <p className="text-gray-600">{selectedSign.description}</p>
                  </div>
                  <button
                    onClick={handleReset}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <IoClose className="text-2xl" />
                  </button>
                </div>

                {/* Instructions */}
                <div className="bg-primary-50 rounded-xl p-4 mb-4">
                  <h3 className="font-semibold text-primary-900 mb-2">Instructions:</h3>
                  <ol className="space-y-1 text-sm text-primary-800">
                    {selectedSign.instructions?.map((instruction, index) => (
                      <li key={index}>
                        {index + 1}. {instruction}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            ) : null}

            {/* Control Buttons */}
            <div className="flex items-center gap-4">
              {stream ? (
                <>
                  <Button
                    onClick={handleStartPractice}
                    disabled={!selectedSign || isRecording}
                    size="large"
                    fullWidth
                  >
                    <IoCamera className="mr-2" />
                    {isRecording ? 'Analyzing...' : 'Start Practice'}
                  </Button>
                  <Button
                    onClick={stopCamera}
                    variant="danger"
                    size="large"
                  >
                    <IoVideocamOff className="mr-2" />
                    Stop
                  </Button>
                </>
              ) : (
                <Button
                  onClick={startCamera}
                  size="large"
                  fullWidth
                >
                  <IoVideocam className="mr-2" />
                  Start Camera
                </Button>
              )}
            </div>

            {/* Feedback */}
            {feedback && (
              <Card 
                padding="medium" 
                className={`mt-6 ${
                  feedback.type === 'success' 
                    ? 'bg-success-50 border-2 border-success-200' 
                    : 'bg-warning-50 border-2 border-warning-200'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    feedback.type === 'success' ? 'bg-success-500' : 'bg-warning-500'
                  }`}>
                    <IoCheckmarkCircle className="text-2xl text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">{feedback.message}</h3>
                    <ul className="space-y-1 text-sm text-gray-700">
                      {feedback.suggestions.map((suggestion, index) => (
                        <li key={index}>• {suggestion}</li>
                      ))}
                    </ul>
                    <Button
                      onClick={handleStartPractice}
                      variant="outline"
                      size="small"
                      className="mt-4"
                    >
                      <IoRefresh className="mr-2" />
                      Try Again
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Instructions Card */}
          {showInstructions && (
            <Card padding="medium" className="bg-gradient-to-br from-primary-50 to-primary-100">
              <div className="flex items-start space-x-3 mb-4">
                <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <IoInformationCircle className="text-2xl text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">How to Use</h3>
                  <ol className="space-y-2 text-sm text-gray-700">
                    <li>1. Select a sign to practice</li>
                    <li>2. Turn on your camera</li>
                    <li>3. Follow the instructions</li>
                    <li>4. Click "Start Practice"</li>
                    <li>5. Get instant AI feedback</li>
                  </ol>
                </div>
              </div>
            </Card>
          )}

          {/* Select Sign */}
          <Card padding="medium">
            <h3 className="font-semibold text-gray-900 mb-4">Select a Sign</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {allSigns.slice(0, 10).map((sign) => (
                <button
                  key={sign.id}
                  onClick={() => handleSelectSign(sign)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedSign?.id === sign.id
                      ? 'bg-primary-100 border-2 border-primary-500'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <div className="font-medium text-gray-900">{sign.word}</div>
                  <div className="text-xs text-gray-600">{sign.lessonTitle}</div>
                </button>
              ))}
            </div>
          </Card>

          {/* Practice History */}
          {practiceHistory.length > 0 && (
            <Card padding="medium">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <IoTrophy className="text-warning-500 mr-2" />
                Recent Practice
              </h3>
              <div className="space-y-2">
                {practiceHistory.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-900">{item.sign}</span>
                    <span className={`text-sm font-semibold ${
                      item.score >= 80 ? 'text-success-500' : 'text-warning-500'
                    }`}>
                      {item.score}%
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Camera;
