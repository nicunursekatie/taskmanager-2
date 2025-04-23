import { Task, Category, Project } from './types';

export function loadPreloadedData(): {
  tasks: Task[];
  categories: Category[];
  projects: Project[];
} {
  return {
    tasks: [
      {
        id: 't1',
        title: 'Continue clothing purge from closets',
        status: 'pending',
        parentId: null,
        dueDate: null,
        projectId: 'p1',
        categories: ['c2'],
      },
      {
        id: 't2',
        title: 'Set up sorting system for recycling',
        status: 'pending',
        parentId: null,
        dueDate: null,
        projectId: 'p1',
        categories: ['c2'],
      },
      {
        id: 't3',
        title: 'Finalize NeoBelly trial plan',
        status: 'pending',
        parentId: null,
        dueDate: null,
        projectId: 'p2',
        categories: ['c3'],
      },
    ],
    categories: [
      { id: 'c1', name: 'Work', color: '#F59E0B' },
      { id: 'c2', name: 'Personal', color: '#10B981' },
      { id: 'c3', name: 'NICU', color: '#3B82F6' },
    ],
    projects: [
      {
        id: 'p1',
        name: 'Tackle the Laundry',
        description: 'Handle the laundry bins, sorting, and system setup.',
      },
      {
        id: 'p2',
        name: 'NICU Improvements',
        description: 'Clinical innovations and documentation upgrades.',
      },
    ],
  };
}