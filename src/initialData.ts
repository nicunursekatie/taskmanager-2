import { Category, Project, Task } from './types';

export const initialData: {
  categories: Category[];
  projects: Project[];
  tasks: Task[];
} = {
  categories: [
    { id: '1', name: 'Work', color: '#F59E0B' },
    { id: '2', name: 'Personal', color: '#10B981' },
    { id: '3', name: 'NICU', color: '#3B82F6' }
  ],
  projects: [
    { id: '1745204622380', name: 'Tackle the Laundry', description: 'Organizing laundry system' },
    { id: '1745204622381', name: 'Get CPHQ Certification', description: 'Study and pass certification' },
    { id: '1745204622382', name: 'NICU Improvements', description: 'Projects for NICU enhancement' },
    { id: '1745204622383', name: 'Cancel Shit', description: 'Cancel unnecessary subscriptions' },
    { id: '1745204622384', name: 'Weight Loss', description: 'Track and maintain weight loss goals' },
    { id: '1745204622385', name: 'Plan for Move Back to Fulton', description: 'Planning for relocation' },
    { id: '1745204622386', name: 'Get my $$$ Together', description: 'Financial organization and planning' }
  ],
  tasks: [
    { id: 'task1', title: 'Continue clothing purge from closets', status: 'pending', projectId: '1745204622380', categories: ['2'], dueDate: null, parentId: null },
    { id: 'task2', title: 'Set up sorting system for recycling', status: 'pending', projectId: '1745204622380', categories: ['2'], dueDate: null, parentId: null },
    { id: 'task3', title: 'Designate laundry zones (dirty/clean)', status: 'pending', projectId: '1745204622380', categories: ['2'], dueDate: null, parentId: null },
    
    { id: 'task4', title: 'Finish first coursera course', status: 'pending', projectId: '1745204622381', categories: ['1'], dueDate: null, parentId: null },
    { id: 'task5', title: 'Take Module 3 quiz', status: 'pending', projectId: '1745204622381', categories: ['1'], dueDate: null, parentId: null },
    
    { id: 'task6', title: 'Finalize NeoBelly trial plan (1 month)', status: 'pending', projectId: '1745204622382', categories: ['3'], dueDate: null, parentId: null },
    { id: 'task7', title: 'Build NeoBelly documentation', status: 'pending', projectId: '1745204622382', categories: ['3'], dueDate: null, parentId: null },
    { id: 'task8', title: 'Ask Marie about NICU funding', status: 'pending', projectId: '1745204622382', categories: ['3', '1'], dueDate: null, parentId: null },
    
    { id: 'task9', title: 'Cancel Canvas Pro by May 17', status: 'pending', projectId: '1745204622383', categories: ['2'], dueDate: '2025-05-17T00:00:00', parentId: null },
    { id: 'task10', title: 'Cancel Microsoft 365 monthly', status: 'pending', projectId: '1745204622383', categories: ['2'], dueDate: null, parentId: null },
    
    { id: 'task11', title: 'Add daily iron + B12 tracking', status: 'pending', projectId: '1745204622384', categories: ['2'], dueDate: null, parentId: null },
    { id: 'task12', title: 'Log semaglutide doses (date/time)', status: 'pending', projectId: '1745204622384', categories: ['2'], dueDate: null, parentId: null },
    { id: 'task13', title: 'Create GLP-1 inventory + titration schedule', status: 'pending', projectId: '1745204622384', categories: ['2'], dueDate: null, parentId: null },
    
    { id: 'task14', title: 'List top home contenders near Emory', status: 'pending', projectId: '1745204622385', categories: ['2'], dueDate: null, parentId: null },
    { id: 'task15', title: 'Map drive times from contenders', status: 'pending', projectId: '1745204622385', categories: ['2'], dueDate: null, parentId: null },
    { id: 'task16', title: 'Note pros/cons of Steeplechase vs others', status: 'pending', projectId: '1745204622385', categories: ['2'], dueDate: null, parentId: null },
    
    { id: 'task17', title: 'Track how $14,480 from Schwab was used', status: 'pending', projectId: '1745204622386', categories: ['2'], dueDate: null, parentId: null },
    { id: 'task18', title: 'Create report of true Schwab balance', status: 'pending', projectId: '1745204622386', categories: ['2'], dueDate: null, parentId: null },
    { id: 'task19', title: 'Maintain $25K cash cushion for moving', status: 'pending', projectId: '1745204622386', categories: ['2'], dueDate: null, parentId: null },
    
    { id: 'task20', title: 'Make checklist for mini-shift report', status: 'pending', projectId: null, categories: ['3'], dueDate: null, parentId: null },
    { id: 'task21', title: 'Take next coursera module for CPHQ', status: 'pending', projectId: null, categories: ['1'], dueDate: null, parentId: null },
    { id: 'task22', title: 'Take next coursera module for clinical', status: 'pending', projectId: null, categories: ['1'], dueDate: null, parentId: null }
  ]
};

export function initializeData(): void {
  // Always initialize data, regardless of what's in localStorage
  localStorage.setItem('categories', JSON.stringify(initialData.categories));
  localStorage.setItem('projects', JSON.stringify(initialData.projects));
  localStorage.setItem('tasks', JSON.stringify(initialData.tasks));
}
