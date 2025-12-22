/**
 * Camera Screen (Web Version)
 * Uses browser's getUserMedia API for camera access
 */

import React, { useState, useEffect, useRef } from 'react';
import { IoCameraReverse, IoInformationCircle, IoPlay, IoStop } from 'react-icons/io5';
import mlModelService from '../services/mlModel';
import './CameraScreen.css';

const CameraScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    initializeModel();
    return () => {
      stopCamera();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const initializeModel = async () => {
    try {
      const loaded = await mlModelService.loadModel();
      setIsModelLoaded(loaded);
    } catch (error) {
      console.error('Error initializing model:', error);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      
      setHasPermission(true);
    } catch (error) {
      console.error('Camera access denied:', error);
      setHasPermission(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const togglePrediction = () => {
    if (isPredicting) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setPrediction(null);
      setConfidence(0);
      setIsPredicting(false);
    } else {
      if (!hasPermission) {
        startCamera();
      }
      setIsPredicting(true);
      intervalRef.current = setInterval(() => {
        const result = mlModelService.getMockPrediction();
        if (result.success) {
          setPrediction(result.label);
          setConfidence(result.confidence);
        }
      }, 1000);
    }
  };

  useEffect(() => {
    if (hasPermission === null) {
      startCamera();
    }
  }, [hasPermission]);

  return (
    <div className="camera-screen">
      <div className="camera-container">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="camera-video"
        />
        
        <div className="camera-overlay">
          <div className="guidance-frame"></div>
          
          {prediction && (
            <div className="prediction-container">
              <div className="prediction-label">Detected Sign:</div>
              <div className="prediction-text">{prediction}</div>
              <div className="confidence-bar">
                <div 
                  className="confidence-fill"
                  style={{ width: `${confidence * 100}%` }}
                />
              </div>
              <div className="confidence-text">
                {(confidence * 100).toFixed(0)}% confident
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="camera-controls">
        <div className="status-container">
          <div 
            className="status-dot"
            style={{ backgroundColor: isModelLoaded ? '#10B981' : '#EF4444' }}
          />
          <span className="status-text">
            {isModelLoaded ? 'Model Ready' : 'Model Not Loaded'}
          </span>
        </div>

        <div className="action-buttons">
          <button className="control-button">
            <IoCameraReverse size={28} />
          </button>

          <button
            className={`practice-button ${isPredicting ? 'active' : ''}`}
            onClick={togglePrediction}
          >
            {isPredicting ? <IoStop size={32} /> : <IoPlay size={32} />}
          </button>

          <button 
            className="control-button"
            onClick={() => alert('How to Practice:\n\n1. Position your hand in the frame\n2. Press the play button to start\n3. Make signs clearly\n4. Get instant feedback\n\n⚠️ Currently showing mock predictions for development')}
          >
            <IoInformationCircle size={28} />
          </button>
        </div>

        <div className="instructions-container">
          <p className="instructions-text">
            {isPredicting
              ? '👋 Make a sign and hold it steady'
              : '▶️ Press play to start practicing'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CameraScreen;
