// src/components/ContextWizard.tsx
import React, { useState } from 'react';
import { Task } from '../types';

export type ContextWizardProps = {
  tasks: Task[];
  onClose: () => void;
  generalTasks: string[];
};

const ContextWizard: React.FC<ContextWizardProps> = ({ tasks, onClose, generalTasks }) => {
  const [step, setStep] = useState(0);
  const [timeSelected, setTimeSelected] = useState<string | null>(null);
  const [energySelected, setEnergySelected] = useState<string | null>(null);
  const [blockingSelected, setBlockingSelected] = useState<string | null>(null);
  
  // Get all pending tasks (both parent and subtasks)
  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  
  // Get the complete tree path for a task (including all parent names)
  const getTaskPath = (task: Task): string => {
    if (!task.parentId) {
      return task.title;
    }
    
    const parentTask = tasks.find(t => t.id === task.parentId);
    if (!parentTask) {
      return task.title;
    }
    
    return `${getTaskPath(parentTask)} > ${task.title}`;
  };
  
  // Count subtasks for a given task
  const countSubtasks = (taskId: string): number => {
    return tasks.filter(t => t.parentId === taskId).length;
  };
  
  // Count completed subtasks for a given task
  const countCompletedSubtasks = (taskId: string): number => {
    return tasks.filter(t => t.parentId === taskId && t.status === 'completed').length;
  };
  
  // Choose tasks based on selected criteria
  const getRecommendedTasks = (): Task[] => {
    if (!timeSelected || !energySelected) return [];
    
    let filteredTasks = [...pendingTasks];
    let availableTime = parseInt(timeSelected);
    
    // Filter by time available
    if (availableTime <= 10) {
      // For very short times, prefer tasks with no subtasks or mostly completed subtasks
      filteredTasks = filteredTasks.filter(task => {
        const subtaskCount = countSubtasks(task.id);
        const completedSubtasks = countCompletedSubtasks(task.id);
        
        // Keep it if it's a subtask itself, has no subtasks, or most subtasks are done
        return task.parentId || subtaskCount === 0 || (completedSubtasks / subtaskCount) > 0.7;
      });
    } else if (availableTime <= 25) {
      // Medium time - may be able to tackle a small parent task
      filteredTasks = filteredTasks.filter(task => {
        const subtaskCount = countSubtasks(task.id);
        return subtaskCount <= 3; // Tasks with few or no subtasks
      });
    }
    // For longer times, include any tasks
    
    // Filter by energy level
    if (energySelected === 'Low') {
      // When energy is low, prioritize subtasks (smaller chunks) or tasks with no subtasks
      filteredTasks = filteredTasks.filter(task => 
        task.parentId || countSubtasks(task.id) === 0
      );
    } else if (energySelected === 'High') {
      // When energy is high, prioritize parent tasks (larger chunks)
      filteredTasks = filteredTasks.filter(task => 
        !task.parentId && countSubtasks(task.id) > 0
      );
      // If no parent tasks are available, fall back to any task
      if (filteredTasks.length === 0) {
        filteredTasks = pendingTasks;
      }
    }
    
    // Consider what's blocking the user
    if (blockingSelected === 'Too many choices') {
      // Sort by hierarchy (parent tasks first, then subtasks)
      filteredTasks.sort((a, b) => {
        if (a.parentId && !b.parentId) return 1;
        if (!a.parentId && b.parentId) return -1;
        return 0;
      });
    } else if (blockingSelected === 'Decision fatigue') {
      // Just pick the first few tasks, minimize choices
      filteredTasks = filteredTasks.slice(0, 3);
    } else if (blockingSelected === 'Need a quick win') {
      // Prioritize subtasks or tasks with no children (quick wins)
      filteredTasks = filteredTasks.filter(task => 
        task.parentId || countSubtasks(task.id) === 0
      );
    }
    
    // If nothing matches, suggest general tasks
    if (filteredTasks.length === 0) {
      return generalTasks.map(title => ({
        id: `gen-${Math.random().toString(36).substring(7)}`,
        title,
        status: 'pending' as const,
      }));
    }
    
    // Return top 3 recommended tasks
    return filteredTasks.slice(0, 3);
  };
  
  const recommendedTasks = step === 3 ? getRecommendedTasks() : [];
  
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">What should I do now?</h2>
          <button className="btn btn-sm btn-outline" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {step === 0 && (
            <>
              <h3>How much time do you have?</h3>
              <div className="flex gap-sm">
                {[5, 10, 25, 60].map(n => (
                  <button 
                    key={n} 
                    className={`btn ${timeSelected === n.toString() ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setTimeSelected(n.toString())}
                  >
                    {n} min
                  </button>
                ))}
              </div>
              <div className="flex justify-between mt-lg">
                <div></div>
                <button 
                  className="btn btn-primary" 
                  onClick={() => setStep(1)}
                  disabled={!timeSelected}
                >
                  Next
                </button>
              </div>
            </>
          )}
          
          {step === 1 && (
            <>
              <h3>How's your energy level?</h3>
              <div className="flex gap-sm">
                {['High', 'Medium', 'Low'].map(level => (
                  <button 
                    key={level} 
                    className={`btn ${energySelected === level ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setEnergySelected(level)}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <div className="flex justify-between mt-lg">
                <button className="btn btn-outline" onClick={() => setStep(0)}>
                  Back
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={() => setStep(2)}
                  disabled={!energySelected}
                >
                  Next
                </button>
              </div>
            </>
          )}
          
          {step === 2 && (
            <>
              <h3>What's blocking you?</h3>
              <div className="flex flex-wrap gap-sm">
                {['Too many choices', 'Decision fatigue', 'Need a quick win', 'Other'].map(b => (
                  <button 
                    key={b} 
                    className={`btn ${blockingSelected === b ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setBlockingSelected(b)}
                  >
                    {b}
                  </button>
                ))}
              </div>
              <div className="flex justify-between mt-lg">
                <button className="btn btn-outline" onClick={() => setStep(1)}>
                  Back
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={() => setStep(3)}
                  disabled={!blockingSelected}
                >
                  Next
                </button>
              </div>
            </>
          )}
          
          {step === 3 && (
            <>
              <h3>{recommendedTasks.length > 0 ? 'I recommend you work on:' : 'Consider taking a break and resetting'}</h3>
              
              {recommendedTasks.length > 0 ? (
                <div className="recommended-tasks">
                  {recommendedTasks.map((task, index) => (
                    <div key={index} className="task-item recommendation">
                      <div className="task-header">
                        <h3 className="task-title">
                          {/* Show full path for subtasks */}
                          {task.parentId ? getTaskPath(task) : task.title}
                        </h3>
                      </div>
                      
                      {/* Show subtask info if relevant */}
                      {!task.parentId && countSubtasks(task.id) > 0 && (
                        <div className="task-meta">
                          <span className="subtask-count">
                            {countCompletedSubtasks(task.id)}/{countSubtasks(task.id)} subtasks completed
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="task-item">
                  <div className="task-header">
                    <h3 className="task-title">Take a short break</h3>
                  </div>
                  <p>It seems like now might be a good time to reset and recharge. Consider taking a 10-minute break.</p>
                </div>
              )}
              
              <div className="flex justify-between mt-lg">
                <button className="btn btn-outline" onClick={() => setStep(2)}>
                  Back
                </button>
                <div className="flex gap-sm">
                  <button className="btn btn-outline" onClick={onClose}>
                    Not now
                  </button>
                  <button className="btn btn-success" onClick={onClose}>
                    Do it!
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContextWizard;