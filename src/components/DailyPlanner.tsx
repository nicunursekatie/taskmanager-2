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
  setDate
}) => {
  const [showNewBlockForm, setShowNewBlockForm] = useState(false);
  const [newBlockStart, setNewBlockStart] = useState('09:00');
  const [newBlockEnd, setNewBlockEnd] = useState('10:00');
  const [newBlockTitle, setNewBlockTitle] = useState('');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [, setIsDragging] = useState(false);
  
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
  
  return (
    <div className="daily-planner">
      <div className="planner-header">
        <div className="date-navigation">
          <button 
            className="btn btn-sm btn-outline"
            onClick={goToPreviousDay}
          >
            ← Previous
          </button>
          <h2 className="current-date">
            {date.toLocaleDateString(undefined, { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h2>
          <button 
            className="btn btn-sm btn-outline"
            onClick={goToNextDay}
          >
            Next →
          </button>
          {!date.toDateString().includes(new Date().toDateString()) && (
            <button 
              className="btn btn-sm btn-primary ml-auto"
              onClick={goToToday}
            >
              Today
            </button>
          )}
        </div>
        
        <div className="planner-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowNewBlockForm(true)}
          >
            + Add Time Block
          </button>
          {sortedTimeBlocks.length > 0 && (
          <button 
          className="btn btn-outline"
          onClick={() => {
            const events = syncToCalendar(timeBlocks, date, tasks);
            // Show a success message
            alert(`Synced ${events.length} time blocks to calendar view!`);
          }}
          title="Push these time blocks to the calendar view"
        >
          📅 Push to Calendar
        </button>
        )}
      </div>
      </div>
      
      {showNewBlockForm && (
        <div className="new-block-form">
          <input
            type="text"
            className="form-control"
            placeholder="Block title"
            value={newBlockTitle}
            onChange={(e) => setNewBlockTitle(e.target.value)}
          />
          <div className="time-inputs">
            <div className="input-group">
              <label className="form-label">Start</label>
              <input
                type="time"
                className="form-control"
                value={newBlockStart}
                onChange={(e) => setNewBlockStart(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label className="form-label">End</label>
              <input
                type="time"
                className="form-control"
                value={newBlockEnd}
                onChange={(e) => setNewBlockEnd(e.target.value)}
              />
            </div>
          </div>
          <div className="form-actions">
            <button 
              className="btn btn-outline"
              onClick={() => setShowNewBlockForm(false)}
            >
              Cancel
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleAddTimeBlock}
            >
              Add Block
            </button>
          </div>
        </div>
      )}
      
      {/* New side-by-side layout */}
      <div className="daily-planner-content">
        {/* Left side: Time blocks */}
        <div className="time-blocks-container">
          <h3 className="section-title">Time Blocks</h3>
          {sortedTimeBlocks.length === 0 ? (
            <div className="no-blocks-message">
              <p>No time blocks for today. Add some blocks to plan your day.</p>
            </div>
          ) : (
            sortedTimeBlocks.map(block => {
              // Get tasks assigned to this block
              const blockTasks = tasks.filter(task => 
                block.taskIds.includes(task.id)
              );
              
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
                      <span className="time-duration">
                        ({getBlockDuration(block)})
                      </span>
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
                          style={{
                            borderLeft: task.context ? 
                              `4px solid ${contextColors[task.context]}` : 
                              undefined
                          }}
                        >
                          <div className="block-task-title">
                            {task.title}
                          </div>
                          <button 
                            className="btn btn-sm btn-text"
                            onClick={() => assignTaskToBlock(task.id, null)}
                          >
                            ×
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="empty-block-message">
                        Drop tasks here
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {/* Right side: Available tasks */}
        <div className="available-tasks-section">
          <h3 className="section-title">Available Tasks</h3>
          <div className="available-tasks">
            {availableTasks.length > 0 ? (
              availableTasks.map(task => (
                <div 
                  key={task.id}
                  className="available-task-item"
                  draggable
                  onDragStart={() => handleDragStart(task.id)}
                  onDragEnd={handleDragEnd}
                  style={{
                    borderLeft: task.context ? 
                      `4px solid ${contextColors[task.context]}` : 
                      undefined
                  }}
                >
                  <div className="available-task-title">
                    {task.title}
                  </div>
                  {task.context && (
                    <div 
                      className="task-context-indicator"
                      style={{ backgroundColor: contextColors[task.context] }}
                    />
                  )}
                </div>
              ))
            ) : (
              <div className="no-tasks-message">
                <p>No available tasks. Create some tasks or mark some as completed to see them here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyPlanner;