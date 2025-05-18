import React, { useState } from 'react';
import { breakdownTask } from '../utils/groqService';
import { Task } from '../types';
import '../styles/ai-task-breakdown.css';

interface AITaskBreakdownProps {
  task: Task;
  addSubtask: (parentId: string, title: string) => void;
  updateTaskDescription?: (id: string, description: string) => void;
  existingSubtasks: Task[];
}

/**
 * AI-powered task breakdown component that uses Groq API
 * to automatically suggest subtasks, with improved handling of vague tasks
 */
const AITaskBreakdown: React.FC<AITaskBreakdownProps> = ({ 
  task, 
  addSubtask,
  updateTaskDescription,
  existingSubtasks
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
        setGeneratedSubtasks(validSubtasks);
        setSelectedSubtasks([...validSubtasks]); // Select all by default
        
        // Initialize editable versions of the subtasks
        const initialEditableSubtasks: {[key: number]: string} = {};
        validSubtasks.forEach((subtask, index) => {
          initialEditableSubtasks[index] = subtask;
        });
        setEditableSubtasks(initialEditableSubtasks);
        
        // Automatically add all valid subtasks to the task - with a short delay between each
        // to ensure they're processed sequentially and don't conflict
        console.log('Adding subtasks:', validSubtasks);
        
        // Use a promise chain to add subtasks one by one with a small delay
        validSubtasks.reduce((promise, subtask, index) => {
          return promise.then(() => {
            return new Promise<void>(resolve => {
              setTimeout(() => {
                if (subtask.trim()) {
                  console.log(`Adding subtask ${index + 1}/${validSubtasks.length}:`, subtask);
                  addSubtask(task.id, subtask.trim());
                }
                resolve();
              }, 50 * index); // Stagger with small delay
            });
          });
        }, Promise.resolve());
        
        // Don't reset the UI state immediately - keep showing the subtasks to the user
        // This gives users time to see what subtasks were added
        // They can click "Add Subtasks" again if they want specific subtasks or cancel manually
      }
    } catch (err) {
      console.error('Error generating subtasks:', err);
      
      // Fallback to local generation if API call fails
      const fallbackSubtasks = [
        `First step for ${task.title}`,
        `Second step for ${task.title}`,
        `Third step for ${task.title}`,
        `Final step for ${task.title}`
      ];
      
      console.log('Using fallback subtasks due to error:', fallbackSubtasks);
      setGeneratedSubtasks(fallbackSubtasks);
      setSelectedSubtasks([...fallbackSubtasks]);
      
      // Initialize editable versions of the subtasks
      const initialEditableSubtasks: {[key: number]: string} = {};
      fallbackSubtasks.forEach((subtask, index) => {
        initialEditableSubtasks[index] = subtask;
      });
      setEditableSubtasks(initialEditableSubtasks);
      
      // Add subtasks automatically
      fallbackSubtasks.forEach((subtask, index) => {
        setTimeout(() => {
          addSubtask(task.id, subtask);
        }, 50 * index);
      });
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

  // Only handles UI closure - subtasks are already added automatically
  const handleAddSubtasks = () => {
    // Reset all UI state to completely hide the component
    // This ensures the UI disappears after subtasks are added
    handleCancel();
  };

  // Handle saving additional task details/clarification
  const handleSaveClarification = () => {
    // Debug log to verify function is being called
    console.log('Saving clarification text:', clarificationText);
    
    try {
      if (updateTaskDescription) {
        // Store the existing description plus the clarification
        const currentDesc = task.description || '';
        const updatedDesc = currentDesc ? 
          `${currentDesc}\n\nTask clarification: ${clarificationText}` : 
          `Task clarification: ${clarificationText}`;
        
        console.log('Updating task description with:', updatedDesc);
        updateTaskDescription(task.id, updatedDesc);
        console.log('Task description updated successfully');
      } else {
        console.warn('updateTaskDescription prop is not available');
      }
    } catch (error) {
      console.error('Error in handleSaveClarification:', error);
    }
    
    // Always end by resetting the state
    handleCancel();
  };

  // Submit clarification and re-generate subtasks
  const handleSubmitClarification = () => {
    // Debug log
    console.log('Submitting clarification and generating subtasks');
    
    try {
      // First update the task description
      if (updateTaskDescription && clarificationText) {
        // Update the task description with the clarification
        const currentDesc = task.description || '';
        const updatedDesc = currentDesc ? 
          `${currentDesc}\n\nTask details: ${clarificationText}` : 
          `Task details: ${clarificationText}`;
        
        console.log('Setting updated task description:', updatedDesc);
        updateTaskDescription(task.id, updatedDesc);
        
        // Then regenerate subtasks with the new description
        console.log('Starting to generate subtasks with new description');
        setIsLoading(true);
        
        // Use a direct function call instead of setTimeout
        breakdownTask(task.title, updatedDesc)
          .then(subtasks => {
            console.log('Received subtasks from API:', subtasks);
            
            // Validate subtasks array
            if (!subtasks || !Array.isArray(subtasks) || subtasks.length === 0) {
              console.error('Invalid subtasks returned', subtasks);
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
            
            // Force fallback to template-based subtasks if we still get clarification requests
            if (validSubtasks.length === 1 && validSubtasks[0].startsWith('NEEDS_CLARIFICATION')) {
              console.log('Still getting clarification request, using fallback subtasks');
              return [
                `First step for ${task.title}`,
                `Second step for ${task.title}`,
                `Third step for ${task.title}`,
                `Final step for ${task.title}`
              ];
            }
            
            return validSubtasks;
          })
          .then(finalSubtasks => {
            // Set the UI state with either API-generated or fallback subtasks
            setGeneratedSubtasks(finalSubtasks);
            setSelectedSubtasks([...finalSubtasks]);
            
            // Initialize editable versions of the subtasks
            const initialEditableSubtasks: {[key: number]: string} = {};
            finalSubtasks.forEach((subtask, index) => {
              initialEditableSubtasks[index] = subtask;
            });
            setEditableSubtasks(initialEditableSubtasks);
            
            // Automatically add all subtasks to the task - with a short delay between each
            // to ensure they're processed sequentially and don't conflict
            console.log('Adding clarification-based subtasks:', finalSubtasks);
            
            // Use a promise chain to add subtasks one by one with a small delay
            finalSubtasks.reduce((promise, subtask, index) => {
              return promise.then(() => {
                return new Promise<void>(resolve => {
                  setTimeout(() => {
                    if (subtask.trim()) {
                      console.log(`Adding clarification subtask ${index + 1}/${finalSubtasks.length}:`, subtask);
                      addSubtask(task.id, subtask.trim());
                    }
                    resolve();
                  }, 50 * index); // Stagger with small delay
                });
              });
            }, Promise.resolve());
            
            // Update UI state
            setNeedsClarification(false);
            setIsLoading(false);
            
            // Keep subtasks visible to the user
            // Don't reset UI state, so they can see what's being added
          })
          .catch(err => {
            console.error('Error generating subtasks:', err);
            setError('Failed to generate subtasks. Using fallbacks.');
            
            // Provide fallback subtasks on error
            const fallbackSubtasks = [
              `First step for ${task.title}`,
              `Second step for ${task.title}`,
              `Third step for ${task.title}`,
              `Final step for ${task.title}`
            ];
            
            setGeneratedSubtasks(fallbackSubtasks);
            setSelectedSubtasks([...fallbackSubtasks]);
            
            // Initialize editable versions
            const initialEditableSubtasks: {[key: number]: string} = {};
            fallbackSubtasks.forEach((subtask, index) => {
              initialEditableSubtasks[index] = subtask;
            });
            setEditableSubtasks(initialEditableSubtasks);
            
            // Automatically add all fallback subtasks to the task - with a short delay between each
            // to ensure they're processed sequentially and don't conflict
            console.log('Adding fallback subtasks:', fallbackSubtasks);
            
            // Use a promise chain to add subtasks one by one with a small delay
            fallbackSubtasks.reduce((promise, subtask, index) => {
              return promise.then(() => {
                return new Promise<void>(resolve => {
                  setTimeout(() => {
                    if (subtask.trim()) {
                      console.log(`Adding fallback subtask ${index + 1}/${fallbackSubtasks.length}:`, subtask);
                      addSubtask(task.id, subtask.trim());
                    }
                    resolve();
                  }, 50 * index); // Stagger with small delay
                });
              });
            }, Promise.resolve());
            
            setNeedsClarification(false);
            setIsLoading(false);
            
            // Keep subtasks visible to the user
            // Don't reset UI state, so they can see what's being added
          });
      } else {
        console.warn('Missing updateTaskDescription prop or clarification text');
      }
    } catch (error) {
      console.error('Error in handleSubmitClarification:', error);
      setIsLoading(false);
    }
  };

  // Modified to completely reset the state and hide the component
  const handleCancel = () => {
    setGeneratedSubtasks([]);
    setSelectedSubtasks([]);
    setEditableSubtasks({});
    setError(null);
    setNeedsClarification(false);
    setClarificationText('');
    setAiClarificationRequest('');
    setIsLoading(false);
  };

  return (
    <div className="ai-task-breakdown">
      {!generatedSubtasks.length && !isLoading && !needsClarification ? (
        // Show button based on whether there are existing subtasks
        existingSubtasks.length === 0 ? (
        <button 
          className="ai-breakdown-btn"
          onClick={(e) => {
            e.preventDefault(); // Prevent any parent form submission
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
          <span className="ai-icon">🤖</span> Auto-Break Down Task with AI
        </button>
        ) : (
          <button 
            className="ai-breakdown-again-btn"
            onClick={(e) => {
              e.preventDefault(); // Prevent any parent form submission
              console.log('Breakdown again button clicked for task:', task.id);
              try {
                handleGenerateSubtasks();
              } catch (err) {
                console.error('Error in generate subtasks:', err);
                setError('Failed to generate subtasks. Please try again.');
              }
            }}
            disabled={isLoading}
          >
            <span className="ai-icon">🤖</span> Break Down Again with AI
          </button>
        )
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
                ✅ These subtasks have been automatically added
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
                  <div key={index} className={`ai-subtask-item ${selectedSubtasks.includes(subtask) ? 'selected' : ''}`}>
                    <div className="ai-checkbox-container">
                      <input 
                        type="checkbox"
                        id={`subtask-${index}`}
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
                  Done with Subtasks
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