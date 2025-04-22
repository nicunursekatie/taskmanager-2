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
  
  // Filter and sort tasks for suggestions
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const sortedTasks = [...pendingTasks].sort((a, b) => {
    // Sort by due date first
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return 0;
  });
  
  // Choose tasks based on selected criteria
  const getRecommendedTasks = () => {
    let filteredTasks = [...sortedTasks];
    
    // Filter by time available
    if (timeSelected === '5') {
      // Quick tasks first
      filteredTasks = filteredTasks.slice(0, 3);
    }
    
    // Filter by energy level
    if (energySelected === 'Low') {
      // Simple tasks without due dates might be easier
      filteredTasks = filteredTasks.filter(t => !t.dueDate).slice(0, 3);
    } else if (energySelected === 'High') {
      // Important tasks with due dates soon
      filteredTasks = filteredTasks.filter(t => t.dueDate).slice(0, 3);
    }
    
    // If we don't have enough filtered tasks, add some general tasks
    if (filteredTasks.length === 0) {
      return generalTasks.map(title => ({
        id: `gen-${Math.random().toString(36).substring(7)}`,
        title,
        status: 'pending' as const,
      }));
    }
    
    return filteredTasks;
  };
  
  const recommendedTasks = getRecommendedTasks();
  const suggestion = recommendedTasks[0] || {
    id: 'default',
    title: 'Take a short break and plan your next steps',
    status: 'pending' as const
  };

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
                {[5, 10, 20, 30].map(n => (
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
              <h3>I recommend you work on:</h3>
              <div className="task-item">
                <div className="task-header">
                  <h3 className="task-title">{suggestion.title}</h3>
                </div>
                {(suggestion as Task).dueDate && (
                  <div className="task-meta">
                    <span className="task-date">
                      Due: {new Date((suggestion as Task).dueDate!).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
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