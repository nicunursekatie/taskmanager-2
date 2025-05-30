// src/hooks/useTasks.ts
// Update your existing useTasks.ts hook to include context handling

import { useState, useEffect, useCallback } from 'react';
import { Task, ContextTag, PriorityLevel } from '../types';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const stored = localStorage.getItem('tasks');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Existing functions
  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask: Task = { id: Date.now().toString(), ...task };
    setTasks(prev => [...prev, newTask]);
  };

  const toggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === id
          ? { ...t, status: t.status === 'pending' ? 'completed' : 'pending' }
          : t
      )
    );
  };

  const deleteTask = (id: string) => {
    // Enhanced debugging
    
    // Use correct filter logic for the operation
    setTasks(prev => prev.filter(t => {
      // Keep the task if:
      // 1. It's not the task we're deleting AND
      // 2. It's not a subtask of the task we're deleting
      return t.id !== id && t.parentId !== id;
    }));
  };

  const updateTask = (
    id: string,
    title: string,
    dueDate: string | null,
    categories?: string[],
    projectId?: string | null
  ) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id
          ? {
              ...task,
              title,
              dueDate,
              categories: categories || task.categories,
              projectId: projectId !== undefined ? projectId : task.projectId,
            }
          : task
      )
    );
  };

  // Add new function for context
  const updateTaskContext = (id: string, context: ContextTag | null) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id
          ? {
              ...task,
              context: context
            }
          : task
      )
    );
  };

  // Add priority handling
  const updateTaskPriority = (
    id: string, 
    priority: PriorityLevel
  ) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id
          ? {
              ...task,
              priority: priority
            }
          : task
      )
    );
  };

  // Add time estimate handling
  const updateTaskEstimate = (id: string, estimatedMinutes: number | null) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id
          ? {
              ...task,
              estimatedMinutes: estimatedMinutes
            }
          : task
      )
    );
  };
  
  // Start task timer
  const startTaskTimer = (id: string) => {
    const now = new Date().toISOString();
    setTasks(prev =>
      prev.map(task =>
        task.id === id
          ? {
              ...task,
              timeStarted: now
            }
          : task
      )
    );
  };
  
  // Complete task timer
  const completeTaskTimer = (id: string) => {
    const now = new Date();
    setTasks(prev =>
      prev.map(task => {
        if (task.id === id && task.timeStarted) {
          const startTime = new Date(task.timeStarted);
          const diffMs = now.getTime() - startTime.getTime();
          const diffMinutes = Math.ceil(diffMs / (1000 * 60)); // Round up to nearest minute
          
          return {
            ...task,
            timeCompleted: now.toISOString(),
            actualMinutes: diffMinutes
          };
        }
        return task;
      })
    );
  };
  
  // Add new function for subtasks as useCallback to prevent rerenders
  const addSubtask = useCallback((parentId: string, title: string): string => {
    // Get parent task to inherit properties
    const parentTask = tasks.find(t => t.id === parentId);
    
    if (!parentTask) {
      return '';
    }
    
    // Create a new subtask with inherited properties
    const newId = Date.now().toString();
    const newSubtask: Task = {
      id: newId,
      title,
      status: 'pending',
      parentId, // Required for Subtask type
      // Inherit properties from parent
      dueDate: parentTask.dueDate, // Inherit due date from parent
      projectId: parentTask.projectId, // Inherit project from parent
      categories: parentTask.categories, // Inherit categories from parent
      context: parentTask.context, // Inherit context from parent
      priority: parentTask.priority, // Inherit priority from parent
    };
    
    // Update tasks with the new subtask and immediately save to localStorage
    setTasks(prev => {
      const updated = [...prev, newSubtask];
      try {
        // Directly save to localStorage to ensure immediate persistence
        localStorage.setItem('tasks', JSON.stringify(updated));
        // Verify the subtask was added to localStorage
        const stored = localStorage.getItem('tasks');
        if (stored) {
          const parsed = JSON.parse(stored);
          const subtask = parsed.find((t: Task) => t.id === newId);
          if (subtask) {
          }
        }
      } catch (e) {
      }
      return updated;
    });
    
    // Return the new subtask ID so we can track it
    return newId;
  }, [tasks]); // Add tasks as a dependency

  // Add new function to move a task under a new parent
  const moveTaskToParent = (id: string, parentId: string | null) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id
          ? { ...task, parentId }
          : task
      )
    );
  };

  const updateTaskDescription = (id: string, description: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id
          ? { ...task, description }
          : task
      )
    );
  };

  return { 
    tasks, 
    setTasks,
    addTask, 
    toggleTask, 
    deleteTask, 
    updateTask, 
    addSubtask,
    updateTaskContext,
    updateTaskPriority,
    updateTaskEstimate,
    startTaskTimer,
    completeTaskTimer,
    updateTaskDescription,
    moveTaskToParent
  };
}
