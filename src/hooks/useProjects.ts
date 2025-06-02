import { useState, useEffect, useCallback } from 'react'; // Import useCallback
import { Project, Task } from '../types';

export function useProjects(setTasks: React.Dispatch<React.SetStateAction<Task[]>>) {
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('projects');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  const addProject = useCallback((project: Omit<Project, 'id'>) => {
    const id = Date.now().toString();
    const newProject: Project = { id, ...project };
    setProjects(prev => [...prev, newProject]);
  }, []);

  const updateProject = useCallback((id: string, project: Omit<Project, 'id'>) => {
    setProjects(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, ...project }
          : p
      )
    );
  }, []);

  const deleteProject = useCallback((id: string) => {
    // Remove the project
    setProjects(prev => prev.filter(p => p.id !== id));
    // Clear projectId on associated tasks
    setTasks(prev =>
      prev.map(task =>
        task.projectId === id
          ? { ...task, projectId: null } // Set to null instead of undefined for consistency if DB expects null
          : task
      )
    );
  }, [setTasks]);

  return {
    projects,
    setProjects,
    addProject,
    updateProject,
    deleteProject
  };
}