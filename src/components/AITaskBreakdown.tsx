import React, { useState } from 'react';
import { breakdownTask } from '../utils/groqService';
import { Task } from '../types';
import '../styles/ai-task-breakdown.css';

interface AITaskBreakdownProps {
  task: Task;
  addSubtask: (parentId: string, title: string) => void;
  updateTaskDescription?: (id: string, description: string) => void;
  existingSubtasks: Task[];
  setShowAIBreakdown?: (show: boolean) => void;
  forceRefresh?: () => void;
}

/**
 * AI-powered task breakdown component that uses Groq API
 * to suggest subtasks, with improved error handling
 */
const AITaskBreakdown: React.FC<AITaskBreakdownProps> = ({ 
  task, 
  addSubtask,
  updateTaskDescription,
  existingSubtasks,
  setShowAIBreakdown,
  forceRefresh
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedSubtasks, setGeneratedSubtasks] = useState<string[]>([]);
  const [selectedSubtasks, setSelectedSubtasks] = useState<string[]>([]);
  const [editableSubtasks, setEditableSubtasks] = useState<{[key: number]: string}>({});
  const [error, setError] = useState<string | null>(null);
  const [needsClarification, setNeedsClarification] = useState(false);
  const [clarificationText, setClarificationText] = useState('');
  const [aiClarificationRequest, setAiClarificationRequest] = useState('');

  // Generate subtasks using AI
  const handleGenerateSubtasks = async () => {
    console.log('handleGenerateSubtasks triggered', task.title);
    setIsLoading(true);
    setError(null);
    setNeedsClarification(false);
    
    try {
      // Pass both title and description (if available) to the breakdown function
      const subtasks = await breakdownTask(
        task.title, 
        task.description || ''
      );
      
      // Validate subtasks array
      if (!subtasks || !Array.isArray(subtasks) || subtasks.length === 0) {
        throw new Error('Invalid subtasks returned from AI service');
      }
      
      // Make sure all subtasks are valid strings
      const validSubtasks = subtasks.filter(subtask => 
        typeof subtask === 'string' && subtask.trim().length > 0
      );
      
      if (validSubtasks.length === 0) {
        throw new Error('No valid subtasks were generated');
      }
      
      // Log what we received from the API
      console.log('AITaskBreakdown received subtasks:', validSubtasks);
      
      // Check if the AI is requesting clarification
      if (validSubtasks.length === 1 && validSubtasks[0].startsWith('NEEDS_CLARIFICATION')) {
        console.log('Detected clarification request in component:', validSubtasks[0]);
        setNeedsClarification(true);
        // Store the clarification request but don't set it as the text content
        const clarificationRequest = validSubtasks[0].replace('NEEDS_CLARIFICATION:', '').trim();
        // Just set clarification text to empty - we'll display the request separately
        setClarificationText('');
        setGeneratedSubtasks([]);
        setSelectedSubtasks([]);
        
        // Store the request for display purposes only
        setAiClarificationRequest(clarificationRequest);
      } else {
        // Display the subtasks for user confirmation before adding them
        setGeneratedSubtasks(validSubtasks);
        setSelectedSubtasks([...validSubtasks]); // Select all by default
        
        // Initialize editable versions of the subtasks
        const initialEditableSubtasks: {[key: number]: string} = {};
        validSubtasks.forEach((subtask, idx) => {
          initialEditableSubtasks[idx] = subtask;
        });
        setEditableSubtasks(initialEditableSubtasks);
      }
    } catch (err: any) {
      console.error('Error generating subtasks:', err);
      setError(err.message || 'Error occurred while generating subtasks');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle selection of a subtask
  const toggleSubtaskSelection = (subtaskKey: string, index: number) => {
    if (selectedSubtasks.includes(subtaskKey)) {
      setSelectedSubtasks(selectedSubtasks.filter(st => st !== subtaskKey));
    } else {
      setSelectedSubtasks([...selectedSubtasks, subtaskKey]);
    }
  };

  // Update editable subtask
  const handleSubtaskEdit = (subtaskKey: number, value: string) => {
    setEditableSubtasks({
      ...editableSubtasks,
      [subtaskKey]: value
    });
  };

  // Add the selected subtasks when user clicks "Add Subtasks"
  const handleAddSubtasks = () => {
    console.log('handleAddSubtasks called, adding selected subtasks');
    
    // First force refresh to ensure we're working with latest state
    if (forceRefresh) {
      forceRefresh();
    }
    
    // Add each selected subtask
    selectedSubtasks.forEach((subtaskKey) => {
      const index = Number(subtaskKey);
      const value = editableSubtasks[index];
      if (value && value.trim()) {
        addSubtask(task.id, value.trim());
      }
    });
    
    // Final refresh to update UI
    if (forceRefresh) {
      forceRefresh();
    }
    
    // Reset UI state
    setGeneratedSubtasks([]);
    setSelectedSubtasks([]);
    setEditableSubtasks({});
    setError(null);
    setNeedsClarification(false);
    setClarificationText('');
    setAiClarificationRequest('');
    
    // Hide the AI component
    setShowAIBreakdown?.(false);
  };

  // Handle saving additional task details/clarification
  const handleSaveClarification = () => {
    // Debug log to verify function is being called
    console.log('Saving clarification text:', clarificationText);
    
    try {
      if (updateTaskDescription && clarificationText) {
        // Store the existing description plus the clarification
        const currentDesc = task.description || '';
        const updatedDesc = currentDesc ? 
          `${currentDesc}\n\nTask clarification: ${clarificationText}` : 
          `Task clarification: ${clarificationText}`;
        
        console.log('Updating task description with:', updatedDesc);
        updateTaskDescription(task.id, updatedDesc);
        console.log('Task description updated successfully');
      } else {
        console.warn('updateTaskDescription prop is not available or no clarification text');
      }
    } catch (error) {
      console.error('Error in handleSaveClarification:', error);
    }
    
    // Reset state and hide component
    setGeneratedSubtasks([]);
    setSelectedSubtasks([]);
    setEditableSubtasks({});
    setError(null);
    setNeedsClarification(false);
    setClarificationText('');
    setAiClarificationRequest('');
    setShowAIBreakdown?.(false);
  };

  // Submit clarification and re-generate subtasks
  const handleSubmitClarification = async () => {
    // Debug log
    console.log('Submitting clarification and generating subtasks');
    
    if (!updateTaskDescription || !clarificationText.trim()) {
      console.warn('Missing updateTaskDescription prop or clarification text');
      return;
    }
      
    // First update the task description
    const currentDesc = task.description || '';
    const updatedDesc = currentDesc ? 
      `${currentDesc}\n\nTask details: ${clarificationText}` : 
      `Task details: ${clarificationText}`;
    
    console.log('Setting updated task description:', updatedDesc);
    updateTaskDescription(task.id, updatedDesc);
    
    // Then regenerate subtasks with the new description
    console.log('Starting to generate subtasks with new description');
    setIsLoading(true);
    setNeedsClarification(false);
    
    try {
      const subtasks = await breakdownTask(task.title, updatedDesc);
      
      console.log('Received subtasks from API:', subtasks);
      
      // Validate subtasks array
      if (!subtasks || !Array.isArray(subtasks) || subtasks.length === 0) {
        throw new Error('Invalid subtasks returned from AI service');
      }
      
      // Make sure all subtasks are valid strings
      const validSubtasks = subtasks.filter(subtask => 
        typeof subtask === 'string' && subtask.trim().length > 0
      );
      
      console.log('Valid subtasks:', validSubtasks);
      
      if (validSubtasks.length === 0) {
        throw new Error('No valid subtasks were generated');
      }
      
      // Check if we're still getting a clarification request
      if (validSubtasks.length === 1 && validSubtasks[0].startsWith('NEEDS_CLARIFICATION')) {
        throw new Error('Still unable to generate subtasks. Please try again with more specific details.');
      }
      
      // Display the subtasks for user confirmation
      setGeneratedSubtasks(validSubtasks);
      setSelectedSubtasks([...validSubtasks]);
      
      // Initialize editable versions of the subtasks
      const initialEditableSubtasks: {[key: number]: string} = {};
      validSubtasks.forEach((subtask, idx) => {
        initialEditableSubtasks[idx] = subtask;
      });
      setEditableSubtasks(initialEditableSubtasks);
      
    } catch (err: any) {
      console.error('Error generating subtasks:', err);
      setError(err.message || 'Failed to generate subtasks');
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel and reset state
  const handleCancel = () => {
    setGeneratedSubtasks([]);
    setSelectedSubtasks([]);
    setEditableSubtasks({});
    setError(null);
    setNeedsClarification(false);
    setClarificationText('');
    setAiClarificationRequest('');
    setIsLoading(false);
    setShowAIBreakdown?.(false);
  };

  console.log('generatedSubtasks:', generatedSubtasks);
  console.log('editableSubtasks:', editableSubtasks);

  return (
    <div className="ai-task-breakdown">
      {!generatedSubtasks.length && !isLoading && !needsClarification ? (
        // Show button based on whether there are existing subtasks
        <button 
          className="ai-breakdown-btn"
          onClick={(e) => {
            e.preventDefault();
            console.log('Auto-breakdown button clicked for task:', task.id);
            try {
              handleGenerateSubtasks();
            } catch (err) {
              console.error('Error in generate subtasks:', err);
              setError('Failed to generate subtasks. Please try again.');
            }
          }}
          disabled={isLoading}
        >
          <span className="ai-icon">🤖</span> Break Down Task with AI
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
              <button onClick={handleCancel} className="ai-cancel-btn">
                Cancel
              </button>
            </div>
          ) : needsClarification ? (
            <div className="ai-clarification">
              <h4 className="ai-clarification-heading">
                Quick Task Context
                <span className="ai-badge">AI</span>
              </h4>
              <div className="ai-clarification-questions">
                <p className="ai-clarification-text">{aiClarificationRequest}</p>
                <div className="ai-clarification-tips">
                  <p className="clarification-tip">Add a bit more context:</p>
                  <ul>
                    <li>General purpose (why or what for)</li>
                    <li>Rough timeframe (is this urgent?)</li>
                    <li>Your role (personal, work, etc.)</li>
                    <li>Optional: any key constraints</li>
                  </ul>
                </div>
              </div>
              <textarea
                className="ai-clarification-input"
                placeholder="Add additional details about this task..."
                value={clarificationText}
                onChange={(e) => setClarificationText(e.target.value)}
                rows={4}
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
                  Skip & Save Note
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
                <span className="ai-badge">{generatedSubtasks.length}</span>
              </h4>
              <div className="ai-subtasks-notification">
                Review and confirm these suggested subtasks
              </div>
              
              <div className="ai-subtasks-header">
                <div className="ai-select-all">
                  <input 
                    type="checkbox"
                    id="select-all-subtasks"
                    checked={selectedSubtasks.length === generatedSubtasks.length}
                    onChange={() => {
                      if (selectedSubtasks.length === generatedSubtasks.length) {
                        // Deselect all
                        setSelectedSubtasks([]);
                      } else {
                        // Select all
                        setSelectedSubtasks([...generatedSubtasks]);
                      }
                    }}
                  />
                  <label htmlFor="select-all-subtasks">
                    {selectedSubtasks.length === generatedSubtasks.length ? 'Deselect All' : 'Select All'}
                  </label>
                </div>
              </div>
              
              <div className="ai-subtasks-list">
                {generatedSubtasks.map((subtask, index) => (
                  <div key={index} className={`ai-subtask-item ${selectedSubtasks.includes(index.toString()) ? 'selected' : ''}`}>
                    <div className="ai-checkbox-container">
                      <input 
                        type="checkbox"
                        id={`subtask-${index}`}
                        checked={selectedSubtasks.includes(index.toString())}
                        onChange={() => toggleSubtaskSelection(index.toString(), index)}
                      />
                      <span className="ai-checkmark"></span>
                      <input 
                        type="text"
                        className="ai-subtask-edit"
                        value={editableSubtasks[index] || ''}
                        onChange={(e) => handleSubtaskEdit(index, e.target.value)}
                        disabled={!selectedSubtasks.includes(index.toString())}
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
                  Add Selected Subtasks
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