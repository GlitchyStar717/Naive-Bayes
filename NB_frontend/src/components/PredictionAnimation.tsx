import { useEffect, useState } from 'react';
import './PredictionAnimation.css';

interface Prediction {
  country: string;
  confidence: number;
}

interface Props {
  predictions: Prediction[];
}

export const PredictionAnimation = ({ predictions }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPrediction, setShowPrediction] = useState(false);

  useEffect(() => {
    if (predictions.length > 0) {
      setShowPrediction(false);
      setCurrentIndex(0);
      
      // Start animation after a brief delay
      const timeout = setTimeout(() => {
        setShowPrediction(true);
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [predictions]);

  useEffect(() => {
    if (showPrediction && currentIndex < predictions.length - 1) {
      const timeout = setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 1500);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, showPrediction, predictions.length]);

  if (!predictions.length) return null;

  return (
    <div className="predictions-container">
      {predictions.map((prediction, index) => (
        <div
          key={prediction.country}
          className={`prediction-item ${index === currentIndex ? 'active' : ''} 
                     ${index < currentIndex ? 'previous' : ''}`}
          style={{
            opacity: index <= currentIndex ? 1 : 0,
            transform: `translateY(${(index - currentIndex) * 20}px)`
          }}
        >
          <div className="prediction-content">
            <span className="country-code">{prediction.country}</span>
            <div className="confidence-bar-container">
              <div 
                className="confidence-bar"
                style={{ width: `${prediction.confidence * 100}%` }}
              />
            </div>
            <span className="confidence-value">
              {Math.round(prediction.confidence * 100)}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}; 