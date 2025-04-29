// src/utils/calendarSync.ts
import { TimeBlock, Task, CalendarEvent } from '../types';

/**
 * Converts a time block to a calendar event
 */
export function timeBlockToCalendarEvent(
  block: TimeBlock, 
  date: Date, 
  tasks: Task[]
): CalendarEvent {
  const dateStr = date.toISOString().split('T')[0];
  const startDateTime = `${dateStr}T${block.startTime}:00`;
  const endDateTime = `${dateStr}T${block.endTime}:00`;
  
  // Get tasks assigned to this block
  const blockTasks = tasks.filter(task => block.taskIds.includes(task.id));
  const taskList = blockTasks.map(task => task.title).join(', ');
  
  // Create a calendar event
  return {
    id: `planner-${block.id}`,
    title: block.title,
    start: startDateTime,
    end: endDateTime,
    description: taskList ? `Planned tasks: ${taskList}` : '',
    isFlexible: true, // Flag to display differently in calendar
    source: 'planner', // To identify planner-created events
    color: block.color || '#6B7280', // Use the block color if available
  };
}

/**
 * Syncs all time blocks to the calendar
 */
export function syncToCalendar(
  timeBlocks: TimeBlock[], 
  date: Date, 
  tasks: Task[]
): CalendarEvent[] {
  // Convert each time block to a calendar event
  const events: CalendarEvent[] = timeBlocks.map(block => 
    timeBlockToCalendarEvent(block, date, tasks)
  );
  
  // Save to localStorage (with a different key to avoid conflicts)
  try {
    // Get existing calendar events
    const existingEvents = getCalendarEvents();
    
    // Remove any previously synced events for this date
    const dateStr = date.toISOString().split('T')[0];
    const filteredEvents = existingEvents.filter(event => {
      // Keep events that are not from planner or are from a different date
      return event.source !== 'planner' || !event.start.startsWith(dateStr);
    });
    
    // Add the new events
    const newEvents = [...filteredEvents, ...events];
    
    // Save to localStorage
    localStorage.setItem('calendar_events', JSON.stringify(newEvents));
    
    return newEvents;
  } catch (error) {
    console.error('Error syncing to calendar:', error);
    return [];
  }
}

/**
 * Gets all calendar events from localStorage
 */
export function getCalendarEvents(): CalendarEvent[] {
  try {
    const saved = localStorage.getItem('calendar_events');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error loading calendar events:', error);
    return [];
  }
}