import React, { useState, useEffect } from 'react';
import { Task } from '../types';

interface ReminderSystemProps {
  tasks: Task[];
  openTask: (taskId: string) => void;
}

const ReminderSystem: React.FC<ReminderSystemProps> = ({ tasks, openTask }) => {
  const [showReminders, setShowReminders] = useState(false);
  const [reminders, setReminders] = useState<Task[]>([]);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'default'>('default');
  
  // Check for due tasks when component mounts or tasks change
  useEffect(() => {
    checkDueTasks();
    
    // Set up interval to check tasks every minute
    const intervalId = setInterval(checkDueTasks, 60000);
    return () => clearInterval(intervalId);
  }, [tasks]);
  
  // Check notification permission
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);
  
  // Find tasks that are due soon or overdue
  const checkDueTasks = () => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    
    // Find tasks due within the next 2 hours, today, or already overdue
    const dueTasks = tasks.filter(task => {
      if (!task.dueDate || task.status === 'completed') return false;
      
      const dueDate = new Date(task.dueDate);
      
      // Check for specific time-based reminders
      if (task.dueTime) {
        const dueDateTime = new Date(`${task.dueDate}T${task.dueTime}`);
        const diffMs = dueDateTime.getTime() - now.getTime();
        const diffMinutes = diffMs / (1000 * 60);
        
        // Return true if task is due within next 2 hours or is overdue less than 24 hours
        return (diffMinutes <= 120 && diffMinutes > -1440);
      }
      
      // Check for date-based reminders
      const isDueToday = dueDate.getFullYear() === todayStart.getFullYear() &&
                         dueDate.getMonth() === todayStart.getMonth() &&
                         dueDate.getDate() === todayStart.getDate();
                         
      const isDueTomorrow = dueDate.getFullYear() === tomorrowStart.getFullYear() &&
                            dueDate.getMonth() === tomorrowStart.getMonth() &&
                            dueDate.getDate() === tomorrowStart.getDate();
                            
      const isOverdue = dueDate < todayStart;
      
      return isDueToday || isDueTomorrow || isOverdue;
    });
    
    setReminders(dueTasks);
    
    // Show notifications for tasks due in the next hour
    if (notificationPermission === 'granted') {
      const urgentTasks = tasks.filter(task => {
        if (!task.dueDate || !task.dueTime || task.status === 'completed') return false;
        
        const dueDateTime = new Date(`${task.dueDate}T${task.dueTime}`);
        const diffMs = dueDateTime.getTime() - now.getTime();
        const diffMinutes = diffMs / (1000 * 60);
        
        // Tasks due in next 60 minutes or less than 5 minutes overdue
        return (diffMinutes <= 60 && diffMinutes > -5);
      });
      
      // Show notification for each urgent task
      urgentTasks.forEach(task => {
        const notification = new Notification('Task Reminder', {
          body: `"${task.title}" is due soon!`,
          icon: '/favicon.ico', // Default icon
          vibrate: [200, 100, 200],
          tag: `task-${task.id}` // Prevents duplicate notifications
        });
        
        notification.onclick = () => {
          window.focus();
          openTask(task.id);
        };
      });
    }
    
    // Automatically show reminders panel if there are due tasks
    if (dueTasks.length > 0 && !showReminders) {
      setShowReminders(true);
    }
  };
  
  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };
  
  // Format relative time message
  const getRelativeTimeMessage = (task: Task) => {
    const now = new Date();
    
    if (!task.dueDate) return '';
    
    // If task has specific time
    if (task.dueTime) {
      const dueDateTime = new Date(`${task.dueDate}T${task.dueTime}`);
      const diffMs = dueDateTime.getTime() - now.getTime();
      const diffMinutes = Math.round(diffMs / (1000 * 60));
      
      if (diffMinutes < 0) {
        if (diffMinutes > -60) return `${Math.abs(diffMinutes)} minutes overdue!`;
        if (diffMinutes > -120) return `1 hour overdue!`;
        if (diffMinutes > -1440) return `${Math.abs(Math.floor(diffMinutes / 60))} hours overdue!`;
        return `Over 1 day overdue!`;
      } else {
        if (diffMinutes <= 30) return `Due in ${diffMinutes} minutes!`;
        if (diffMinutes <= 60) return `Due in less than an hour!`;
        if (diffMinutes <= 120) return `Due in about ${Math.floor(diffMinutes / 60)} hour!`;
        return `Due at ${dueDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      }
    }
    
    // Date based formatting
    const dueDate = new Date(task.dueDate);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    
    if (dueDate.getTime() < todayStart.getTime()) {
      const diffDays = Math.ceil((todayStart.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays === 1 ? 'Due yesterday!' : `${diffDays} days overdue!`;
    }
    
    if (dueDate.getTime() === todayStart.getTime()) {
      return 'Due today!';
    }
    
    if (dueDate.getTime() === tomorrowStart.getTime()) {
      return 'Due tomorrow!';
    }
    
    return `Due on ${dueDate.toLocaleDateString()}`;
  };
  
  // Get urgency class for styling
  const getUrgencyClass = (task: Task) => {
    const now = new Date();
    
    if (!task.dueDate) return '';
    
    // Check for timed tasks
    if (task.dueTime) {
      const dueDateTime = new Date(`${task.dueDate}T${task.dueTime}`);
      const diffMs = dueDateTime.getTime() - now.getTime();
      const diffMinutes = Math.round(diffMs / (1000 * 60));
      
      if (diffMinutes < 0) return 'overdue';
      if (diffMinutes <= 60) return 'imminent';
      if (diffMinutes <= 120) return 'upcoming';
      return 'scheduled';
    }
    
    // Date based urgency
    const dueDate = new Date(task.dueDate);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    
    if (dueDate.getTime() < todayStart.getTime()) return 'overdue';
    if (dueDate.getTime() === todayStart.getTime()) return 'imminent';
    if (dueDate.getTime() === tomorrowStart.getTime()) return 'upcoming';
    return 'scheduled';
  };
  
  if (reminders.length === 0) return null;
  
  return (
    <>
      {!showReminders ? (
        <div className="reminder-fab" onClick={() => setShowReminders(true)}>
          <div className="reminder-count">{reminders.length}</div>
          <span className="reminder-icon">⏰</span>
        </div>
      ) : (
        <div className="reminders-panel">
          <div className="reminders-header">
            <h3>Upcoming Tasks & Reminders</h3>
            <button 
              className="btn btn-sm btn-outline close-reminders"
              onClick={() => setShowReminders(false)}
            >
              ×
            </button>
          </div>
          
          {notificationPermission !== 'granted' && (
            <div className="notification-request">
              <p>Enable browser notifications for timely task reminders</p>
              <button 
                className="btn btn-sm btn-primary"
                onClick={requestNotificationPermission}
              >
                Enable Notifications
              </button>
            </div>
          )}
          
          <div className="reminders-list">
            {reminders.map(task => (
              <div 
                key={task.id} 
                className={`reminder-item ${getUrgencyClass(task)}`}
                onClick={() => openTask(task.id)}
              >
                <div className="reminder-task-title">{task.title}</div>
                <div className="reminder-time-message">{getRelativeTimeMessage(task)}</div>
                {task.priority && (
                  <div className={`reminder-priority ${task.priority}`}>
                    {task.priority}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default ReminderSystem;