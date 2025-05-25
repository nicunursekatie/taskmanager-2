import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import AITaskBreakdown from './AITaskBreakdown';
import '../styles/ai-task-breakdown.css';

interface TaskBreakdownProps {
  task: Task;
  subtasks: Task[];  // These are the subtasks passed from the parent
  addSubtask: (parentId: string, title: string) => void;
  toggleTask: (id: string) => void;
  updateTaskDescription?: (id: string, description: string) => void;
}

const TaskBreakdown: React.FC<TaskBreakdownProps> = ({ 
  task, 
  subtasks, 
  addSubtask, 
  toggleTask,
  updateTaskDescription 
}) => {
  console.log(`TaskBreakdown for task ${task.id} rendered with ${subtasks.length} subtasks:`, 
    subtasks.map(st => st.title));
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAIBreakdown, setShowAIBreakdown] = useState(false);
  
  // Use a forced refresh counter to ensure we re-render when needed
  const [refreshCounter, setRefreshCounter] = useState(0);
  
  // Force a refresh of subtasks when explicitly triggered by a child component
  const forceRefresh = () => {
    console.log('Force refresh triggered in TaskBreakdown');
    
    // Check localStorage first to see what's actually been persisted
    try {
      const stored = localStorage.getItem('tasks');
      if (stored) {
        const parsedTasks = JSON.parse(stored);
        const storedSubtasks = parsedTasks.filter(t => t.parentId === task.id);
        console.log(`TaskBreakdown localStorage check: parent ${task.id} has ${storedSubtasks.length} subtasks`);
        storedSubtasks.forEach((st, idx) => {
          console.log(`  ${idx+1}. "${st.title}" (ID: ${st.id})`);
        });
      }
    } catch (e) {
      console.error('Error checking localStorage in TaskBreakdown:', e);
    }
    
    // Update the refresh counter to trigger a re-render
    setRefreshCounter(prev => prev + 1);
    
    // Also log passed subtasks to verify
    console.log('Current subtasks array in props:', subtasks.length);
  };
  
  // Reset state when subtasks change
  useEffect(() => {
    console.log('Subtasks updated, count:', subtasks.length, 'refresh counter:', refreshCounter);
    
    // Print out any subtasks for debugging
    if (subtasks.length > 0) {
      console.log('Current subtasks:');
      subtasks.forEach((st, i) => {
        console.log(`  ${i+1}. ID: ${st.id}, Title: "${st.title}", ParentID: ${st.parentId}`);
      });
    }
    
    // If we now have subtasks but the AI breakdown is still showing, hide it
    // Only hide when the loading process is complete and user is done with the AI component
    // Don't auto-hide immediately as this is causing subtasks to disappear from UI
    if (subtasks.length > 0 && showAIBreakdown) {
      console.log('Subtasks exist, but keeping AI breakdown visible until user is done');
      // The AITaskBreakdown component will handle hiding itself when the user clicks "Done"
    }
    
    // If no subtasks showing, check localStorage directly for any that might not have made it to the UI yet
    if (subtasks.length === 0 && task.id) {
      try {
        const stored = localStorage.getItem('tasks');
        if (stored) {
          const parsedTasks = JSON.parse(stored);
          const storedSubtasks = parsedTasks.filter((t: any) => t.parentId === task.id);
          console.log(`[DIRECT CHECK] Found ${storedSubtasks.length} subtasks in localStorage for parent=${task.id}`);
          
          if (storedSubtasks.length > 0) {
            console.log('Subtasks found in localStorage but not in props - they should appear when the parent reloads');
            // If we have subtasks in localStorage but not in props, try to force a refresh
            if (forceRefresh) {
              // Trigger a cascade of delayed refreshes to ensure props get updated
              forceRefresh();
              setTimeout(() => forceRefresh(), 200);
              setTimeout(() => forceRefresh(), 500);
              console.log('Triggered cascade of refreshes to sync localStorage subtasks');
            }
          }
        }
      } catch (e) {
        console.error('Error checking localStorage directly:', e);
      }
    }
  }, [subtasks, refreshCounter, task.id, forceRefresh]);
  
  // Calculate progress percentage
  const totalSubtasks = subtasks.length;
  const completedSubtasks = subtasks.filter(t => t.status === 'completed').length;
  const progressPercentage = totalSubtasks > 0 
    ? Math.round((completedSubtasks / totalSubtasks) * 100) 
    : 0;

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtaskTitle.trim()) {
      // Add the subtask
      addSubtask(task.id, newSubtaskTitle.trim());
      setNewSubtaskTitle('');
      
      // Hide the AI breakdown when a manual subtask is added
      setShowAIBreakdown(false);
      
      // Trigger the expand event to make sure the subtasks are visible
      try {
        const expandEvent = new CustomEvent('expandTaskSubtasks', { 
          detail: { taskId: task.id } 
        });
        document.dispatchEvent(expandEvent);
        console.log(`Triggered expandTaskSubtasks event for task ${task.id} from manual add`);
      } catch (e) {
        console.error('Error dispatching custom event:', e);
      }
    }
  };
  
  // Only show the breakdown component when there are subtasks OR when actively expanded
  const hasContent = subtasks.length > 0 || isExpanded || showAIBreakdown;
  
  // If no content and not expanded, show a compact inline button
  if (!hasContent) {
    return (
      <div className="ai-breakdown-compact">
        <button 
          className="ai-breakdown-compact-btn"
          onClick={() => {
            console.log('AI breakdown button clicked for task:', task.id);
            try {
              setShowAIBreakdown(true);
              setIsExpanded(true);
            } catch (err) {
              console.error('Error showing AI breakdown:', err);
              alert('There was an error opening the AI breakdown. Please try again.');
            }
          }}
        >
          <span className="ai-icon">🤖</span> Break down with AI
        </button>
        <span className="text-muted" style={{ fontSize: 'var(--text-xs)' }}>or</span>
        <button 
          className="btn btn-xs btn-ghost"
          onClick={() => setIsExpanded(true)}
        >
          Add manually
        </button>
      </div>
    );
  }

  return (
    <div className={`task-breakdown ${hasContent ? 'has-content' : ''}`}>
      <div className="breakdown-header">
        <h3 className="breakdown-title">
          Subtasks {subtasks.length > 0 && `(${subtasks.length})`}
          <button 
            className="toggle-button"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? '−' : '+'}
          </button>
        </h3>
        {subtasks.length > 0 && (
          <div className="breakdown-progress">
            <div className="subtask-progress">
              <div 
                className="subtask-progress-bar" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="progress-text">
              <span>{completedSubtasks} of {totalSubtasks} completed ({progressPercentage}%)</span>
            </div>
          </div>
        )}
      </div>
      
      {isExpanded && (
        <>
          <form onSubmit={handleAddSubtask} className="subtask-add-form">
            <input
              type="text"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              placeholder="Add a step to break down this task..."
              className="form-control"
            />
            <button type="submit" className="btn btn-primary">Add Step</button>
          </form>
          
          <div className="subtasks-list">
            {subtasks.length > 0 ? (
              <ul>
                {subtasks.map(subtask => (
                  <li key={subtask.id} className={`subtask-item ${subtask.status === 'completed' ? 'completed' : ''}`}>
                    <input
                      type="checkbox"
                      checked={subtask.status === 'completed'}
                      onChange={() => toggleTask(subtask.id)}
                      id={`subtask-check-${subtask.id}`}
                    />
                    <label htmlFor={`subtask-check-${subtask.id}`} className="subtask-label">
                      {subtask.title}
                    </label>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty-subtasks">
                <p>Breaking complex tasks into smaller steps makes them easier to complete!</p>
                <p>Add your first step above to get started.</p>
              </div>
            )}
          </div>
          
          {subtasks.length > 0 && progressPercentage === 100 && (
            <div className="completion-message">
              🎉 All steps complete! You're doing great!
            </div>
          )}
          
          {/* AI Breakdown - only show if explicitly requested */}
          {showAIBreakdown ? (
            <AITaskBreakdown 
              task={task} 
              addSubtask={(parentId, title) => {
                console.log('Adding subtask from TaskBreakdown wrapper:', title);
                
                // Call the passed addSubtask function
                const subtaskId = addSubtask(parentId, title);
                console.log('Added subtask with ID:', subtaskId);
                
                // Force multiple refreshes to ensure UI updates properly
                forceRefresh();
                
                // Force another refresh after a sequence of short delays
                setTimeout(() => {
                  forceRefresh();
                  console.log('Forced second refresh (100ms delay)');
                  
                  // Try reloading all tasks from localStorage
                  try {
                    const stored = localStorage.getItem('tasks');
                    if (stored) {
                      const parsedTasks = JSON.parse(stored);
                      const parentSubtasks = parsedTasks.filter(t => t.parentId === parentId);
                      console.log(`Recheck - parent ${parentId} has ${parentSubtasks.length} subtasks in localStorage`);
                      console.log('Subtasks from localStorage:', parentSubtasks);
                    }
                  } catch (e) {
                    console.error('Error rechecking localStorage:', e);
                  }
                  
                  // Schedule another refresh
                  setTimeout(() => {
                    forceRefresh();
                    console.log('Forced third refresh (300ms total delay)');
                  }, 200);
                }, 100);
                
                return subtaskId;
              }}
              updateTaskDescription={updateTaskDescription}
              existingSubtasks={subtasks}
              setShowAIBreakdown={setShowAIBreakdown}
              forceRefresh={forceRefresh}
            />
          ) : (
            <button 
              className="ai-breakdown-again-btn"
              onClick={() => {
                console.log('AI breakdown button clicked for task:', task.id);
                try {
                  setShowAIBreakdown(true);
                } catch (err) {
                  console.error('Error showing AI breakdown:', err);
                  alert('There was an error opening the AI breakdown. Please try again.');
                }
              }}
            >
              <span className="ai-icon">🤖</span> Break Down with AI
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default TaskBreakdown;