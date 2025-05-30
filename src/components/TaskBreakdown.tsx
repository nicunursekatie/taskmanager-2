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
  const [hasRunBreakdown, setHasRunBreakdown] = useState(false);
  const [showBreakdownSection, setShowBreakdownSection] = useState(false);
  
  // Reset state when subtasks change
  useEffect(() => {
    // The main render log already states how many subtasks are passed.
    // Detailed logging of subtask properties here is likely excessive now.
    
    // If we now have subtasks but the AI breakdown is still showing, hide it
    // Only hide when the loading process is complete and user is done with the AI component
    // Don't auto-hide immediately as this is causing subtasks to disappear from UI
    // This useEffect primarily reacts to changes in subtasks or the task itself.
    // AITaskBreakdown now manages its own visibility.
    // If subtasks are added (either manually or by AI), this component will re-render
    // and the UI should update naturally.

    if (subtasks.length === 0 && hasRunBreakdown) {
      // This case: AI ran, returned no subtasks, or subtasks were deleted.
      // We might want to allow the user to re-run AI or add manually.
      // The UI logic for showing the "Re-run Breakdown" button or "Break Down with AI"
      // should handle this based on `hasRunBreakdown` and `subtasks.length`.
      console.log('useEffect: No subtasks, but AI breakdown has been run. UI should offer options to re-run or add manually.');
    }
    // No specific action needed here if subtasks.length > 0 and showAIBreakdown is true,
    // as AITaskBreakdown will call setShowAIBreakdown(false) which will update state and
    // cause a re-render, hiding the AI component.

  }, [subtasks, task.id, hasRunBreakdown]);
  
  // Calculate progress percentage
  const totalSubtasks = subtasks.length;
  const completedSubtasks = subtasks.filter(t => t.status === 'completed').length;
  const progressPercentage = totalSubtasks > 0 
    ? Math.round((completedSubtasks / totalSubtasks) * 100) 
    : 0;

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtaskTitle.trim()) {
      addSubtask(task.id, newSubtaskTitle.trim());
      setNewSubtaskTitle('');
      setShowAIBreakdown(false);
      setHasRunBreakdown(true);
      setShowBreakdownSection(false);
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
              setShowBreakdownSection(true); // Ensure the section becomes visible
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
          onClick={() => {
            setIsExpanded(true);
            setShowBreakdownSection(true); // Ensure the section becomes visible
          }}
        >
          Add manually
        </button>
      </div>
    );
  }

  return (
    <div className="task-breakdown w-full">
      {/* Only show the breakdown section if showBreakdownSection is true and this is a top-level task */}
      {(!task.parentId && !subtasks.length && !hasRunBreakdown && !showBreakdownSection) && (
        <button
          className="px-3 py-1 rounded-md font-medium text-primary border border-primary bg-primary/5 hover:bg-primary/10 transition text-sm flex items-center gap-1 shadow-none"
          onClick={() => setShowBreakdownSection(true)}
        >
          Break Down
        </button>
      )}
      {(showBreakdownSection && !hasRunBreakdown) && (
        <div className="bg-white rounded-md shadow-sm p-4 border border-gray-200 mt-2 mb-4">
          <div className="breakdown-header flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 mr-2"></span>
              Break Down This Task
            </h3>
            <button 
              className="text-gray-500 hover:text-gray-700 text-xl font-bold focus:outline-none"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          </div>
          <div className="breakdown-progress mb-2">
            <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
              <div 
                className="bg-yellow-400 h-2 rounded-full transition-all"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500">
              {totalSubtasks === 0 ? (
                <span>No subtasks yet. Break down this task into smaller steps.</span>
              ) : (
                <span>{completedSubtasks} of {totalSubtasks} steps completed ({progressPercentage}%)</span>
              )}
            </div>
          </div>
          {isExpanded && (
            <form onSubmit={handleAddSubtask} className="flex gap-2 mb-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Add a step to break down this task..."
                className="flex-1 border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button type="submit" className="px-4 py-1 rounded-md font-semibold bg-primary text-sm transition">
                Add Step
              </button>
            </form>
          )}
          {showAIBreakdown && !hasRunBreakdown ? (
            <AITaskBreakdown 
              task={task} 
              addSubtask={addSubtask}
              updateTaskDescription={updateTaskDescription}
              existingSubtasks={subtasks}
              setShowAIBreakdown={(show) => {
                setShowAIBreakdown(show);
                if (!show) {
                  // When AITaskBreakdown hides itself, we can mark that AI has run.
                  setHasRunBreakdown(true); 
                  setShowBreakdownSection(false); // Hide the entire breakdown section once AI is done.
                }
              }}
            />
          ) : !hasRunBreakdown && (
            <button 
              className="px-4 py-1 rounded-md font-medium border border-primary text-primary bg-white hover:bg-primary/10 text-sm flex items-center gap-1 transition"
              onClick={() => setShowAIBreakdown(true)}
            >
              <span className="mr-1">🤖</span> Break Down with AI
            </button>
          )}
        </div>
      )}
      {hasRunBreakdown && ( // Show if a breakdown has been run, regardless of isExpanded
        <button
          className="px-4 py-2 rounded-lg font-semibold bg-yellow-100 text-yellow-700 border border-yellow-300 hover:bg-yellow-200 transition mb-2"
          onClick={() => {
            setHasRunBreakdown(false);
            setNewSubtaskTitle('');
            setShowBreakdownSection(true);
          }}
        >
          Re-run Breakdown
        </button>
      )}
      {subtasks.length > 0 && progressPercentage === 100 && (
        <div className="text-green-600 font-semibold mt-2">
          🎉 All steps complete! You're doing great!
        </div>
      )}
    </div>
  );
};

export default TaskBreakdown;