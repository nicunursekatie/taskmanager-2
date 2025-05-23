import { useState, useEffect } from 'react';
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

  const addProject = (project: Omit<Project, 'id'>) => {
    const id = Date.now().toString();
    const newProject: Project = { id, ...project };
    setProjects(prev => [...prev, newProject]);
  };

  const updateProject = (id: string, project: Omit<Project, 'id'>) => {
    setProjects(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, ...project }
          : p
      )
    );
  };

  const deleteProject = (id: string) => {
    // Remove the project
    setProjects(prev => prev.filter(p => p.id !== id));
    // Clear projectId on associated tasks
    setTasks(prev =>
      prev.map(task =>
        task.projectId === id
          ? { ...task, projectId: null }
          : task
      )
    );
  };

  return {
    projects,
    setProjects,
    addProject,
    updateProject,
    deleteProject
  };
}