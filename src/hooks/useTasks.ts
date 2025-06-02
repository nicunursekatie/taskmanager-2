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
  const addTask = useCallback((task: Omit<Task, 'id'>) => {
    const newTask: Task = { id: Date.now().toString(), ...task };
    setTasks(prev => [...prev, newTask]);
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === id
          ? { ...t, status: t.status === 'pending' ? 'completed' : 'pending' }
          : t
      )
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => {
      return t.id !== id && t.parentId !== id;
    }));
  }, []);

  const updateTask = useCallback((
    id: string,
    title: string,
    dueDate: string | null,
    categories?: string[],
    projectId?: string | null
    // priority?: PriorityLevel // This was missing in the original updateTask, but TaskListProps implies it
                                 // For now, sticking to original signature and will address if it's an issue.
                                 // The modal save in App.tsx calls updateTask with priority, but useTasks.updateTask doesn't handle it.
                                 // This might be a bug/inconsistency. I will assume for now the subtask is only about useCallback.
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
              // priority: priority !== undefined ? priority : task.priority, // If priority was to be handled here
            }
          : task
      )
    );
  }, []);

  // Add new function for context
  const updateTaskContext = useCallback((id: string, context: ContextTag | null) => {
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
  }, []);

  // Add priority handling
  const updateTaskPriority = useCallback((
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
  }, []);

  // Add time estimate handling
  const updateTaskEstimate = useCallback((id: string, estimatedMinutes: number | null) => {
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
  }, []);
  
  // Start task timer
  const startTaskTimer = useCallback((id: string) => {
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
  }, []);
  
  // Complete task timer
  const completeTaskTimer = useCallback((id: string) => {
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
  }, []);
  
  // addSubtask is already wrapped in useCallback
  const addSubtask = useCallback((parentId: string, title: string): string => {
    // Get parent task to inherit properties
    const parentTask = tasks.find(t => t.id === parentId); // Reads tasks state
    
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
    
    // Update tasks with the new subtask - localStorage save is handled by the useEffect
    setTasks(prev => {
      const updated = [...prev, newSubtask];
      return updated;
    });
    
    // Return the new subtask ID so we can track it
    return newId;
  }, [tasks]); // Correctly has tasks as a dependency

  // Add new function to move a task under a new parent
  const moveTaskToParent = useCallback((id: string, parentId: string | null) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id
          ? { ...task, parentId }
          : task
      )
    );
  }, []);

  const updateTaskDescription = useCallback((id: string, description: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id
          ? { ...task, description }
          : task
      )
    );
  }, []);

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
