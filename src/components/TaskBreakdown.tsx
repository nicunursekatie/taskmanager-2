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
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAIBreakdown, setShowAIBreakdown] = useState(false);
  const [hasRunBreakdown, setHasRunBreakdown] = useState(false);
  const [showBreakdownSection, setShowBreakdownSection] = useState(false);
  
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
        const storedSubtasks = parsedTasks.filter((t: Task) => t.parentId === task.id);
        console.log(`TaskBreakdown localStorage check: parent ${task.id} has ${storedSubtasks.length} subtasks`);
        storedSubtasks.forEach((st: Task, idx: number) => {
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
          const storedSubtasks = parsedTasks.filter((t: Task) => t.parentId === task.id);
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
              addSubtask={(parentId, title) => {
                const subtaskId = addSubtask(parentId, title);
                forceRefresh();
                // Do NOT set hasRunBreakdown or hide the section here; let the AI component handle closing
                return subtaskId;
              }}
              updateTaskDescription={updateTaskDescription}
              existingSubtasks={subtasks}
              setShowAIBreakdown={(show) => {
                setShowAIBreakdown(show);
                if (!show) {
                  setHasRunBreakdown(true);
                  setShowBreakdownSection(false);
                }
              }}
              forceRefresh={forceRefresh}
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
      {isExpanded && hasRunBreakdown && (
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