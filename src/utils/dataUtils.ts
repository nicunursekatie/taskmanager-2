// src/utils/dataUtils.ts
import { Task, Category, Project } from '../types';

/**
 * Exports all task manager data as a JSON string
 */
export function exportData(): string {
  try {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const categories = JSON.parse(localStorage.getItem('categories') || '[]');
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');

    const exportData = {
      tasks,
      categories,
      projects,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };

    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
}

/**
 * Imports task manager data from a JSON string
 */
export function importData(jsonData: string): {
  tasks: Task[];
  categories: Category[];
  projects: Project[];
} {
  try {
    const data = JSON.parse(jsonData);
    
    // Basic validation
    if (!data.tasks || !Array.isArray(data.tasks)) {
      throw new Error('Invalid tasks data');
    }
    
    if (!data.categories || !Array.isArray(data.categories)) {
      throw new Error('Invalid categories data');
    }
    
    if (!data.projects || !Array.isArray(data.projects)) {
      throw new Error('Invalid projects data');
    }
    
    // Store in localStorage
    localStorage.setItem('tasks', JSON.stringify(data.tasks));
    localStorage.setItem('categories', JSON.stringify(data.categories));
    localStorage.setItem('projects', JSON.stringify(data.projects));
    
    return {
      tasks: data.tasks,
      categories: data.categories,
      projects: data.projects
    };
  } catch (error) {
    console.error('Error importing data:', error);
    throw new Error('Failed to import data. The file may be corrupted or have an invalid format.');
  }
}

/**
 * Downloads data as a JSON file
 */
export function downloadData(filename = 'taskmanager-export.json'): void {
  const jsonData = exportData();
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  
  // Cleanup
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
}

/**
 * Clears all data from localStorage
 */
export function clearAllData(): void {
  localStorage.removeItem('tasks');
  localStorage.removeItem('categories');
  localStorage.removeItem('projects');
}