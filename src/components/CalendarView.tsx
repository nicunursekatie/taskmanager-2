// src/components/CalendarView.tsx
import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Task, Category, Project, CalendarEvent } from '../types';
import { getCalendarEvents } from '../utils/calendarSync';

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

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  
  // Load calendar events when the component mounts
  useEffect(() => {
    const events = getCalendarEvents();
    setCalendarEvents(events);
  }, []);
  
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
              
              // Get events for this day
              const dateStr = d.toISOString().split('T')[0];
              const dayEvents = calendarEvents.filter(event => 
                event.start.startsWith(dateStr)
              );
              
              // Count total items to display
              const hasContent = dayTasks.length > 0 || dayEvents.length > 0;
              
              return hasContent ? (
                <div className="calendar-day-markers">
                  {dayTasks.length > 0 && (
                    <span className="task-count" title={`${dayTasks.length} tasks`}>
                      {dayTasks.length}
                    </span>
                  )}
                  
                  {dayEvents.length > 0 && (
                    <span className="event-count" title={`${dayEvents.length} time blocks`}
                      style={{
                        backgroundColor: '#4cc9f0',
                        color: 'white',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        marginLeft: dayTasks.length > 0 ? '5px' : '0',
                      }}
                    >
                      {dayEvents.length}
                    </span>
                  )}
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
          
          {/* Calendar Events from Time Blocks */}
          {(() => {
            // Get events for this day
            const dateStr = date.toISOString().split('T')[0];
            const dayEvents = calendarEvents.filter(event => 
              event.start.startsWith(dateStr)
            );
            
            if (dayEvents.length > 0) {
              return (
                <div className="time-blocks-section">
                  <h3 className="section-subtitle">Planned Time Blocks</h3>
                  <div className="day-events">
                    {dayEvents.sort((a, b) => a.start.localeCompare(b.start))
                      .map(event => {
                        // Format times for display
                        const startTime = new Date(event.start).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        });
                        const endTime = new Date(event.end).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        });
                        
                        return (
                          <div 
                            key={event.id} 
                            className={`day-event ${event.isFlexible ? 'flexible' : ''}`}
                            style={{ 
                              borderLeftColor: event.color || '#6B7280',
                              borderLeftWidth: '4px',
                              borderLeftStyle: 'solid'
                            }}
                          >
                            <div className="event-header">
                              <div className="event-time">
                                {startTime} - {endTime}
                              </div>
                              <h4 className="event-title">{event.title}</h4>
                            </div>
                            
                            {event.description && (
                              <div className="event-description">
                                {event.description}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              );
            }
            return null;
          })()}
          
          {/* Task section */}
          <div className="day-tasks">
            <h3 className="section-subtitle">Tasks</h3>
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