// src/utils/sampleData.ts
import { Task, Category, Project } from '../types';

/**
 * Provides a small set of sample data for new users to get started
 */
export const sampleData: {
  tasks: Task[];
  categories: Category[];
  projects: Project[];
} = {
  tasks: [
    {
      id: 'sample-1',
      title: 'Create first project',
      status: 'pending',
      parentId: null,
      dueDate: null,
      projectId: null,
      categories: ['sample-2'],
    },
    {
      id: 'sample-2',
      title: 'Import your existing tasks',
      status: 'pending',
      parentId: null,
      dueDate: null,
      projectId: 'sample-1',
      categories: ['sample-1'],
    },
    {
      id: 'sample-3',
      title: 'Customize categories',
      status: 'pending',
      parentId: null,
      dueDate: null,
      projectId: 'sample-1',
      categories: ['sample-3'],
    },
  ],
  categories: [
    { id: 'sample-1', name: 'Work', color: '#F59E0B' },
    { id: 'sample-2', name: 'Personal', color: '#10B981' },
    { id: 'sample-3', name: 'NICU', color: '#3B82F6' },
  ],
  projects: [
    {
      id: 'sample-1',
      name: 'Getting Started',
      description: 'Tasks to help you set up your task manager.',
    },
  ],
};

/**
 * Loads sample data into the application
 */
export function loadSampleData(): {
  tasks: Task[];
  categories: Category[];
  projects: Project[];
} {
  localStorage.setItem('tasks', JSON.stringify(sampleData.tasks));
  localStorage.setItem('categories', JSON.stringify(sampleData.categories));
  localStorage.setItem('projects', JSON.stringify(sampleData.projects));
  
  return sampleData;
}