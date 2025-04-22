// src/hooks/useTasks.ts
import { useState, useEffect } from 'react';

export type Task = {
  id: string;
  title: string;
  dueDate?: string | null;
  status: 'pending' | 'done';
};

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

  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask: Task = { id: Date.now().toString(), ...task };
    setTasks(prev => [...prev, newTask]);
  };

  const toggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === id
          ? { ...t, status: t.status === 'pending' ? 'done' : 'pending' }
          : t
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  return { tasks, addTask, toggleTask, deleteTask };
}