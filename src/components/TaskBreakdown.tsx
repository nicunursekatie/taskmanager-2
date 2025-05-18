import React, { useState } from 'react';
import { Task } from '../types';
import AITaskBreakdown from './AITaskBreakdown';
import '../styles/ai-task-breakdown.css';

interface TaskBreakdownProps {
  task: Task;
  subtasks: Task[];
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
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAIBreakdown, setShowAIBreakdown] = useState(subtasks.length === 0);
  
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
      // Hide the AI breakdown when a manual subtask is added
      setShowAIBreakdown(false);
    }
  };
  
  return (
    <div className="task-breakdown">
      <div className="breakdown-header">
        <h3 className="breakdown-title">
          Break Down This Task
          <button 
            className="toggle-button"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? '−' : '+'}
          </button>
        </h3>
        <div className="breakdown-progress">
          <div className="subtask-progress">
            <div 
              className="subtask-progress-bar" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="progress-text">
            {completedSubtasks} of {totalSubtasks} steps completed ({progressPercentage}%)
          </div>
        </div>
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
          
          {/* Only show the AI breakdown if explicitly requested or if there are no subtasks */}
          {showAIBreakdown ? (
            <AITaskBreakdown 
              task={task} 
              addSubtask={(parentId, title) => {
                addSubtask(parentId, title);
                // Hide the AI breakdown once subtasks are added
                setShowAIBreakdown(false);
              }}
              updateTaskDescription={updateTaskDescription}
              existingSubtasks={subtasks}
            />
          ) : (
            <button 
              className="ai-breakdown-again-btn"
              onClick={() => setShowAIBreakdown(true)}
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