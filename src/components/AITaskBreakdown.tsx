import React, { useState } from 'react';
import { breakdownTask } from '../utils/groqService';
import { Task } from '../types';
import '../styles/ai-task-breakdown.css';

interface AITaskBreakdownProps {
  task: Task;
  addSubtask: (parentId: string, title: string) => void;
  updateTaskDescription?: (id: string, description: string) => void;
}

/**
 * AI-powered task breakdown component that uses Groq API
 * to automatically suggest subtasks, with improved handling of vague tasks
 */
const AITaskBreakdown: React.FC<AITaskBreakdownProps> = ({ 
  task, 
  addSubtask,
  updateTaskDescription 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedSubtasks, setGeneratedSubtasks] = useState<string[]>([]);
  const [selectedSubtasks, setSelectedSubtasks] = useState<string[]>([]);
  const [editableSubtasks, setEditableSubtasks] = useState<{[key: number]: string}>({});
  const [error, setError] = useState<string | null>(null);
  const [needsClarification, setNeedsClarification] = useState(false);
  const [clarificationText, setClarificationText] = useState('');

  // Generate subtasks using AI
  const handleGenerateSubtasks = async () => {
    setIsLoading(true);
    setError(null);
    setNeedsClarification(false);
    
    try {
      // Pass both title and description (if available) to the breakdown function
      const subtasks = await breakdownTask(
        task.title, 
        task.description || ''
      );
      
      // Check if the AI is requesting clarification
      if (subtasks.length === 1 && subtasks[0].startsWith('NEEDS_CLARIFICATION')) {
        setNeedsClarification(true);
        setClarificationText(subtasks[0].replace('NEEDS_CLARIFICATION:', '').trim());
        setGeneratedSubtasks([]);
        setSelectedSubtasks([]);
      } else {
        setGeneratedSubtasks(subtasks);
        setSelectedSubtasks([...subtasks]); // Select all by default
        
        // Initialize editable versions of the subtasks
        const initialEditableSubtasks: {[key: number]: string} = {};
        subtasks.forEach((subtask, index) => {
          initialEditableSubtasks[index] = subtask;
        });
        setEditableSubtasks(initialEditableSubtasks);
      }
    } catch (err) {
      setError('Failed to generate subtasks. Please try again.');
      console.error('Error generating subtasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle selection of a subtask
  const toggleSubtaskSelection = (subtask: string, index: number) => {
    if (selectedSubtasks.includes(subtask)) {
      setSelectedSubtasks(selectedSubtasks.filter(st => st !== subtask));
    } else {
      setSelectedSubtasks([...selectedSubtasks, subtask]);
    }
  };

  // Update editable subtask
  const handleSubtaskEdit = (index: number, value: string) => {
    setEditableSubtasks({
      ...editableSubtasks,
      [index]: value
    });
  };

  // Add selected subtasks to the task
  const handleAddSubtasks = () => {
    // Use the edited versions of the subtasks
    Object.entries(editableSubtasks).forEach(([indexStr, subtask]) => {
      const index = parseInt(indexStr);
      // Only add if the subtask is selected and not empty
      if (selectedSubtasks.includes(generatedSubtasks[index]) && subtask.trim()) {
        addSubtask(task.id, subtask.trim());
      }
    });
    
    // Reset after adding
    handleCancel();
  };

  // Handle saving additional task details/clarification
  const handleSaveClarification = () => {
    if (updateTaskDescription && clarificationText) {
      // Store the existing description plus the clarification
      const currentDesc = task.description || '';
      const updatedDesc = currentDesc ? 
        `${currentDesc}\n\nTask clarification: ${clarificationText}` : 
        `Task clarification: ${clarificationText}`;
      
      updateTaskDescription(task.id, updatedDesc);
    }
    
    handleCancel();
  };

  // Submit clarification and re-generate subtasks
  const handleSubmitClarification = () => {
    if (updateTaskDescription && clarificationText) {
      // Update the task description with the clarification
      const currentDesc = task.description || '';
      const updatedDesc = currentDesc ? 
        `${currentDesc}\n\nTask details: ${clarificationText}` : 
        `Task details: ${clarificationText}`;
      
      updateTaskDescription(task.id, updatedDesc);
      
      // Then regenerate subtasks with the new description
      setIsLoading(true);
      setTimeout(() => {
        breakdownTask(task.title, updatedDesc)
          .then(subtasks => {
            setGeneratedSubtasks(subtasks);
            setSelectedSubtasks([...subtasks]);
            
            // Initialize editable versions of the subtasks
            const initialEditableSubtasks: {[key: number]: string} = {};
            subtasks.forEach((subtask, index) => {
              initialEditableSubtasks[index] = subtask;
            });
            setEditableSubtasks(initialEditableSubtasks);
            
            setNeedsClarification(false);
            setIsLoading(false);
          })
          .catch(err => {
            setError('Failed to generate subtasks after clarification.');
            console.error('Error generating subtasks:', err);
            setIsLoading(false);
          });
      }, 500);
    }
  };

  const handleCancel = () => {
    setGeneratedSubtasks([]);
    setSelectedSubtasks([]);
    setEditableSubtasks({});
    setError(null);
    setNeedsClarification(false);
    setClarificationText('');
  };

  return (
    <div className="ai-task-breakdown">
      {!generatedSubtasks.length && !isLoading && !needsClarification ? (
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
          ) : needsClarification ? (
            <div className="ai-clarification">
              <h4 className="ai-clarification-heading">
                Task Needs Clarification
                <span className="ai-badge">AI</span>
              </h4>
              <p>{clarificationText}</p>
              <textarea
                className="ai-clarification-input"
                placeholder="Add details about this task..."
                value={clarificationText}
                onChange={(e) => setClarificationText(e.target.value)}
                rows={3}
              />
              <div className="ai-actions">
                <button 
                  className="ai-cancel-btn"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button 
                  className="ai-save-btn"
                  onClick={handleSaveClarification}
                >
                  Save Details
                </button>
                <button 
                  className="ai-generate-btn"
                  onClick={handleSubmitClarification}
                  disabled={!clarificationText.trim()}
                >
                  Generate Subtasks
                </button>
              </div>
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
                    <div className="ai-checkbox-container">
                      <input 
                        type="checkbox"
                        checked={selectedSubtasks.includes(subtask)}
                        onChange={() => toggleSubtaskSelection(subtask, index)}
                      />
                      <span className="ai-checkmark"></span>
                      <input 
                        type="text"
                        className="ai-subtask-edit"
                        value={editableSubtasks[index] || ''}
                        onChange={(e) => handleSubtaskEdit(index, e.target.value)}
                        disabled={!selectedSubtasks.includes(subtask)}
                      />
                    </div>
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