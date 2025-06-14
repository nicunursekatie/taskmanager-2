import React, { useState, useEffect } from 'react';
import { Task, Project, Category, PriorityLevel } from '../types';
import TaskList from './TaskList';

interface FocusModeProps {
  tasks: Task[];
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (
    id: string,
    title: string,
    dueDate: string | null,
    categories?: string[],
    projectId?: string | null,
    dependsOn?: string[],
    priority?: PriorityLevel | null
  ) => void;
  addSubtask: (parentId: string, title: string) => void;
  categories: Category[];
  projects: Project[];
  onExitFocusMode: () => void;
  // Props for centralized modal editing, to be passed to TaskList
  setEditingTaskId: (id: string | null) => void;
  setEditTaskTitle: (title: string) => void;
  setEditTaskDueDate: (date: string) => void;
  setEditTaskDueTime: (time: string) => void;
  setEditTaskCategories: (categories: string[]) => void;
  setEditTaskProjectId: (id: string | null) => void;
  setEditTaskPriority: (priority: PriorityLevel | null) => void;
  setShowTaskEditModal: (show: boolean) => void;
  // Task interaction functions that might be missing or need to be complete for TaskList
  updateTaskDescription: (id: string, description: string) => void;
  updateTaskEstimate: (id: string, estimatedMinutes: number | null) => void;
  startTaskTimer: (id: string) => void;
  completeTaskTimer: (id: string) => void;
}

const FocusMode: React.FC<FocusModeProps> = ({
  tasks,
  toggleTask,
  deleteTask,
  updateTask,
  addSubtask,
  categories,
  projects,
  onExitFocusMode,
  // Destructure new props
  setEditingTaskId,
  setEditTaskTitle,
  setEditTaskDueDate,
  setEditTaskDueTime,
  setEditTaskCategories,
  setEditTaskProjectId,
  setEditTaskPriority,
  setShowTaskEditModal,
  updateTaskDescription,
  updateTaskEstimate,
  startTaskTimer,
  completeTaskTimer,
}) => {
  // Filter to high-priority tasks
  const priorityTasks = tasks.filter(
    task => (task.priority === 'critical' || task.priority === 'high') && task.status !== 'completed'
  );
  
  // Focus timer state
  const [timerActive, setTimerActive] = useState(false);
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [timerType, setTimerType] = useState<'focus' | 'break'>('focus');
  const [sessionCount, setSessionCount] = useState(0);

  // Handle timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (timerActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Timer complete
            clearInterval(interval);
            setTimerActive(false);
            
            // Play a sound when timer ends
            const audio = new Audio('/notification-sound.mp3');
            audio.play().catch(() => {
            });
            
            // Handle session completion
            if (timerType === 'focus') {
              setSessionCount(prev => prev + 1);
              // Determine break length based on completed sessions
              const isLongBreak = sessionCount > 0 && (sessionCount + 1) % 4 === 0;
              setMinutes(isLongBreak ? 15 : 5);
              setTimerType('break');
            } else {
              // After break, start new focus session
              setMinutes(25);
              setTimerType('focus');
            }
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [timerActive, minutes, seconds, timerType, sessionCount]);

  // Format time as MM:SS
  const formatTime = (mins: number, secs: number) => {
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle timer controls
  const startTimer = () => setTimerActive(true);
  const pauseTimer = () => setTimerActive(false);
  const resetTimer = () => {
    setTimerActive(false);
    setMinutes(25);
    setSeconds(0);
    setTimerType('focus');
  };

  return (
    <div className="focus-mode">
      <div className="focus-header">
        <h1>Focus Mode <span className="focus-emoji">🧠</span></h1>
        <button 
          className="btn btn-primary exit-focus-btn" 
          onClick={onExitFocusMode}
        >
          Exit Focus Mode
        </button>
      </div>
      
      <div className="focus-timer-container">
        <div className="focus-timer">
          <div className="timer-label">
            {timerType === 'focus' ? '🎯 Focus Session' : '☕ Break Time'}
          </div>
          <div className="timer-display">{formatTime(minutes, seconds)}</div>
          <div className="timer-controls">
            {!timerActive ? (
              <button className="btn btn-primary" onClick={startTimer}>Start</button>
            ) : (
              <button className="btn btn-outline" onClick={pauseTimer}>Pause</button>
            )}
            <button className="btn btn-outline" onClick={resetTimer}>Reset</button>
          </div>
          <div className="session-counter">
            Completed Sessions: {sessionCount}
          </div>
        </div>
        
        <div className="focus-instructions">
          <h3>How to Use Focus Mode</h3>
          <ol>
            <li>Work intensely on tasks for 25 minutes</li>
            <li>Take a 5-minute break when the timer ends</li>
            <li>After 4 sessions, take a longer 15-minute break</li>
            <li>Check off each task as you complete it</li>
          </ol>
        </div>
      </div>
      
      <div className="focus-task-list-container">
        <h2>Priority Tasks</h2>
        {priorityTasks.length > 0 ? (
          <TaskList
            tasks={priorityTasks}
            toggleTask={toggleTask}
            deleteTask={deleteTask}
            updateTask={updateTask}
            updateTaskDescription={updateTaskDescription} // Pass through
            addSubtask={addSubtask}
            updateTaskEstimate={updateTaskEstimate} // Pass through
            startTaskTimer={startTaskTimer} // Pass through
            completeTaskTimer={completeTaskTimer} // Pass through
            moveTaskToParent={(id, parentId) => {/* Not needed in focus mode */}}
            categories={categories}
            projects={projects}
            // Pass modal editing props
            setEditingTaskId={setEditingTaskId}
            setEditTaskTitle={setEditTaskTitle}
            setEditTaskDueDate={setEditTaskDueDate}
            setEditTaskDueTime={setEditTaskDueTime}
            setEditTaskCategories={setEditTaskCategories}
            setEditTaskProjectId={setEditTaskProjectId}
            setEditTaskPriority={setEditTaskPriority}
            setShowTaskEditModal={setShowTaskEditModal}
          />
        ) : (
          <div className="empty-priority-tasks">
            <p>No high-priority tasks to focus on right now.</p>
            <p>Tip: Mark tasks as "High" or "Critical" priority to see them here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FocusMode;
