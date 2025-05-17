import React, { useState } from 'react';
import { breakdownTask } from '../utils/groqService';
import { Task } from '../types';

interface AITaskBreakdownProps {
  task: Task;
  addSubtask: (parentId: string, title: string) => void;
}

/**
 * AI-powered task breakdown component that uses Groq API
 * to automatically suggest subtasks
 */
const AITaskBreakdown: React.FC<AITaskBreakdownProps> = ({ task, addSubtask }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedSubtasks, setGeneratedSubtasks] = useState<string[]>([]);
  const [selectedSubtasks, setSelectedSubtasks] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Generate subtasks using AI
  const handleGenerateSubtasks = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Pass both title and description (if available) to the breakdown function
      const subtasks = await breakdownTask(
        task.title, 
        task.description || ''
      );
      setGeneratedSubtasks(subtasks);
      setSelectedSubtasks([...subtasks]); // Select all by default
    } catch (err) {
      setError('Failed to generate subtasks. Please try again.');
      console.error('Error generating subtasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle selection of a subtask
  const toggleSubtaskSelection = (subtask: string) => {
    if (selectedSubtasks.includes(subtask)) {
      setSelectedSubtasks(selectedSubtasks.filter(st => st !== subtask));
    } else {
      setSelectedSubtasks([...selectedSubtasks, subtask]);
    }
  };

  // Add selected subtasks to the task
  const handleAddSubtasks = () => {
    selectedSubtasks.forEach(subtask => {
      addSubtask(task.id, subtask);
    });
    
    // Reset after adding
    setGeneratedSubtasks([]);
    setSelectedSubtasks([]);
  };

  const handleCancel = () => {
    setGeneratedSubtasks([]);
    setSelectedSubtasks([]);
    setError(null);
  };

  return (
    <div className="ai-task-breakdown">
      {!generatedSubtasks.length && !isLoading ? (
        <button 
          className="ai-breakdown-btn"
          onClick={handleGenerateSubtasks}
          disabled={isLoading}
        >
          <span className="ai-icon">🤖</span> Auto-Break Down Task with AI
        </button>
      ) : (
        <div className="ai-breakdown-results">
          {isLoading ? (
            <div className="ai-loading">
              <div className="ai-spinner"></div>
              <p>Generating smart subtasks with AI...</p>
            </div>
          ) : error ? (
            <div className="ai-error">
              <p>{error}</p>
              <button onClick={handleGenerateSubtasks} className="retry-btn">
                Try Again
              </button>
            </div>
          ) : (
            <>
              <h4 className="ai-subtasks-heading">
                AI-Suggested Subtasks
                <span className="ai-badge">AI</span>
              </h4>
              
              <div className="ai-subtasks-list">
                {generatedSubtasks.map((subtask, index) => (
                  <div key={index} className="ai-subtask-item">
                    <label className="ai-checkbox-container">
                      <input 
                        type="checkbox"
                        checked={selectedSubtasks.includes(subtask)}
                        onChange={() => toggleSubtaskSelection(subtask)}
                      />
                      <span className="ai-checkmark"></span>
                      <span className="ai-subtask-text">{subtask}</span>
                    </label>
                  </div>
                ))}
              </div>
              
              <div className="ai-actions">
                <button 
                  className="ai-cancel-btn"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button 
                  className="ai-add-btn"
                  onClick={handleAddSubtasks}
                  disabled={selectedSubtasks.length === 0}
                >
                  Add {selectedSubtasks.length} Subtask{selectedSubtasks.length !== 1 ? 's' : ''}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AITaskBreakdown;