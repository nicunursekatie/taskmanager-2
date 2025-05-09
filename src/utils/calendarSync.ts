// src/utils/calendarSync.ts
import { TimeBlock, Task, CalendarEvent } from '../types';

/**
 * Converts a time block to a calendar event
 */
/**
 * Converts a time block to a calendar event
 */
export function timeBlockToCalendarEvent(
    block: TimeBlock, 
    date: Date, 
    tasks: Task[]
  ): CalendarEvent {
    // Fix timezone issues by working with local date only
    const localDate = new Date(date);
    // Ensure we're using the local date only (no timezone offset)
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
  
    const startDateTime = `${dateStr}T${block.startTime}:00`;
    const endDateTime = `${dateStr}T${block.endTime}:00`;
    
    // Get tasks assigned to this block
    const blockTasks = tasks.filter(task => block.taskIds.includes(task.id));

    // Convert 24-hour format to 12-hour format
    const formatTime = (timeString) => {
      const [hours, minutes] = timeString.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    };

    // Create a calendar event with tasks directly in the title using 12-hour format
    let title = `${formatTime(block.startTime)} - ${formatTime(block.endTime)}`;
    if (block.title) {
      title += `: ${block.title}`;
    }

    // Format tasks for description with more prominent bullets
    let description = '';
    if (blockTasks.length > 0) {
      description = blockTasks.map(task => `• ${task.title}`).join('\n');
    }

    // Create a calendar event
    return {
      id: `planner-${block.id}`,
      title: title,
      start: startDateTime,
      end: endDateTime,
      description: description,
      isFlexible: true, // Flag to display differently in calendar
      source: 'planner', // To identify planner-created events
      color: block.color || '#6B7280', // Use the block color if available
    };
  }
/**
 * Syncs all time blocks to the calendar
 */
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
      // Fix timezone issues by working with local date only
      const localDate = new Date(date);
      const year = localDate.getFullYear();
      const month = String(localDate.getMonth() + 1).padStart(2, '0');
      const day = String(localDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const filteredEvents = existingEvents.filter(event => {
        // Keep events that are not from planner or are from a different date
        const eventDate = event.start.split('T')[0];
        return event.source !== 'planner' || eventDate !== dateStr;
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