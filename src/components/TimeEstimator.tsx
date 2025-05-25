import React, { useState, useEffect } from 'react';
import { Task } from '../types';

interface TimeEstimatorProps {
  task: Task;
  updateTaskEstimate: (id: string, estimatedMinutes: number | null) => void;
  startTaskTimer: (id: string) => void;
  completeTaskTimer: (id: string) => void;
}

const TimeEstimator: React.FC<TimeEstimatorProps> = ({ 
  task, 
  updateTaskEstimate,
  startTaskTimer,
  completeTaskTimer
}) => {
  const [showEstimator, setShowEstimator] = useState(false);
  const [customMinutes, setCustomMinutes] = useState<string>('');
  const [timerActive, setTimerActive] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  
  // Initialize timer if task is already in progress
  useEffect(() => {
    if (task.timeStarted && !task.timeCompleted) {
      setTimerActive(true);
      const startTime = new Date(task.timeStarted).getTime();
      const currentTime = new Date().getTime();
      const elapsed = Math.floor((currentTime - startTime) / 1000);
      setElapsedSeconds(elapsed);
    }
  }, [task.timeStarted, task.timeCompleted]);
  
  // Handle timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timerActive) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [timerActive]);
  
  // Format time display
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours > 0 ? `${hours}h ` : ''}${minutes}m ${seconds}s`;
  };
  
  // Format time for display in compact form
  const getTimeEstimateDisplay = () => {
    if (!task.estimatedMinutes) return 'No estimate';
    
    const hours = Math.floor(task.estimatedMinutes / 60);
    const minutes = task.estimatedMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
    }
    return `${minutes}m`;
  };
  
  // Get class for estimated time length
  const getEstimateClass = () => {
    if (!task.estimatedMinutes) return '';
    
    if (task.estimatedMinutes <= 30) return 'short';
    if (task.estimatedMinutes <= 120) return 'medium';
    return 'long';
  };
  
  // Difference between estimated and actual times
  const getTimeDifference = () => {
    if (!task.estimatedMinutes || !task.actualMinutes) return null;
    
    const diff = task.actualMinutes - task.estimatedMinutes;
    const percentage = Math.round((diff / task.estimatedMinutes) * 100);
    
    return {
      diff,
      percentage,
      overUnder: diff > 0 ? 'over' : 'under'
    };
  };
  
  // Handle timer start/complete actions
  const handleStartTimer = () => {
    startTaskTimer(task.id);
    setTimerActive(true);
  };
  
  const handleStopTimer = () => {
    completeTaskTimer(task.id);
    setTimerActive(false);
  };
  
  // Handle quick estimate selection
  const handleQuickEstimate = (minutes: number) => {
    updateTaskEstimate(task.id, minutes);
    setShowEstimator(false);
  };
  
  // Handle custom estimate input
  const handleCustomEstimate = () => {
    const minutes = parseInt(customMinutes, 10);
    if (!isNaN(minutes) && minutes > 0) {
      updateTaskEstimate(task.id, minutes);
      setShowEstimator(false);
      setCustomMinutes('');
    }
  };
  
  return (
    <div className="time-estimator">
      {showEstimator ? (
        <div className="time-estimator-expanded">
          <div className="quick-estimate-options">
            <button className="quick-option short" onClick={() => handleQuickEstimate(15)}>15m</button>
            <button className="quick-option short" onClick={() => handleQuickEstimate(30)}>30m</button>
            <button className="quick-option medium" onClick={() => handleQuickEstimate(60)}>1h</button>
            <button className="quick-option medium" onClick={() => handleQuickEstimate(120)}>2h</button>
            <button className="quick-option long" onClick={() => handleQuickEstimate(240)}>4h</button>
          </div>
          <div className="custom-estimate">
            <input
              type="number"
              value={customMinutes}
              onChange={(e) => setCustomMinutes(e.target.value)}
              placeholder="Custom minutes"
              min="1"
              className="form-control"
            />
            <button className="btn btn-sm btn-primary" onClick={handleCustomEstimate} disabled={!customMinutes}>Set</button>
          </div>
          <button className="btn btn-sm btn-outline close-estimator" onClick={() => setShowEstimator(false)}>Cancel</button>
        </div>
      ) : (
        <div className="time-estimator-collapsed">
          <div className="estimate-display" onClick={() => setShowEstimator(true)}>
            <span className={`time-estimate ${getEstimateClass()}`}>
              {task.estimatedMinutes ? getTimeEstimateDisplay() : 'Estimate'} ⏱️
            </span>
          </div>
          {task.estimatedMinutes && !task.timeCompleted && (
            <div className="timer-controls">
              {!timerActive ? (
                <button className="btn btn-sm start-timer" onClick={handleStartTimer} title="Start timer">▶️</button>
              ) : (
                <>
                  <span className="timer-running">{formatTime(elapsedSeconds)}</span>
                  <button className="btn btn-sm stop-timer" onClick={handleStopTimer} title="Stop timer">⏹️</button>
                </>
              )}
            </div>
          )}
          {task.timeCompleted && task.actualMinutes && (
            <div className="time-stats">
              <span className="actual-time">Actual: {formatTime(task.actualMinutes * 60)}</span>
              {getTimeDifference() && (
                <span className={`time-diff ${getTimeDifference()?.overUnder}`}>
                  {getTimeDifference()?.overUnder === 'over' ? '+' : ''}
                  {getTimeDifference()?.diff} min
                  ({getTimeDifference()?.percentage}%)
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TimeEstimator;