// src/components/CalendarView.tsx
import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Task, Category, Project } from '../types';

type CalendarViewProps = {
  tasks: Task[];
  toggleTask: (id: string) => void;
  categories: Category[];
  projects: Project[];
};

type ViewMode = 'month' | 'week' | 'day';

export default function CalendarView({ tasks, toggleTask, categories, projects }: CalendarViewProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  
  // Get tasks for the selected day
  const getDayTasks = (day: Date) => {
    const dayStr = day.toISOString().split('T')[0];
    return tasks.filter(t => t.dueDate && t.dueDate.split('T')[0] === dayStr);
  };
  
  // Get tasks for the selected week
  const getWeekTasks = (day: Date) => {
    const dayOfWeek = day.getDay();
    const startDate = new Date(day);
    startDate.setDate(startDate.getDate() - dayOfWeek);
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    
    const startStr = startDate.toISOString();
    const endStr = endDate.toISOString();
    
    return tasks.filter(t => t.dueDate && t.dueDate >= startStr && t.dueDate <= endStr);
  };
  
  // Get tasks for the selected month
  const getMonthTasks = (day: Date) => {
    const year = day.getFullYear();
    const month = day.getMonth();
    
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    
    const startStr = startDate.toISOString();
    const endStr = endDate.toISOString();
    
    return tasks.filter(t => t.dueDate && t.dueDate >= startStr && t.dueDate <= endStr);
  };
  
  // Get display tasks based on current view mode
  const getDisplayTasks = () => {
    switch (viewMode) {
      case 'day':
        return getDayTasks(date);
      case 'week':
        return getWeekTasks(date);
      case 'month':
      default:
        return getMonthTasks(date);
    }
  };
  
  // Get week day names for week view header
  const getWeekDays = (day: Date) => {
    const days = [];
    const dayOfWeek = day.getDay();
    const startDate = new Date(day);
    startDate.setDate(startDate.getDate() - dayOfWeek);
    
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(startDate);
      currentDay.setDate(currentDay.getDate() + i);
      days.push(currentDay);
    }
    
    return days;
  };
  
  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };
  
  // Get the display tasks
  const displayTasks = getDisplayTasks();
  
  return (
    <div className="calendar-view">
      <div className="view-controls">
        <div className="view-modes">
          <button
            className={`btn ${viewMode === 'month' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setViewMode('month')}
          >
            Month
          </button>
          <button
            className={`btn ${viewMode === 'week' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setViewMode('week')}
          >
            Week
          </button>
          <button
            className={`btn ${viewMode === 'day' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setViewMode('day')}
          >
            Day
          </button>
        </div>
        
        <div className="date-navigation">
          <button 
            className="btn btn-outline"
            onClick={() => {
              const newDate = new Date(date);
              if (viewMode === 'month') {
                newDate.setMonth(newDate.getMonth() - 1);
              } else if (viewMode === 'week') {
                newDate.setDate(newDate.getDate() - 7);
              } else {
                newDate.setDate(newDate.getDate() - 1);
              }
              setDate(newDate);
            }}
          >
            Previous
          </button>
          
          <button
            className="btn btn-outline"
            onClick={() => setDate(new Date())}
          >
            Today
          </button>
          
          <button 
            className="btn btn-outline"
            onClick={() => {
              const newDate = new Date(date);
              if (viewMode === 'month') {
                newDate.setMonth(newDate.getMonth() + 1);
              } else if (viewMode === 'week') {
                newDate.setDate(newDate.getDate() + 7);
              } else {
                newDate.setDate(newDate.getDate() + 1);
              }
              setDate(newDate);
            }}
          >
            Next
          </button>
        </div>
      </div>
      
      {viewMode === 'month' && (
        <div className="month-view">
          <h2>{date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
          <Calendar
            onChange={(value) => {
              if (value instanceof Date) {
                setDate(value);
                setViewMode('day');
              }
            }}
            value={date}
            tileContent={({ date: d }) => {
              const dayTasks = getDayTasks(d);
              return dayTasks.length > 0 ? (
                <div className="calendar-day-marker">
                  <span className="task-count">{dayTasks.length}</span>
                </div>
              ) : null;
            }}
          />
        </div>
      )}
      
      {viewMode === 'week' && (
        <div className="week-view">
          <h2>Week of {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</h2>
          
          <div className="week-grid">
            {getWeekDays(date).map((day, index) => (
              <div key={index} className="week-day">
                <h3 className="day-header">
                  {formatDate(day)}
                </h3>
                <div className="day-tasks">
                  {getDayTasks(day).map(task => (
                    <div 
                      key={task.id} 
                      className={`week-task ${task.status === 'completed' ? 'completed' : ''}`}
                      onClick={() => toggleTask(task.id)}
                    >
                      <span className="task-title">{task.title}</span>
                      {task.projectId && (
                        <span className="task-project">
                          {projects.find(p => p.id === task.projectId)?.name || 'Unknown Project'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {viewMode === 'day' && (
        <div className="day-view">
          <h2>{date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</h2>
          
          <div className="day-tasks">
            {displayTasks.length > 0 ? (
              <div className="tasks-list">
                {displayTasks.map(task => (
                  <div 
                    key={task.id} 
                    className={`day-task ${task.status === 'completed' ? 'completed' : ''}`}
                  >
                    <div className="task-header">
                      <div className="task-checkbox-title">
                        <input 
                          type="checkbox" 
                          checked={task.status === 'completed'} 
                          onChange={() => toggleTask(task.id)}
                        />
                        <span className="task-title">{task.title}</span>
                      </div>
                      
                      <div className="task-meta">
                        {task.categories && task.categories.map(categoryId => {
                          const category = categories.find(c => c.id === categoryId);
                          return category ? (
                            <span 
                              key={categoryId} 
                              className="task-category"
                              style={{ backgroundColor: category.color }}
                            >
                              {category.name}
                            </span>
                          ) : null;
                        })}
                        
                        {task.projectId && (
                          <span className="task-project">
                            {projects.find(p => p.id === task.projectId)?.name || 'Unknown Project'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-tasks-message">No tasks scheduled for this day.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}