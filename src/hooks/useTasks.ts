// src/hooks/useTasks.ts
// Update your existing useTasks.ts hook to include context handling

import { useState, useEffect } from 'react';
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
    setTasks(prev => prev.filter(t => t.id !== id && t.parentId !== id));
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
  
  // Add new function for subtasks
  const addSubtask = (parentId: string, title: string) => {
    // Get parent task to inherit properties
    const parentTask = tasks.find(t => t.id === parentId);
    
    if (!parentTask) {
      console.error("Parent task not found");
      return;
    }
    
    // Create a new subtask with inherited properties
    const newSubtask: Task = {
      id: Date.now().toString(),
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
    
    setTasks(prev => [...prev, newSubtask]);
  };

  return { 
    tasks, 
    addTask, 
    toggleTask, 
    deleteTask, 
    updateTask, 
    addSubtask,
    updateTaskContext,
    updateTaskPriority,
    updateTaskEstimate
  };
}