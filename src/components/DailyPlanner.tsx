// src/components/DailyPlanner.tsx
import React, { useState } from 'react';
import { Task, TimeBlock, ContextTag } from '../types';
import { syncToCalendar } from '../utils/calendarSync';

type DailyPlannerProps = {
  tasks: Task[];
  timeBlocks: TimeBlock[];
  addTimeBlock: (block: Omit<TimeBlock, 'id'>) => void;
  updateTimeBlock: (id: string, block: Partial<TimeBlock>) => void;
  deleteTimeBlock: (id: string) => void;
  assignTaskToBlock: (taskId: string, blockId: string | null) => void;
  date: Date;
  setDate: (date: Date) => void;
  updateTaskEstimate?: (id: string, estimatedMinutes: number | null) => void;
};

// Context tag colors
const contextColors: Record<ContextTag, string> = {
  'phone-call': '#F59E0B',
  'errand': '#10B981',
  'online': '#3B82F6',
  'home': '#8B5CF6',
  'work': '#EC4899',
  'anywhere': '#6B7280'
};

// Convert 24-hour time string to display time
const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  let period = 'AM';
  let displayHours = hours;
  
  if (hours >= 12) {
    period = 'PM';
    if (hours > 12) {
      displayHours = hours - 12;
    }
  }
  if (hours === 0) {
    displayHours = 12;
  }
  
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

const DailyPlanner: React.FC<DailyPlannerProps> = ({
  tasks,
  timeBlocks,
  addTimeBlock,
  deleteTimeBlock,
  assignTaskToBlock,
  date,
  setDate,
  updateTaskEstimate
}) => {
  const [showNewBlockForm, setShowNewBlockForm] = useState(false);
  const [newBlockStart, setNewBlockStart] = useState('09:00');
  const [newBlockEnd, setNewBlockEnd] = useState('10:00');
  const [newBlockTitle, setNewBlockTitle] = useState('');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [, setIsDragging] = useState(false);
  // New state for quick add task
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  // State for inline estimate input
  const [editingEstimateId, setEditingEstimateId] = useState<string | null>(null);
  const [estimateInput, setEstimateInput] = useState('');
  
  // Get available tasks (not completed and not already in a time block)
  const availableTasks = tasks.filter(task => 
    task.status !== 'completed' && 
    !timeBlocks.some(block => block.taskIds.includes(task.id))
  );
  
  // Sort time blocks by start time
  const sortedTimeBlocks = [...timeBlocks].sort((a, b) => {
    return a.startTime.localeCompare(b.startTime);
  });
  
  // Handle date navigation
  const goToNextDay = () => {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    setDate(nextDay);
  };
  
  const goToPreviousDay = () => {
    const prevDay = new Date(date);
    prevDay.setDate(prevDay.getDate() - 1);
    setDate(prevDay);
  };
  
  const goToToday = () => {
    setDate(new Date());
  };
  
  // Handle adding a new time block
  const handleAddTimeBlock = () => {
    if (!newBlockTitle.trim()) return;
    
    addTimeBlock({
      startTime: newBlockStart,
      endTime: newBlockEnd,
      title: newBlockTitle.trim(),
      taskIds: []
    });
    
    setNewBlockTitle('');
    setShowNewBlockForm(false);
  };
  
  // Handle drag and drop functionality
  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
    setIsDragging(true);
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Allow drop
    e.currentTarget.classList.add('drag-over');
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('drag-over');
  };
  
  const handleDrop = (e: React.DragEvent, blockId: string) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    if (draggedTaskId) {
      assignTaskToBlock(draggedTaskId, blockId);
      setDraggedTaskId(null);
    }
  };
  
  // Calculate the duration of a time block in hours/minutes
  const getBlockDuration = (block: TimeBlock): string => {
    const [startHours, startMinutes] = block.startTime.split(':').map(Number);
    const [endHours, endMinutes] = block.endTime.split(':').map(Number);
    
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    const diffMinutes = endTotalMinutes - startTotalMinutes;
    
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    if (hours === 0) {
      return `${minutes} min`;
    } else if (minutes === 0) {
      return `${hours} hr`;
    } else {
      return `${hours} hr ${minutes} min`;
    }
  };
  
  // Add a quick task (title only, status pending)
  const handleQuickAddTask = () => {
    if (!quickTaskTitle.trim()) return;
    // You may want to lift this up or pass as a prop, but for now just alert
    // or you can call a prop like addTask({ title: quickTaskTitle, status: 'pending' })
    // For now, just dispatch a custom event for the parent to handle
    const event = new CustomEvent('quickAddTask', { detail: { title: quickTaskTitle.trim() } });
    window.dispatchEvent(event);
    setQuickTaskTitle('');
    setShowQuickAdd(false);
  };
  
  return (
    <div className="daily-planner grid md:grid-cols-3 gap-lg">
      {/* Main Planner Area */}
      <div className="card col-span-2 flex flex-col p-lg">
        <div className="flex items-center gap-4 mb-md">
          <button className="btn btn-sm btn-outline" onClick={goToPreviousDay}>← Previous</button>
          <h2 className="text-lg font-bold text-primary flex-1">{date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</h2>
          <button className="btn btn-sm btn-outline" onClick={goToNextDay}>Next →</button>
          {!date.toDateString().includes(new Date().toDateString()) && (
            <button className="btn btn-sm btn-primary ml-auto" onClick={goToToday}>Today</button>
          )}
        </div>
        <div className="flex items-center justify-between mb-md">
          <span className="text-accent font-semibold text-base">Time Blocks</span>
          <button className="btn btn-primary" onClick={() => setShowNewBlockForm(true)}>+ Add Time Block</button>
        </div>
        {showNewBlockForm && (
          <div className="mb-md bg-background p-md rounded border border-border flex flex-col gap-2">
            <input
              type="text"
              className="form-control"
              placeholder="Block title"
              value={newBlockTitle}
              onChange={(e) => setNewBlockTitle(e.target.value)}
            />
            <div className="flex gap-2">
              <div className="flex flex-col flex-1">
                <label className="form-label mb-xs">Start</label>
                <input
                  type="time"
                  className="form-control"
                  value={newBlockStart}
                  onChange={(e) => setNewBlockStart(e.target.value)}
                />
              </div>
              <div className="flex flex-col flex-1">
                <label className="form-label mb-xs">End</label>
                <input
                  type="time"
                  className="form-control"
                  value={newBlockEnd}
                  onChange={(e) => setNewBlockEnd(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-sm">
              <button className="btn btn-outline" onClick={() => setShowNewBlockForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddTimeBlock}>Add Block</button>
            </div>
          </div>
        )}
        {sortedTimeBlocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-light py-12">
            <span style={{ fontSize: '2.5rem', color: 'var(--primary-light)' }}>🗓️</span>
            <div className="mt-md text-lg">No time blocks for today. Add some blocks to plan your day.</div>
          </div>
        ) : (
          <div className="flex flex-col gap-md">
            {sortedTimeBlocks.map(block => {
              const blockTasks = tasks.filter(task => block.taskIds.includes(task.id));
              return (
                <div 
                  key={block.id} 
                  className="time-block"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, block.id)}
                  style={{ borderColor: block.color || '#e0e0e0' }}
                >
                  <div className="time-block-header">
                    <div className="time-block-time">
                      {formatTime(block.startTime)} - {formatTime(block.endTime)}
                      <span className="time-duration">({getBlockDuration(block)})</span>
                    </div>
                    <h3 className="time-block-title">{block.title}</h3>
                    <div className="time-block-actions">
                      <button 
                        className="btn btn-sm btn-outline"
                        onClick={() => deleteTimeBlock(block.id)}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  <div className="time-block-tasks">
                    {blockTasks.length > 0 ? (
                      blockTasks.map(task => (
                        <div 
                          key={task.id}
                          className="block-task-item"
                          style={{ borderLeft: task.context ? `4px solid ${contextColors[task.context]}` : undefined }}
                        >
                          <div className="block-task-title">{task.title}</div>
                          <button 
                            className="btn btn-sm btn-text"
                            onClick={() => assignTaskToBlock(task.id, null)}
                          >
                            ×
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="empty-block-message">Drop tasks here</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Available Tasks Panel */}
      <div className="card flex flex-col p-lg">
        <div className="flex items-center justify-between mb-md">
          <span className="text-primary font-semibold text-base">Available Tasks</span>
          {!showQuickAdd ? (
            <button className="btn btn-sm btn-primary" onClick={() => setShowQuickAdd(true)}>+ Add Task</button>
          ) : null}
        </div>
        {showQuickAdd && (
          <div className="flex gap-2 mb-md">
            <input
              type="text"
              className="form-control flex-1"
              placeholder="Task title..."
              value={quickTaskTitle}
              onChange={e => setQuickTaskTitle(e.target.value)}
              autoFocus
            />
            <button className="btn btn-primary" onClick={handleQuickAddTask}>Add</button>
            <button className="btn btn-outline" onClick={() => { setShowQuickAdd(false); setQuickTaskTitle(''); }}>Cancel</button>
          </div>
        )}
        <ul className="flex flex-col gap-xs overflow-y-auto" style={{ maxHeight: '340px' }}>
          {availableTasks.length === 0 ? (
            <li className="text-light">No available tasks</li>
          ) : (
            availableTasks.map(task => (
              <li
                key={task.id}
                className="py-1 px-2 rounded hover:bg-background transition text-sm text-text flex items-center gap-2"
                draggable
                onDragStart={() => handleDragStart(task.id)}
                onDragEnd={handleDragEnd}
              >
                <span className="flex-1 truncate">{task.title}</span>
                {typeof task.estimatedMinutes === 'number' && task.estimatedMinutes > 0 ? (
                  <span className="text-xs text-light bg-slate-100 rounded px-2 py-0.5 ml-2">
                    {task.estimatedMinutes >= 60
                      ? `${Math.floor(task.estimatedMinutes / 60)}h${task.estimatedMinutes % 60 ? ` ${task.estimatedMinutes % 60}m` : ''}`
                      : `${task.estimatedMinutes}m`}
                  </span>
                ) : updateTaskEstimate ? (
                  editingEstimateId === task.id ? (
                    <form
                      onSubmit={e => {
                        e.preventDefault();
                        const minutes = parseInt(estimateInput, 10);
                        if (!isNaN(minutes) && minutes > 0) {
                          updateTaskEstimate(task.id, minutes);
                          setEditingEstimateId(null);
                          setEstimateInput('');
                        }
                      }}
                      className="flex items-center gap-1"
                      style={{ minWidth: 0 }}
                    >
                      <input
                        type="number"
                        min={1}
                        className="form-control form-control-xs w-14"
                        placeholder="min"
                        value={estimateInput}
                        onChange={e => setEstimateInput(e.target.value)}
                        autoFocus
                        style={{ fontSize: '0.9em', padding: '2px 6px' }}
                      />
                      <button type="submit" className="btn btn-xs btn-primary">OK</button>
                      <button type="button" className="btn btn-xs btn-outline" onClick={() => { setEditingEstimateId(null); setEstimateInput(''); }}>Cancel</button>
                    </form>
                  ) : (
                    <button
                      className="btn btn-xs btn-outline ml-2"
                      onClick={() => { setEditingEstimateId(task.id); setEstimateInput(''); }}
                      title="Add time estimate"
                    >
                      + Estimate
                    </button>
                  )
                ) : null}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default DailyPlanner;