// CalendarView.tsx
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
  
  // Load calendar events
  useEffect(() => {
    const events = getCalendarEvents();
    setCalendarEvents(events);
  }, []);
  
  // Remove an event from the calendar
  const removeCalendarEvent = (eventId: string) => {
    if (confirm('Remove this event from the calendar?')) {
      const updatedEvents = calendarEvents.filter(event => event.id !== eventId);
      setCalendarEvents(updatedEvents);
      localStorage.setItem('calendar_events', JSON.stringify(updatedEvents));
    }
  };
  
  // Get tasks for the selected day
  const getDayTasks = (day: Date) => {
    const dayStr = day.toISOString().split('T')[0];
    return tasks.filter(t => t.dueDate && t.dueDate.split('T')[0] === dayStr);
  };
  
  // Get calendar events for the selected day
  const getDayEvents = (day: Date) => {
    const dayStr = day.toISOString().split('T')[0];
    return calendarEvents.filter(event => event.start.split('T')[0] === dayStr);
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
  
  // Get calendar events for the selected week
  const getWeekEvents = (day: Date) => {
    const dayOfWeek = day.getDay();
    const startDate = new Date(day);
    startDate.setDate(startDate.getDate() - dayOfWeek);
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];
    
    return calendarEvents.filter(event => {
      const eventDate = event.start.split('T')[0];
      return eventDate >= startStr && eventDate <= endStr;
    });
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
  
  // Get calendar events for the selected month
  const getMonthEvents = (day: Date) => {
    const year = day.getFullYear();
    const month = day.getMonth();
    
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];
    
    return calendarEvents.filter(event => {
      const eventDate = event.start.split('T')[0];
      return eventDate >= startStr && eventDate <= endStr;
    });
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
  
  // Get display events based on current view mode
  const getDisplayEvents = () => {
    switch (viewMode) {
      case 'day':
        return getDayEvents(date);
      case 'week':
        return getWeekEvents(date);
      case 'month':
      default:
        return getMonthEvents(date);
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
  
  // Format time for display
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };
  
  // Get the display tasks and events
  const displayTasks = getDisplayTasks();
  const displayEvents = getDisplayEvents();
  
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
              const dayEvents = getDayEvents(d);
              const totalCount = dayTasks.length + dayEvents.length;
              
              return totalCount > 0 ? (
                <div className="calendar-day-marker">
                  <span className="task-count">{totalCount}</span>
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
                  {/* Display calendar events */}
                  {getDayEvents(day).map(event => (
                    <div 
                      key={event.id} 
                      className={`week-event ${event.source === 'planner' ? 'flexible-event' : ''}`}
                      style={{ backgroundColor: event.color || '#4361ee' }}
                    >
                      <div className="event-time">
                        {formatTime(event.start.split('T')[1])} - {formatTime(event.end.split('T')[1])}
                      </div>
                      <span className="event-title">{event.title}</span>
                      
                      {event.source === 'planner' && (
                        <button 
                          className="btn-remove-event" 
                          onClick={() => removeCalendarEvent(event.id)}
                          title="Remove this event"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {/* Display regular tasks */}
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
          
          <div className="day-content">
            {/* Display calendar events first */}
            {displayEvents.length > 0 && (
              <div className="calendar-events-section">
                <h3>Calendar Events</h3>
                {displayEvents.map(event => (
                  <div 
                    key={event.id} 
                    className={`event-item ${event.source === 'planner' ? 'flexible-event' : ''}`}
                    style={{ borderLeftColor: event.color || '#4361ee' }}
                  >
                    <div className="event-header">
                      <div className="event-time-title">
                        <span className="event-time">
                          {formatTime(event.start.split('T')[1])} - {formatTime(event.end.split('T')[1])}
                        </span>
                        <h4 className="event-title">{event.title}</h4>
                      </div>
                      
                      {event.source === 'planner' && (
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => removeCalendarEvent(event.id)}
                          aria-label="Remove event"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    {event.description && (
                      <div className="event-description">
                        {event.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Then display tasks */}
            <div className="day-tasks">
              <h3>Tasks</h3>
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
                          {task.categories && task.categories.length > 0 && 
                            task.categories.map(categoryId => {
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
                            })
                          }
                          
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
        </div>
      )}
    </div>
  );
}